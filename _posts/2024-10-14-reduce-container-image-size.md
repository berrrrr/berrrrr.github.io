---
layout: post
title: "[Docker] 컨테이너 이미지 사이즈 줄이기"
subtitle: "작은 base image부터 multi-stage build와 BuildKit cache까지"
categories: programming
tags: devops
comments: true
---

컨테이너 이미지를 줄여야겠다고 생각했을 때 가장 먼저 떠오른 방법은 `alpine`으로 base image를 바꾸는 것이었다. 그런데 직접 줄여보니 base image만 바꾸는 것으로는 부족했다.

- 빌드 도구가 최종 이미지에 남아 있고
- package manager의 cache가 layer에 들어가 있고
- 소스 코드를 먼저 `COPY`해서 매번 의존성을 다시 설치하고
- 필요 없는 파일까지 build context에 포함하면

이미지도 커지고 빌드도 느려진다.

이번에 다시 정리해보면서 알게 된 건 **최종 이미지 크기**와 **빌드 cache**는 분리해서 생각해야 한다는 것이었다. cache는 빌드를 빠르게 만드는 데 필요하지만, 실행할 이미지 안에까지 들어갈 필요는 없다.

## 왜 줄여야 할까

이미지가 작아지면 단순히 registry 용량만 줄어드는 게 아니다.

- CI에서 push하고 배포 환경에서 pull하는 시간이 줄어든다.
- 새 node에서 pod를 시작할 때 대기 시간을 줄일 수 있다.
- 최종 이미지에 들어가는 package와 도구가 줄어 attack surface도 작아진다.
- 어떤 파일이 실행 환경에 필요한지 더 명확해진다.

그런데 **작을수록 무조건 좋은 것은 아니다.** 디버깅에 필요한 정보, CA 인증서, timezone data, 실행 중 필요한 공유 라이브러리까지 없애면 운영이 어려워진다. 목표는 “가장 작은 이미지”가 아니라 **필요한 것만 들은 재현 가능한 이미지**다.

## 1. 먼저 측정하기

어느 layer가 크기를 많이 차지하는지 보지 않고 Dockerfile을 바꾸면 감으로 최적화하게 된다.

```bash
docker image ls my-app
docker history --no-trunc my-app:latest
docker image inspect my-app:latest
```

여기서 조심할 점은 크기의 의미가 하나가 아니라는 것이다.

- 로컬의 `docker image ls`에서 보는 크기
- registry에서 압축된 layer를 pull할 때의 전송량
- 다른 이미지와 공유하는 layer를 제외한 실제 추가 저장 용량

이 값들은 서로 다를 수 있다. 비교할 때는 같은 플랫폼과 같은 빌드 조건을 사용하고, 크기와 빌드 시간을 함께 기록하는 편이 좋다.

## 2. base image는 작은 것보다 맞는 것을 고르기

Python을 예로 들면 대략 다음 선택지가 있다.

- `python:<version>`: 개발 도구와 OS package가 비교적 많아 편하지만 크다.
- `python:<version>-slim`: 불필요한 package를 많이 제거한 Debian 기반 이미지. 보통 운영 이미지의 시작점으로 삼기 좋다.
- `python:<version>-alpine`: 크기는 더 작을 수 있지만 musl libc를 사용한다.

예전에는 “Python이면 Alpine을 쓰지 말자”고 단정해서 적어두었는데, 지금 다시 보면 너무 강한 표현이었다. Alpine이 잘 맞는 애플리케이션도 있다. 다만 native extension이 많은 Python package를 사용하면 glibc를 기대하는 wheel을 쓰지 못해 직접 컴파일하거나 추가 라이브러리를 설치해야 할 수 있다. 결과적으로:

- 빌드 시간이 더 길어지고
- Dockerfile이 복잡해지며
- 추가 package 때문에 최종 크기 차이가 줄어들 수 있다.

그래서 내 기준은 이렇다.

1. 먼저 현재 지원되는 `slim` 계열을 시작점으로 삼는다.
2. 버전과 OS variant를 명시해 예상하지 못한 변경을 줄인다.
3. Alpine은 의존성 설치, 실행 속도, 이미지 크기를 실제로 측정한 뒤 선택한다.
4. 너무 작은 runtime image를 쓴다면 CA certificate, timezone, 공유 라이브러리가 충분한지 확인한다.

tag는 바뀌지 않아도 가리키는 이미지가 바뀔 수 있다. 재현성이 중요하면 digest까지 pin하는 방법을 고려하되, 보안 패치를 받을 수 있도록 정기적으로 base image를 업데이트하고 재빌드해야 한다.

## 3. build context부터 줄이기

`COPY . .`는 편하지만, `.dockerignore`가 없으면 로컬의 불필요한 파일까지 builder에 전달된다.

```dockerignore
.git
.github
.idea
.pytest_cache
.venv
__pycache__
*.pyc
*.log
dist
tests
```

이렇게 하면 build context 전송량을 줄일 수 있고, 불필요한 파일이 `COPY`의 cache를 무효화하는 것도 막을 수 있다. 단, `tests`를 이미지 빌드 중 실행한다면 무조건 제외하면 안 된다. 프로젝트에 필요한 파일을 기준으로 조정해야 한다.

## 4. layer의 특성 이해하기

Docker image는 layer의 집합이다. 앞 layer에서 큰 파일을 만든 뒤 다음 layer에서 지운다고 해서 이미 만들어진 layer의 크기가 사라지지는 않는다.

예를 들어 아래 Dockerfile은 apt 목록을 다음 layer에서 지운다.

