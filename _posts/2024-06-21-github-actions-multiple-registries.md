---
layout: post
title: "[GitHub Actions] 하나의 workflow에서 여러 registry 사용하기"
subtitle: "[GitHub Actions] 하나의 workflow에서 여러 registry 사용하기"
categories: programming
tags: devops
comments: true
---

{% raw %}

### 완전 별개의 multiple registry 인 경우

이런 경우는 매우 심플하다

```yaml
name: ci

on:
  push:

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            user/app:latest
            user/app:1.0.0
            ghcr.io/user/app:latest
            ghcr.io/user/app:1.0.0
```

[https://docs.docker.com/build/ci/github-actions/push-multi-registries/](https://docs.docker.com/build/ci/github-actions/push-multi-registries/)
여기에 나와있는 예제처럼, 로그인을 2번하면 `build and push` 스텝에서 알아서 push를 두번 때려준다.

### 동일 registry의 다른 인증정보 인 경우

이건 사실 multi registry라고 봐야하는지 애매한데,
나의경우는 registry는 동일하지만 A레포에서 base image를 pull 받아서 이미지를 빌드한 뒤,
B레포에 결과 이미지를 push해야했다.
이때 A레포와 B레포의 로그인정보는 별개였다.
`build and push` action을 보면 빌드한 결과물을 바로 푸쉬하고있는데, 이부분때문에 해결하는걸 애먹었다.

```yaml
name: Consumer GPU - Docker Image CI

on:
  workflow_dispatch:
  release:
    types: [ published ]
  push:
    branches:
      - develop
      - main
  pull_request:
    branches:
      - develop
      - main
jobs:
  build:
    runs-on: [self-hosted, linux-x64]
    steps:

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Pull DockerHub
        uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: base-image-reader
          password: ${{secrets.BASE_REGISTRY_TOKEN}}

      - name: Checkout
        uses: actions/checkout@v2

      - name: Build metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: registry.example.com/apps/consumer-gpu

      - name: Build Image
        uses: docker/build-push-action@v6
        with:
          file: dockerfiles/dockerfile-consumer
          context: .
          tags: ${{ steps.meta.outputs.tags }}
          outputs: type=docker,dest=/tmp/image.tar

      - name: Login to Push DockerHub
        uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: app-image-writer
          password: ${{secrets.APP_REGISTRY_TOKEN}}

      - name: Push image
        run: |
          docker load --input /tmp/image.tar
          docker push ${{ steps.meta.outputs.tags }}

      - name: Sign images
        uses: example-org/sign-container-images@v1
        with:
          tags: ${{ steps.meta.outputs.tags }}

```

이런식으로
1. A repo 로그인
2. docker build.
3. 이때 build 결과물은 push하지 않고, local에 저장함. (`outputs` 에 `dest` 설정해주면 됨)
4. B repo 로그인
5. `docker load`로 로컬에 저장된 파일을 불러옴
6. docker push.
하면 build와 push를 분리해서 수행할 수 있다!

{% endraw %}
