---
layout: post
title: "[GitHub Actions] 도커빌드 빠르게하기"
subtitle: "[GitHub Actions] 도커빌드 빠르게하기"
categories: programming
tags: devops
comments: true
---

단 두줄의 추가로 가능

```yaml
- name: Build and push
  uses: docker/build-push-action@v3
  with:
    context: .
    push: true
    tags: "<registry>/<image>:latest"
    cache-from: type=gha ############ 추가
    cache-to: type=gha,mode=max #####  추가
```

물론, Gradle, Npm install 등 Github actions 자체에서 테스트를 위해 의존성을 설치 할 때에도 캐시를 이용할수있음 

matrix strategy를 사용하는 워크플로우라면 `cache-from`, `cache-to`에 `scope`설정을 추가해주면됨

```yaml
- name: Build and push
  uses: docker/build-push-action@v3
  with:
    context: .
    push: true
    tags: "<registry>/<image>:latest"
    cache-from: type=gha,scope=${{ matrix.param }}
    cache-to: type=gha,mode=max,scope=${{ matrix.param }}
```

[https://github.com/actions/cache#implementation-examples](https://github.com/actions/cache#implementation-examples)