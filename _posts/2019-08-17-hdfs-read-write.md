---
layout: post
title: HDFS Block read/write
subtitle: HDFS Block read/write
categories: datascience
tags: hadoop
comments: true
---

HDFS에서 Block이 어떻게 읽고 쓰여지고 이동하는지, Block의 상태변경에 대해 알아보자.

## Block replication
HDFS에 저장되는 Block들은 여러 노드에 복제하여 저장. 이렇게 복제된 블록을 이요해 특정 노드의 장애에 무정지 대응이 가능.  
블록의 복제본은 같은 노드에 존재하지 않고 같은 rack에 존재하지 않게 저장. 1NODE 또는 1RACK 장애시에도 BLOCK에 대한 READ/WRITE가 정상적으로 이루어질 수 있다. 

### Fsimage
파일정보와 데이터의 block 위치, block replication 개수를 mapping 시킨 정보를 포함한다.  
Namenode에서 이 Fsimage를 통해 block의 복제본을 관리하게 된다.

## Block Read/Write Process
### HDFS Read
1. Client가 Namenode에 파일에 대한 read를 요청.  
2.  Namenode는 Client에게 파일 블록의 위치 반환  
3.  Client는 네임노드로부터 제공받은 파일 블록의 위치를 통해 파일이 들어있는 block을 read  

### HDFS Write
1.  Client는 Namenode에 파일에대한 정보 전송, 저장공간 요청
2. Namenode는 block을 보관 가능한 Datanode의 목록을 제공
3. Client는 제공받은 정보를 통해 파일을 Block단위로 Write
4. Block을 전달받은 DataNode는 다른 Datanode에 Block을 복제(replication)하여 저장

## Datanode Replica Life Cycle
### Replica
Datanode에 물리적으로 저장된 각각의 block.

### Leader Replica
HDFS Write 수행시 첫번째로 Write된 Block

### GS(Generation Stamp)
Replica가 가지는 8Byte의 버젼값. Replica의 상태 판단.

### Datanode Replica Life Cycle
- FINALIZED : Replica에 대한 Write를 완료한 상태
- RBW(Replica Being Written) : Replica가 변경되고 있는 상태
- RWR(Replica Wating to Recovered) : Replica에 대한 복구가 진행되고 있는 상태
- RUR(Replica Under Recovery) : Replica가 복구에 사용되고 있는 상태
- TEMPORARY : Block이 복제되고 있는 중에 생성되는 임시 복제본 상태

## Namenode Block Life Cycle
- UNDER_CONSTRUCTION : 쓰여직 있는 파일의 마지막 Block. (Replica - RBW or RWR)
- UNDER_RECOVERY : Block이 제대로 write되지 않아 다시 복구중인 상태. 
- COMMITTED : Block의 GS가 더이상 변경될 수 없는 상태
- COMPLETE : Block의 복제본이 최소 복제본의 개수를 충족하는 상태


