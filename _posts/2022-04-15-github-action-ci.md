---
layout: post
title: "github action으로 springboot-maven프로젝트 CI 하기"
subtitle: "github action으로 springboot-maven프로젝트 CI 하기"
categories: programming
tags: devops
comments: true
---

수동으로 도커빌드를 하고있어서 코드와 도커이미지와의 싱크도 안맞고..귀찮음도 없앨겸 요즘핫하다는 깃헙액션으로 CI를 하려고 시도함.. 

역시나 이어진 삽질끝에 드디어 성공했따 ㅠㅠ 

## Dockerfile

```yaml
FROM lpicanco/java11-alpine
VOLUME /tmp
ADD target/backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
```

## Workflow

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
        tags: example/example_be:latest   # 본인의 도커이미지 태그
        
    - name: Image digest
      run: echo ${{ steps.docker_build.outputs.digest }}
```

진짜 긴 삽질끝에 완성 ㅠㅠ 왜 삽질했는지는 뒤에서 후술함 

우선 github action workflow는 yaml형식으로 되어있고 각 yaml은 단계별로 어떻게 할지를 의미한다 

쪼개서 보면 다음과 같다 

### 1) on

언제실행할지(조건)를 의미한다 

```yaml
on:
  workflow_dispatch:  # 수동실행하겠음 
  push: # main branch가 푸쉬될때 실행하겠음 
    branches: [ main ]
  pull_request: # main branch가 풀리퀘될때 실행하겠음 
    branches: [ main ]
```

수동실행 `workflow_dispatch`은 붙여놓으면 다른 트리거없이도 깃헙의 action탭에서 버튼을 눌러 workflow를 실행할수있게된다 

### 2) job

수행하는 작업들. 여러개를 정의하면 병렬실행함. 여러 step을 정의할수있음 

```yaml
jobs:
  build:

# 우분투환경에서 실행하겠음 
    runs-on: ubuntu-latest

# repo 체크아웃 
    steps:
    - uses: actions/checkout@v2
    
# JDK 세팅 
    - name: Set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'temurin'
        cache: maven

# maven 빌드
    - name: Build with Maven
      run: mvn -B package --file pom.xml
 
# 도커이미지 사용을 위한 QEMU 세팅     
    - name: Set up QEMU
      uses: docker/setup-qemu-action@v1

# 도커이미지 사용을 위한 buildx 세팅
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v1

# 도커허브 로그인 
    - name: Login to DockerHub
      uses: docker/login-action@v1 
      with:
				# 아래 녀석들은 github settings 탭 > secrets > actions 에 정의
				# docker hub 토큰은 hub.docker.com > account settings > security 에서 발급
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

# 도커허브 빌드 푸쉬
    - name: Build and push
      id: docker_build
      uses: docker/build-push-action@v2
      with:
				# context 설정 해줘야 위에서 maven build한 이미지 가져옴 
        context: .
        push: true
        tags: example/example_be:latest   # 본인의 도커이미지 태그

# 빌드 결과물 출력
    - name: Image digest
      run: echo ${{ steps.docker_build.outputs.digest }}
```

여기서 도커허브 빌드푸쉬하는부분에서 계속 

`/target: no such file or directory` 라는 에러를 뱉으면서 dockerfile에 정의한 jar파일을 못읽는 현상이 발생.. 

겁나 뒤지고 다녔더니 결론은 해당 도커 빌드푸쉬 action을 정의해놓은 [깃헙 readme](https://github.com/docker/build-push-action)에서 발견.. 

빌드 이전단계 파일변경이 무시되기때문에 context를 잡아줘야한다고함 

`context: .` 를 입력해서 path를 잡아주자, 드디어 빌드 성공!! ㅜㅜ 

아마 내가 참고로한 다른예제들은 깃헙도커허브 `registry: [ghcr.io](http://ghcr.io/)` 에 도커이미지를 올리고 그걸 빌드하는방식이라.. 그냥 기본 도커허브([https://hub.docker.com/](https://hub.docker.com/)) 에 빌드푸시하려니 다른점들이 있었던거같다 


> 
> [https://github.com/docker/build-push-action](https://github.com/docker/build-push-action)
>