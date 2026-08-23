---
layout: post
title: "[Python] S3 파일을 비동기로 다운로드하면 더 빠를까?"
subtitle: "aioboto3의 효과와 file I/O 병목 정리"
categories: programming
tags: python
comments: true
---

`aioboto3`로 S3 파일을 다운로드하면 무조건 빠를 줄 알았는데, 실제로 써보니 단일 파일에서는 크게 이득이 없었다. 다시 생각해보면 자연스런 결과였다.

S3 다운로드에는 서로 다른 대기 구간이 있다.

1. S3에 요청하고 응답을 기다리는 **network I/O**
2. 받은 바이트를 로컬 파일에 저장하는 **file I/O**

`asyncio`는 첫 번째 같은 네트워크 대기 시간을 잘 활용한다. 하나의 요청이 응답을 기다리는 동안 다른 요청을 진행할 수 있기 때문이다. 하지만 로컬 파일 쓰기는 운영체제와 디스크에 의존하는 blocking I/O인 경우가 많다. 비동기 파일 라이브러리도 내부적으로는 thread pool에 작업을 넘기는 방식을 자주 사용한다.

즉, `async`라고 해서 디스크 자체가 빨라지는 것은 아니다.

## 언제 효과가 있을까

### 효과를 보기 쉬운 경우

- 작은 S3 object 여러 개를 동시에 다운로드할 때
- API server가 S3 응답을 기다리는 동안 다른 요청도 계속 처리해야 할 때
- 다운로드한 데이터를 디스크에 저장하지 않고 HTTP response로 바로 streaming할 때

### 효과가 작거나 없을 수 있는 경우

- 파일 하나만 다운로드할 때
- 디스크 쓰기 속도가 이미 병목일 때
- 네트워크 대역폭을 이미 다 사용하고 있을 때
- S3 연결 풀, API rate, CPU, memory 중 다른 자원이 먼저 한계에 닿을 때
- 하나의 큰 object를 다운로드하면서 SDK의 multipart 전송이 이미 병렬 요청을 사용하고 있을 때

특히 마지막 경우가 중요하다. `boto3`의 `download_file()`은 managed transfer를 사용하며, 큰 object는 multipart로 나눠 다운로드할 수 있다. `TransferConfig`의 `max_concurrency`로 동시 전송 수도 조절할 수 있다. 단일 object의 전송 성능만 필요하다면 일단 이 기능을 확인하는 것이 낫다.

## 기존 코드에서 놓친 점

기존에는 `download_file()` coroutine을 list에 담기만 했다.

```python
tasks = [client.download_file(...) for obj in objects]
```

coroutine을 만들었다고 자동으로 실행되는 것은 아니다. `await asyncio.gather(*tasks)`로 기다리거나 `TaskGroup`에 등록해야 실제로 스케줄된다.

그런데 object가 수천 개라면 coroutine을 한 번에 수천 개 만드는 것도 좋지 않다. 연결 수와 메모리 사용량을 제어하려면 `Semaphore`로 동시성을 제한하는 편이 안전하다.

## aioboto3로 여러 object 받기

```python
import asyncio
from pathlib import Path

import aioboto3


BUCKET = "example-bucket"
MAX_CONCURRENCY = 8


async def list_object_keys(client, prefix: str) -> list[str]:
    paginator = client.get_paginator("list_objects_v2")
    keys = []

    async for page in paginator.paginate(Bucket=BUCKET, Prefix=prefix):
        keys.extend(obj["Key"] for obj in page.get("Contents", []))

    return keys


async def download_objects(prefix: str, output_dir: Path) -> None:
    session = aioboto3.Session()
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

    async with session.client("s3", region_name="ap-northeast-2") as client:
        keys = await list_object_keys(client, prefix)

        async def download_one(key: str) -> None:
            # basename만 쓰면 같은 파일명이 덮어쓰여질 수 있어
            # S3 key의 디렉터리 구조를 그대로 보존한다.
            destination = output_dir / key
            destination.parent.mkdir(parents=True, exist_ok=True)

            async with semaphore:
                await client.download_file(
                    Bucket=BUCKET,
                    Key=key,
                    Filename=str(destination),
                )

        await asyncio.gather(*(download_one(key) for key in keys))


asyncio.run(download_objects("images/", Path("downloads")))
```

credential은 코드에서 직접 환경 변수를 읽어 넘기기보다 boto3의 기본 credential provider chain에 맡겼다. 로컬에서는 AWS profile, 운영 환경에서는 IAM role을 사용하면 같은 코드를 그대로 유지할 수 있다.

Python 3.11 이상이라면 `asyncio.gather()` 대신 `TaskGroup`을 사용해, 하나의 작업이 실패했을 때 나머지 작업도 취소되는 구조를 만들 수 있다.

## 동시성은 높을수록 좋을까

당연히 아니다. `MAX_CONCURRENCY` 값을 크게 설정하면 다음 문제가 생길 수 있다.

- S3 connection pool 경쟁
- 소켓과 file descriptor 고갈
- 디스크 random write 증가
- 메모리 사용량 증가
- S3 throttling과 retry 증가

그래서 4, 8, 16 정도의 작은 값부터 시작해 object 크기, 개수, network, disk 환경에서 직접 측정하는 것이 좋다. 확인할 값은 전체 시간만이 아니다.

- 초당 처리한 object 수와 byte 수
- object 하나의 p95 다운로드 시간
- retry와 error 수
- 프로세스의 CPU·memory 사용량
- 디스크 utilization과 write throughput

## 결론

`aioboto3`의 장점은 파일 하나를 마법처럼 빠르게 받는 것이 아니다. **S3 응답을 기다리는 동안 다른 일을 진행할 수 있게 하는 것**이 핵심이다.

따라서:

- 단일 파일이라면 동기 `boto3.download_file()`로도 충분할 수 있다.
- 하나의 큰 파일은 먼저 `TransferConfig`의 multipart와 concurrency를 확인한다.
- 여러 파일을 받거나 이미 async 기반인 서비스라면 `aioboto3`가 유용할 수 있다.
- file I/O가 병목이라면 async만으로는 해결되지 않는다.

결국 비동기 전환 전·후의 실제 workload를 benchmark해보는 게 가장 확실하다.

## 참고 자료

- [aioboto3 S3 usage](https://aioboto3.readthedocs.io/en/latest/usage.html#s3-examples)
- [Boto3 S3 transfer configuration](https://docs.aws.amazon.com/boto3/latest/guide/s3.html#file-transfer-configuration)
- [Python asyncio: coroutines and tasks](https://docs.python.org/3/library/asyncio-task.html)
