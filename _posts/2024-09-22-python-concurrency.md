---
layout: post
title: "[Python] 파이썬 동시성 프로그래밍"
subtitle: "[Python] 파이썬 동시성 프로그래밍"
categories: programming
tags: python
comments: true
---

**파이썬 동시성 프로그래밍**
- concurrent: existing, happening, or done at the same time.

## Bound

### CPU bound

CPU를 활용하는 작업에 따라 기다리게 되는 구간
예시: 수학 연산, 딥러닝 연산, 이미지처리 등

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-concurrency/01.png?raw=true)

### I/O bound

I/O 작업에 대해서 기다리는 구간
예시: 파일 입출력, 네트워크 요청 등

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-concurrency/02.png?raw=true)

## Process vs Thread

### Process

- 사전적 의미: 컴퓨터에서 연속적으로 실행되고 있는 컴퓨터 프로그램, 운영체제로부터 시스템 자원을 할당받는 작업의 단위

### Thread

- 사전적 의미: 프로세스 내에서 실행되는 여러 흐름의 단위

### Process & Thread in Flask

- flask에서는 `threaded` 옵션을 활성화 할 수 있으며 활성화 될 경우 입력으로 들어오는 여러 request들이 멀티 스레딩으로 동시에 처리됨
- gunicorn의 worker 옵션을 활용하여, worker 갯수를 조절할 수 있으며 이 때 worker는 process와 동일한 개념이라 생각하면 됨.
  - 늘어난 worker는 ps 명령어로 확인 시, 여러 개의 process가 보이는 것을 확인할 수 있음

### Process & Thread in FastAPI

- fastapi에서는 async로 동작하게 되면 1개의 thread만 동작하고, sync로 구현하게 되면 multi-threading으로 동작하며 40개의 thread가 돌 수 있도록 설정되어 있음
- uvicorn의 worker 옵션을 활용하여, worker 갯수를 조절할 수 있으며 process가 그만큼 추가로 생성됨

### Process & Thread in JAVA

- 자바에는 프로세스가 없고 스레드만 존재하며, 자바의 thread는 JVM에서 스케줄링되는 작업 단위를 뜻함
- JVM에서는 여러 개의 core를 사용할 수 있도록 구성되어 thread를 여러 개의 core에 각각 할당하여 병렬처리를 할 수 있음

## Sync vs Async

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-concurrency/03.png?raw=true)

### Sync

sync는 동기를 뜻하고, sync로 코드를 구현하게 되면 코드가 순차적으로 실행

### Async

Async는 비동기를 뜻하고, 작업이 차례가 왔을 때 마다 실행

### why Async?

- sync에서 thread 기반으로 돌 경우, thread가 돌다가 중간 중간 멈춰서 context를 switching하는 시간이 필요한데, async의 경우 그런 시간이 없어서 속도에서 이득을 볼 수 있음
- async의 경우 코드에서 blocking이 없기 때문에 한 번에 많은 task를 실행할 수 있는 장점이 있음

### Asynchronous programming in python

- 기본으로 탑재되어 있는 asyncio 라이브러리를 활용하면 비동기 코딩을 할 수 있음
- async def로 함수를 선언하고, 비동기 로직에 대해서는 await를 사용

<details markdown="1">

<summary>example</summary>

  ```python
import asyncio

async def main():
    print('Hello ...')
    await asyncio.sleep(1)
    print('... World!')

if __name__ == "__main__":
    asyncio.run(main())
  ```

</details>

## Concurrent Programming in Python

### GIL(Global Interpreter Lock)

python은 GIL을 기반으로 한 번에 하나의 thread만 동작할 수 있음

### Multi Threading

GIL의 영향으로, 한 번에 하나의 Thread만 실행
I/O bound 작업에 대해서는 문제 없지만, CPU bound 작업은 한 번에 하나의 Thread만 실행되어 thread의 효과가 전혀 없음
CPU 코어는 1개만 사용

### Multi Processing

process가 여러개 실행되는 구조로, 각 Process가 GIL을 별도로 가지기 때문에 CPU bound 작업에 대해서도 동시에 작업을 할 수 있음
CPU 코어를 process 갯수 만큼 사용

### Asyncio

비동기를 지원하여, I/O bound 작업들이 동시에 실행되게 됩니다.
비동기의 특성에 따라 CPU bound 작업은 동시에 실행되지 않습니다.
CPU 코어는 1개만 사용하게 됩니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-concurrency/04.png?raw=true)

## Expected Questions

#### FastAPI vs Flask

- 통상적으로 Async로 구현된 경우, thread의 context switching이 없어서 좀 더 빠른 성능을 내므로 FastAPI가 성능면에서 우월
- FastAPI는 Type을 지원하여 Request의 입력을 자동으로 검증해주고, human error를 줄일 수 있으며 Type 기반의 쉽고 편한 swagger 기능 제공

#### GIL의 영향으로 하나에 한 번만 돌 수 있고 python의 process는 하나의 core만 사용할 수 있으면, CPU로 모델 서빙을 할 때는 1개의 core로 한 번에 하나만 돌 수 있는 것인가?

- 한 번에 하나만 돌 수 있는 건 맞지만, 모델 서빙 라이브러리들이 내부에는 C++로 구현이 되어있고 병렬처리가 잘 구현이 되어 있어서 최대의 CPU를 모두 활용할 수 있게 구현되어 있음
