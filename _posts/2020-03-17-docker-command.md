---
layout: post
title: 자주쓰는 Docker 명령어 정리
subtitle: 자주쓰는 Docker 명령어 정리
categories: Programming
tags: infra
comments: true
---


```
docker build
```
이미지를 빌드한다
---

```
docker run
```
이미지를 실행한다
---


```
docker images
```
이미지 목록
---


```
docker ps
```
떠있는 컨테이너 목록
---


```
docker ps -a
```
멈춰있는 컨테이너 목록
---


```
docker start <container id>
```
컨테이너 실행
---


```
docker attach <container id>
```
컨테이너 접속 (shell 띄움)
---


```
docker stop <container id>
```
컨테이너 중지
---


```
docker rm <container id>
```
컨테이너 삭제
---


```
docker rmi <image id>
```
이미지 삭제
---



```
docker login <repository url>
```
특정 repository에 접속
---



```
docker push
```
이미지를 repository에 업로드한다
---


```
docker tag <image id> <image tag>
```
이미지를 repository에 업로드한다

---