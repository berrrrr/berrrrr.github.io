---
layout: post
title: 'JEUS 클러스터 설정/배포'
subtitle: 'JEUS 클러스터 설정/배포방법'
categories: programming
tags: infra
comments: true
---
> JEUS 클러스터 설정/배포방법

## 공통 Session 설정

1. 좌측 메뉴바의 `Session` 탭 선택 
2. ⑴ Default 기본 옵션 선택 

## Cluster 생성

1. 좌측 메뉴바의 `Clusters` 탭 선택
2. 클러스터 `ADD` 작업을 수행
3. 생성할 클러스터의 이름을 지정하고 클러스터로 묶을 'JEUS 서버'들을 선택. (※ 이 때, 선택되는 'JEUS 서버'는 꺼져있는 상태이어야만 하며, 연관된 Application이 없어야함. 사전에 `remove target` 을 수행)

## 클러스터 환경에서의 Applicaion 재배포 방법

1. 기존 어플리케이션 war파일이 들어있는 폴더에 새로운 war 파일을 덮어씌운다.
2. `Servers` 탭에 들어간 후, 해당 클러스터에 묶인 'JEUS 서버'들을 순차적으로  stop → start 작업을 수행 
(※ 둘 중 하나의 'JEUS 서버'가 꺼졌더라도 남아있는 WAS가 그 시점 이후의 요청들을 대신 받아 처리.
이 때, 남아있는 WAS는 기존에 생성(꺼진 WAS가 생성했던)되어 있던 사용자의 'sessionID'를 추적할 수 있으므로 사용자의 연결은 유지됨.)
