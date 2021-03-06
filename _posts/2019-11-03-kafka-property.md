---
layout: post
title: Kafka 기본개념과 Kafka 속성들 정리
subtitle: Kafka 기본개념과 Kafka 속성들 정리
categories: programming
tags: infra
comments: true
---

Kafka의 기본개념과 속성들을 알아보자

## Kafka란?
고성능에 초점을 맞춘 pub/sub 모델의 관리자. 메세지를 생성하는 곳(producer)과 소비하는 곳(consumer)를 분리하여, 메세지 자체를 관리하는 것에만 초첨을 맞춤. producer와 consumer는 다대다의 복잡한 관계를 맺지 않고, 서로 Kafka와 1~다 대 1 관계를 맺으면 됨. - 중앙집중형 메세지 관리

## Kafka basic flow
디스크 저장 방식 - 일반적은 메세지큐는 consumer가 메세지를 읽어가면 큐에서 삭제됨. 하지만 kafka는 보관 주기 동안 메세지를 보관. 멀티 컨슈머가 가능한 이유.  
그 외 메세지 손실 없는 다양한 작업이 가능 (consumer 수정 등)

## 기본용어

### Broker
Kafka가 설치되어있는 서버, Node

### Topic
메세지 그룹. producer와 consumer가 kafka로 보낸 자신의 메세지를 구분하는데 쓰이는 이름. 

### Partition
병렬처리 가능하도록 Topic을 나누는 단위. partition을통해 대량데이터를 처리할수있다.

### Producer 
메세지 생산자. 메세지를 Broker의 Topic으로보냄

### Consumer
메세지 소비자. 메세지를 Broker의 Topic으로부터 받아옴

## Zookeeper
분산 application을 위한 coordination시스템. 분산 application이 안정적인 서비스를 

## Offset
파티션마다 메세지가 저장되는 위치. 파티션마다 고유의 Offset을 가짐. 

## Replication
물리적 장애에 대비한 데이터 복제. topic의 partition단위로 복제하며 Leader와 Follower로 구분됨. Leader가 죽으면 Follower들중 하나가 Leader가 된다. 

## ISR(In Sync Replica)
Leader와 Follower의 정합성. 문제가 있는 Follower는 ISR 그룹에서 제외됨.

## Controller
리더를 선정하는 프로세스. Broker실패 감지시 파티션의 Leader변경을 책임짐. Controller가 죽으면 남아있는 Broker중 하나가 새로운 Controller가됨.

## 기본옵션
### Producer Option
#### bootstrap.serverskafka 
Kafka Cluster에 연결하기 위해 kafka가 위치한 서버의 host:port로 구성된 리스트정보. 

#### acks
kafka topic의 리더에게 메세지를 보낸 후 요청을 완료하기 전 ack 수
- acks = 0 : producer는 서버로부터 어떠한 ack도 기다리지 않음. 서버가 데이터를 받았는지 보장하지 X. 
- acks = 1 : leader가 받았는지 ack를 기다리지만 follower는 확인하지 x. 가장 권장되는 옵션. 
- acks = all or ack = -1 : 모든 leader와 모든 follwer의 ack를 기다림. 데이터 무손실 보장. 

#### buffer.memory
kafka 서버로 메세지를 보내기 위한 버퍼 메몰

#### compression.type 
데이터를 압축해서 보낼수있는데 어떤 압축타입으로 압축할지 결정. ex. none, gzip, snappy, lz4 등

#### retries 
일시적 오류로 인해 전송이 실패한 데이터를 다시 보냄

#### batch.size
Producer는 같은 파티션으로 보내는 여러 데이터를 함께 batch로 보내려고 시도하게됨. 

#### linger.ms
batch.size가 차면 바로 메세지를 보내지만 차지 않을경우 이 옵션에 지정한 시간이 경과했을때 보냄. 

#### max.request.size
최대 메세지 바이트 사이즈.

### Consumer Option
#### bootstrap.serverskafka 
Kafka Cluster에 연결하기 위해 kafka가 위치한 서버의 host:port로 구성된 리스트정보. 

#### fetch.min.bytes
한번에 가져올수있는 최소 데이터사이즈. 이 사이즈보다 작으면 데이터가 누적될때까지 기다림.

#### fetch.max.wait.ms 
fetch.min.bytes가 차지않앗을때 대기하는 최대시간

#### fecth.max.bytes
한번에 가져올수있는 최대 데이터사이즈

#### group.id 
Consumer가 속한 Consumer Group을 식별하는 식별자

#### enable.auto.commit
백그라운드로 주기적으로 offset을 commit

#### auto.commit.interval.ms
주기적으로 offset을 commit하는 시간

#### auto.offset.reset
초기오프셋이 없거나 더이상 존재하지 않는 경우
- earliest : 가장 초기의 오프셋값으로 설정
- latest : 가장 마지막 오프셋값으로 설정 (default)
- none : 이전 offset값으로 설정. 이전 offset값을 찾지 못하면 에러발생. 

#### request.timeout.ms
요청에 대한 타임아웃 설정

#### session.timeout.ms
Consumer와 Broker사이의 세션 타임아웃 시간. Consumer가 Group Coordinator에게 heartbeat를 보내지 않고 session timeout을 초과하면 broker는 consumer가 죽은것으로 판단하고 consumer group이 리밸런스를 시도.

#### heartbeat.interval.ms
그룹 코디네이터에게 얼마나 자주 하트비트를 보낼것인지 설정. (session.timeout.ms보다 작아야함. 보통 session.timeout.ms의 1/3로 설정)

#### max.poll.records
단일 호출에 대한 최대 레코드 수

#### max.poll.interval.ms
Consumer가 heartbeat는 보내는데 실제 메세지는 가져가지 않는 상황에서 무한정 partition을 점유하지 않도록 이 값을 설정

>출처 http://egloos.zum.com/genes1s/v/3093844