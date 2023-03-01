---
layout: post
title: 도커(Docker)와 쿠버네티스(Kubernetes)
subtitle: 도커(Docker)와 쿠버네티스(Kubernetes)
categories: programming
tags: devops
comments: true
---

도커(Docker)와 쿠버네티스(Kubernetes) 3줄정리

## 도커(Docker)란?
컨테이너기술이다.. 내가 깔고싶은 프로그램만 쏙쏙 골라서 컨테이너 쌓듯이 쌓아서 이미지라는 아이로 말아서 여기저기 쉽게 배포할수있게 만들어주는 기술이다. 
도커 이전에는 깔고싶은것만 깔수없고, 깔고싶은걸 구동하기위한 os까지 깔앗어야했다. 

## 쿠버네티스(Kubernetes)란?
하지만.. 이 편한 도커 컨테이너도. 서버 100대에 배포를 한다고 하면? 100번의 도커 배포 명령어를 각 서버에 들어가서 쳐야함. 
명령어 1번 쳐서 서버 100대에 도커이미지가 자동 배포되게 하고,
자동으로 장애난 서버는 정상 서버로 옮겨서 실행되고,
자원이 부족하다면 자동으로 scale out 하는 등, 
컨테이너 무더기(cluster)를 보다 자동화하여서 편하게 관리하겠다는 개념이 컨테이너 오케스트레이션(Orchestration) 이라고 보면 된다.  