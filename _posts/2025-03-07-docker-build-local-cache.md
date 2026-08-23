---
layout: post
title: "[Docker] Docker driver로 로컬 캐시 빌드하기"
subtitle: "[Docker] docker driver 를 사용해 로컬캐시로 빌드하기"
categories: programming
tags: devops
comments: true
---

{% raw %}

docker 빌드시에는 driver를 선택할 수 있는데
- docker driver:
  - Docker 데몬 내장 빌더를 사용하여 빌드하며, 기본적으로 --load 플래그가 암묵적으로 적용되어 빌드된 이미지가 바로 로컬 Docker 이미지 목록에 나타남
  - 다만, 다중 플랫폼 이미지 빌드나 캐시 내보내기(exporting cache)는 지원되지 않음
- docker-container driver (default) :
  - Docker로 스폰되는 BuildKit 컨테이너를 사용
  - **다중 플랫폼 이미지 빌드**와 **빌드 캐시 내보내기** 기능을 지원
    - 예를 들어, 한 번의 빌드로 linux/amd64, linux/arm64 등 여러 아키텍처에 맞는 이미지를 생성
    - 또한, 빌드 캐시를 내보내면 이후 빌드 시에 캐시를 활용하여 빌드 속도를 향상시킬 수 있습니다.
  - 다만, docker driver와 달리 빌드된 이미지가 자동으로 로컬 Docker 이미지 목록에 나타나지 않으므로, 만약 로컬에 이미지가 필요하다면 build --load 옵션을 명시적으로 사용
위와 같은 차이점이있다.

ml 이미지의 경우 용량이 꽤 크서 docker-container의 빌드캐시는 캐시저장/로드에 시간이 더 걸려서 시간적 이득이 없음을 확인했었다.
또한 공용으로 사용하는 base image를 사용하기 위해 명시적으로 tar파일로 이미지를 한번 저장해서 `--load` 후 해당 파일을 push하고 있었는데, 이런상황이라면 docker driver를 사용해 캐시된 로컬 docker image를 사용하는것이 더 이득이다.

아래 예시와 같이 사용할 수 있다.

```yaml
name: qwen
on:
  workflow_dispatch:
  push:
    paths:
      - 'common/**'
      - 'qwen/**'
    branches:
      - main
      - develop
  pull_request:
    paths:
      - 'common/**'
      - 'qwen/**'
    branches:
      - main
      - develop
      - feature/example
jobs:
  build:
    runs-on: [self-hosted, linux-x64]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        with:
          # host의 로컬 캐시를 공유하기 위해 docker 드라이버를 사용
          driver: docker

      # base image 저장소의 자격증명으로 pull
      - name: Login for Base Image
        uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: base-image-reader
          password: ${{ secrets.BASE_REGISTRY_TOKEN }}

      - name: Pull Base Image
        run: docker pull registry.example.com/base/python-gpu:3.11

      # 최종 image 저장소의 자격증명으로 전환
      - name: Login for Final Image
        uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: app-image-writer
          password: ${{ secrets.APP_REGISTRY_TOKEN }}

      - name: Build metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: registry.example.com/apps/qwen
          flavor: |
            latest=false
          tags: |
            type=match,pattern=qwen-(.*),group=1,priority=1000
            type=match,pattern=all-(.*),group=1,priority=1000
            type=ref,event=pr,prefix=pr-,enable=true,priority=600
            type=ref,event=branch,enable=true,priority=600

      # tar 파일 없이 바로 push, pull: false 옵션으로 base image 재조회 방지
      - name: Build and Push Image
        uses: docker/build-push-action@v4
        with:
          file: qwen/dockerfile
          context: .
          tags: ${{ steps.meta.outputs.tags }}
          push: true
          pull: false

      - name: Sign images
        uses: example-org/sign-container-images@v2
        with:
          tags: ${{ steps.meta.outputs.tags }}

```

{% endraw %}