```docker
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

최종 filesystem에서는 보이지 않을 수 있지만, 앞 layer에는 남아 있다. 설치와 정리를 한 `RUN`에서 처리해야 한다.

```docker
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

`--no-install-recommends`로 필수가 아닌 추천 package의 자동 설치도 줄일 수 있다. `apt-get update`와 `apt-get install`을 같은 `RUN`에 두는 것은 오래된 package index layer가 재사용되는 문제를 피하는 데도 도움이 된다.

## 5. package cache: 이미지에서는 빼고, 빌드에서는 재사용하기

예전 글에는 다음과 같은 설정이 있었다.

```docker
ENV PIP_NO_CACHE_DIR false
```

이건 cache를 비활성화하는 설정이 아니다. 오히려 `false`는 pip cache를 사용하게 만들 수 있다. 정말 단순하게 최종 이미지에 cache를 남기고 싶지 않다면 다음처럼 사용할 수 있다.

```docker
RUN pip install --no-cache-dir -r requirements.txt
```

그런데 이렇게만 하면 빌드 layer가 무효화될 때 package를 모두 다시 받아야 한다. BuildKit cache mount를 쓰면 cache를 최종 layer에 포함하지 않으면서도 다음 빌드에서 재사용할 수 있다.

```docker
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

이 cache mount의 목적은 **빌드 속도**다. mount의 내용은 최종 이미지 layer에 들어가지 않는다. 같은 원리로 apt, npm, Go module, Cargo 등의 cache도 외부에 유지할 수 있다.

## 6. 의존성 파일을 소스보다 먼저 복사하기

다음 구조에서는 소스 파일 하나만 바뀌어도 `COPY . .` layer 이후의 의존성 설치가 다시 실행된다.

```docker
COPY . .
RUN pip install -r requirements.txt
```

의존성 정의를 먼저 복사하면 source code만 변경됐을 때 package 설치 layer를 재사용할 수 있다.

```docker
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY src/ ./src/
```

이 방법은 최종 이미지 크기보다 일상적인 빌드 시간을 크게 줄여준다.

## 7. multi-stage build로 빌드 도구 버리기

native extension을 빌드하려면 compiler와 header package가 필요할 수 있다. 하지만 이 도구들은 실행 시점에는 필요 없다. multi-stage build를 사용하면 builder에서만 wheel을 만들고, runtime에는 산출물만 복사할 수 있다.

```docker
# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim-bookworm AS builder
WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel --wheel-dir=/wheels -r requirements.txt


FROM python:${PYTHON_VERSION}-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* \
    && rm -rf /wheels

COPY src/ ./src/

RUN useradd --create-home appuser
USER appuser

CMD ["python", "-m", "src.main"]
```

builder의 `build-essential`과 임시 파일은 runtime image에 들어오지 않는다. 단, wheel이 실행 시점에 필요로 하는 OS shared library는 runtime stage에 따로 설치해야 한다. 예를 들어 DB driver가 `libpq`를 필요로 한다면 컴파일러는 빼더라도 runtime library는 남겨야 한다.

## 8. 빌드 secret은 layer에 남기지 않기

private package registry를 사용할 때 credential을 `ARG`나 `ENV`로 넘기면 image metadata나 build history에 노출될 수 있다. BuildKit secret mount를 사용하면 해당 `RUN`이 실행되는 동안만 파일을 제공할 수 있다.

```docker
RUN --mount=type=secret,id=pip_config,target=/etc/pip.conf \
    --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

```bash
docker build \
  --secret id=pip_config,src=$HOME/.config/pip/pip.conf \
  -t my-app:latest .
```

이건 이미지 크기보다 보안 문제에 가깝지만, 최종 layer에 불필요한 credential 파일을 남기지 않는다는 같은 원칙이 적용된다.

## 실전 체크리스트

- 지원 중인 작은 base image를 사용했는가?
- Alpine을 사용했다면 musl 호환성과 native dependency를 실제로 검증했는가?
- `.dockerignore`로 build context를 제한했는가?
- package index와 임시 파일을 생성한 같은 layer에서 정리했는가?
- 의존성 파일을 source code보다 먼저 `COPY`했는가?
- package cache를 최종 layer에 넣기보다 BuildKit cache mount로 분리했는가?
- compiler, header, test tool을 multi-stage build의 builder에만 두었는가?
- 실행에 필요한 shared library와 CA certificate는 남겨두었는가?
- build secret을 `ARG`, `ENV`, `COPY`로 image에 넣지 않았는가?
- 최적화 전·후의 크기, build time, startup time을 같은 조건에서 측정했는가?

## 결론

이미지 사이즈를 줄이는 가장 큰 포인트는 “더 작은 Linux를 고르기”가 아니었다.

1. 실행에 필요한 것과 빌드에만 필요한 것을 나누고,
2. cache를 최종 이미지 밖에서 재사용하고,
3. Docker layer의 특성에 맞게 설치와 정리를 하며,
4. 최적화 결과를 실제로 측정하는 것

이 더 중요했다. 우선 `slim` 기반으로 구조를 정리하고, 그런 뒤에도 크기가 실제 문제일 때 Alpine이나 더 최소화된 runtime image를 검토하는 순서가 안전하다.

## 참고 자료

- [Docker build best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker build cache optimization](https://docs.docker.com/build/cache/optimize/)
- [Dockerfile reference: RUN --mount](https://docs.docker.com/reference/dockerfile/#run---mount)
- [Python Docker Official Image](https://hub.docker.com/_/python)
