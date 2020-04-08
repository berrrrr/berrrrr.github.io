---
layout: post
title: HDFS의 구성요소
subtitle: HDFS의 구성요소
categories: datascience
tags: hadoop
comments: true
---

HDFS 의 구성요소를 알아보자

- 하나의 namenode  
- 여러개의 datanode  
- secondary namenode  

HDFS는 master-slave구조로 하나의 네임노드(namenode)와 여러개의 데이터노드(datanode)로 구성된다.
거기에 추가로 fsimage와 edit파일을 주기적으로 합쳐 최신블록의 상태로 파일을 생성하는 역할을 하는  Secondary namenode도 구성요소에 포함된다.


## 네임노드(Namenode)
메타데이터관리와 데이터노드의 관리를 한다.

### 1) 메타데이터 관리
메타데이터(파일 이름, 파일 크기, 생성시간, 접근권한, 소유자 및 그룹소유자, 파일 위치한 블록 정보 등)를 관리한다.  
메타데이터는 파일의 정보와 데이터 블록의 위치를 매핑한 데이터로 Fsimage와 Edits파일에 네임노드로 저장된다.

- Fsimage : 네임스페이스 및 블록의 정보
- Edits : 파일의 생성, 삭제 등에 대한 transaction log

### 2) 데이터노드 관리
네임노드는 데이터노드가 주기적으로 전달하는 Heartbeat와 Block Report를 이용하여 데이터노드를 관리한다.
모든 데이터노드들은 Heartbeat와 BlockReport를 이용해 Namenode에 자기 자신의 상태를 알린다.

- Heartbeat : 데이터노드가 동작중이라고 알리는 수단
- Block Report : 데이터노드에 저장된 블록에 대한 로컬디스크의 정보를 가지고 있다. 네임노드는 이것을 이용하여 HDFS에 저장된 파일에 대한 최신 정보를 유지한다. 

## 데이터노드 (Datanode)
블록의 실질적인 쓰기와 읽기를 담당. 블록의 크기보다 큰 파일은 블록의 크기만큼 나누어져 데이터노드에 저장됨.

## 세컨더리 네임노드 (Secondary Namenode)
네임노드가 구동되고 나면 파일 트랜잭션 기록을 위해 Edits 파일이 주기적으로 생성. 네임노드의 트랜잭션이 빈번하면 빠른속도로 Edits 파일이 생성됨. 너무 많은 Edits파일이 생성되면 네임노드 디스크가 부족해지기도 하고 네임노드가 다시 구동하는데까지 시간이 걸려 느려질 수 있음.  
이때 Secondary namenode는 Fsimage와 Edits파일을 주기적으로 합치고 최신 블록의 상태로 파일을 생성하는 역할을 함.  
파일을 합치면서 Edits파일을 삭제하므로 디스크 부족 문제를 해결할 수 있음.
