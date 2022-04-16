---
layout: post
title: "github action으로 springboot-maven프로젝트 CD 하기"
subtitle: "github action으로 springboot-maven프로젝트 CD 하기"
categories: programming
tags: infra
comments: true
---


지난 시리즈에 이어.. deploy까지 성공했다 

```yaml
name: Java CI with Maven

on:
  workflow_dispatch:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          java-version: '11'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn -B package --file pom.xml

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v1

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        id: docker_build
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: example/example_be:latest # 본인의 도커에미지를 넣어준다 

      - name: Image digest
        run: echo ${{ steps.docker_build.outputs.digest }}

  deploy:
    needs: build
    name: Deploy
    runs-on: [ self-hosted, label-example-be ]
    steps:
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Docker run
        run: |
          docker ps -q --filter "name=example_be" | grep -q . && docker stop example_be && docker rm -fv example_be
          docker run -d -p 8081:8081 --name example_be --restart always example/example_be:latest
```


우선 내가 배포할 서버에 **github action runner** 를 띄워줘야한다

내 깃헙 repo > Settings > Actions > Runner 에 들어간다 

new self hosted runner 버튼을 눌러 runner를 추가할 준비를한다

![github-action-cd-01.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/github-action-cd-01.png?raw=true)

내가 배포할 서버는 aws linux2 이므로, runner image > linux선택

그럼 깃헙에서 친절하게 어떻게 설치하면되는지 스크립트를 다 띄워준다 

설치하라는대로 다 띄워주고 

`./config.sh` 를 실행하는 부분에서는 몇번 수동으로 입력해줘야하는부분이 나오는데 대부분은 다 엔터눌러서 default  설정해줘도되고  혹은 내가 원하는 값으로 지정해줘도된다 

![github-action-cd-02.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/github-action-cd-02.png?raw=true)

내경우 runner group은 default로,

runner name은 내 어플리케이션명으로 (여러개의 runner를 띄울때 구분하기위한값이라고함)

additional labels에는 runs-on에 써줬던 라벨을 넣어줫다 

그리고 나서 최종

```bash
nohup ./run.sh &
```

위명령어로 백그라운드에 러너를 띄웠더니 githubaction에서 대기타던 deploy 가 성공! 

![github-action-cd-03.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/github-action-cd-03.png?raw=true)

이로서 깃헙액션으로 모든 CI/CD를 완성했다 

## github action yaml파일 해부

```yaml
  deploy:
    needs: build
    name: Deploy
    runs-on: [ self-hosted, label-example-be ]
    steps:
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Docker run
        run: |
          docker ps -q --filter "name=example_be" | grep -q . && docker stop example_be && docker rm -fv example_be
          docker run -d -p 8081:8081 --name example_be --restart always example/example_be:latest
```

CD를 위해 추가한부분은 위와같다

runner가 띄워져있는 서버에서 위 코드를 실행하겠다는것이다 

도커에 build/push되는건 그 이전 스텝에서 완료가되었으므로 서버에서는 기존에 띄워져있는 도커컨테이너를 종료하고, 내가 새로 빌드한 최신 이미지로 새 도커이미지를 띄워주는 스텝만 진행하면된다. 

때문에 steps를 보면, 도커허브에 로그인한 뒤, run에있는 명령어를 실행하는 형식으로 구성되어있다. 

run의 명령어는 기존 도커컨테이너를 종료하고 새로빌드한 이미지를 물고있는 도커컨테이너를 띄우는 명령어이다. 

```bash
docker ps -q --filter "name=example_be" | grep -q . && docker stop example_be && docker rm -fv example_be
docker run -d -p 8081:8081 --name example_be --restart always example/example_be:latest
```

위 명령어 외에 실행할것이 있다면  run 부분에 추가해주면 되겠다. 
