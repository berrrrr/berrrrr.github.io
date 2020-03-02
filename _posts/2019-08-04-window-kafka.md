---
layout: post
title: Window 환경에서 kafka 구축하기
subtitle: Window 환경에서 kafka 구축하기
categories: programming
tags: infra
comments: true
---


window환경에서 kafak 구축하기

## log directory
server.properties의 log.dirs, zookeeper.properties의 dataDir  
/tmp/~ 로 되어있는데 이러면 reboot시 topic 이 사라지는 현상 있음  
/opt/~ /var/~ 등으로 바꿔서 실행하는게 좋다  

## zookeeper id 구분
zookeeper dataDir안에(ex. /opt/zookeeper1/) myid 파일 만들어서 id 작성해야함  
(ex.cat /opt/zookeeper1/myid  치면 결과>> 1 )  

## zookeeper 시작
```
zookeeper-server-start.bat ../../config/zookeeper.properties
zookeeper-server-start.bat ../../config/zookeeper1.properties
zookeeper-server-start.bat ../../config/zookeeper2.properties
zookeeper-server-start.bat ../../config/zookeeper3.properties
```

## zookeeper shell 실행
```
zookeeper-shell.bat localhost:2181 ls /
```
결과 >  
Connecting to localhost:2181  

WATCHER::

WatchedEvent state:SyncConnected type:None path:null
[zookeeper, peter-kafka]

## kafka 시작
```
kafka-server-start.bat ../../config/server.properties
kafka-server-start.bat ../../config/server1.properties
kafka-server-start.bat ../../config/server2.properties
kafka-server-start.bat ../zoo../config/server3.properties
```

## topic 생성

```
kafka-topics.bat --create --zookeeper localhost:2181/peter-kafka --replication-factor 3 --partitions 2 --topic peter-kafka
```

replication-factor가 3이고 partition이 2인 topic

```
kafka-topics.bat --create --zookeeper localhost:2182,localhost:2183,localhost:2184/peter-kafka --replication-factor 3 --partitions 3 --topic test3
```

## topic list보기
```
kafka-topics.bat --list --zookeeper localhost:2181/peter-kafka
kafka-topics.bat --list --zookeeper localhost:2182,localhost:2183,localhost:2184/peter-kafka
```

## topic 상세정보 보기
```
kafka-topics.bat --describe --zookeeper localhost:2181/peter-kafka
```

## topic 삭제
삭제 mark를 하고 일정기간이 지나면 지움
```
kafka-topics.bat --delete --zookeeper <host:port> --topic <topic_name>
kafka-topics.bat --delete --zookeeper localhost:2181/peter-kafka --topic test
```

마크가 아닌 복구행동없이 강제로 지워버림
```
kafka-topics.bat --delete --zookeeper localhost:2181/peter-kafka --topic test --force
```

## producer 시작
```
kafka-console-producer.bat --broker-list localhost:9092 --topic peter-kafka
kafka-console-producer.bat --broker-list localhost:9093,localhost:9094,localhost:9095 --topic test1
```

## consumer 시작
```
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic test2 --from-beginning
kafka-console-consumer.bat --bootstrap-server localhost:9093,localhost:9094,localhost:9095 --topic test2 --partition 0 --group peter-consumer- group --from-beginning
```

## consumer그룹 확인
```
kafka-consumer-groups.bat --bootstrap-server localhost:9093,localhost:9094,localhost:9095 --list
```
상세확인 (온라인인 consumer group이 있을때)
```
kafka-consumer-groups.bat --bootstrap-server localhost:9093,localhost:9094,localhost:9095 --group peter-consumer --describe
```
결과 >   
```
TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                                             HOST      		  					CLIENT-ID
test4           0          26              26              0               consumer-1-c57a07cc-f9de-43e4-b554-746f9a21ffad         /10.40.104.88      					consumer-1
test4           1          13              13              0               consumer-1-c57a07cc-f9de-43e4-b554-746f9a21ffad         /10.40.104.88      					consumer-1
test4           2          19              19              0               kafka-python-1.3.5-cd6c378b-9890-4797-9e98-97803bf1a721 /fe80:0:0:0:6c52:36ee:4d0c:438b%13 	kafka-python-1.3.5
```

상세확인 (온라인인 consumer group이 없을때)
```
D:\kafka_2.12-2.0.0\bin\windows>kafka-consumer-groups.bat --bootstrap-server localhost:9093,localhost:9094,localhost:9095 --group peter-consumer --describe
```

결과 >  
```
Warning: Consumer group 'peter-consumer' is rebalancing.

TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID     HOST            CLIENT-ID
test4           0          26              26              0               -
           -               -
test4           2          19              19              0               -
           -               -
test4           1          13              13              0               -
           -               -
```
> LAG : 현재 토픽의 저장된 메시지와 컨슈머가 가져간 메세지의 차이. 만약 LAG이 계속 증가한다면 컨슈머나 파티션을 늘려서 대응해야함. 


## kafka replication factor와 partition 관계

파티션은 (중복되지 않는 방향으로) 특정 broker에 랜덤으로 할당됨  
여러개의 파티션, 여러개의 브로커일경우 replication-factor수가 1이상이라면 broker간 leader가 최대한 겹치지 않게 할당됨   
```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --create --zookeeper localhost:2181/peter-kafka --replication-factor 1 --partitions 1 --topic test1

Created topic "test1".
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --describe --zookeeper localhost:2181/peter-kafka

Topic:test1     PartitionCount:1        ReplicationFactor:1     Configs:
        Topic: test1    Partition: 0    Leader: 2       Replicas: 2     Isr: 2
```


```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --create --zookeeper localhost:2181/peter-kafka --replication-factor 2 --partitions 2 --topic test2
Created topic "test2".
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --describe --zookeeper localhost:2181/peter-kafka

Topic:test1     PartitionCount:1        ReplicationFactor:1     Configs:
        Topic: test1    Partition: 0    Leader: 2       Replicas: 2     Isr: 2
Topic:test2     PartitionCount:2        ReplicationFactor:2     Configs:
        Topic: test2    Partition: 0    Leader: 0       Replicas: 0,2   Isr: 0,2

        Topic: test2    Partition: 1    Leader: 1       Replicas: 1,0   Isr: 1,0
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --create --zookeeper localhost:2181/peter-kafka --replication-factor 3 --partitions 3 --topic test3
Created topic "test3".
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --describe --zookeeper localhost:2181/peter-kafka

Topic:test1     PartitionCount:1        ReplicationFactor:1     Configs:
        Topic: test1    Partition: 0    Leader: 2       Replicas: 2     Isr: 2
Topic:test2     PartitionCount:2        ReplicationFactor:2     Configs:
        Topic: test2    Partition: 0    Leader: 0       Replicas: 0,2   Isr: 0,2

        Topic: test2    Partition: 1    Leader: 1       Replicas: 1,0   Isr: 1,0

Topic:test3     PartitionCount:3        ReplicationFactor:3     Configs:
        Topic: test3    Partition: 0    Leader: 1       Replicas: 1,0,2 Isr: 1,0,2
        Topic: test3    Partition: 1    Leader: 2       Replicas: 2,1,0 Isr: 2,1,0
        Topic: test3    Partition: 2    Leader: 0       Replicas: 0,2,1 Isr: 0,2,1
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --create --zookeeper localhost 2181/peter-kafka --replication-factor 1 --partitions 2 --topic test4 
Created topic "test4".
```

```
Topic:test4     PartitionCount:2        ReplicationFactor:1     Configs:
        Topic: test4    Partition: 0    Leader: 1       Replicas: 1     Isr: 1
        Topic: test4    Partition: 1    Leader: 2       Replicas: 2     Isr: 2
```

```
D:\kafka_2.12-2.0.0\bin\windows>kafka-topics.bat --describe --zookeeper localhost:2182,localhost:2183,localhost:2184/peter-kafka

Topic:test1     PartitionCount:2        ReplicationFactor:3     Configs:
        Topic: test1    Partition: 0    Leader: 2       Replicas: 2,0,1 Isr: 2,0,1
        Topic: test1    Partition: 1    Leader: 0       Replicas: 0,1,2 Isr: 0,1,2
Topic:test2     PartitionCount:5        ReplicationFactor:2     Configs:
        Topic: test2    Partition: 0    Leader: 0       Replicas: 0,2   Isr: 0,2

        Topic: test2    Partition: 1    Leader: 1       Replicas: 1,0   Isr: 1,0

        Topic: test2    Partition: 2    Leader: 2       Replicas: 2,1   Isr: 2,1

        Topic: test2    Partition: 3    Leader: 0       Replicas: 0,1   Isr: 0,1

        Topic: test2    Partition: 4    Leader: 1       Replicas: 1,2   Isr: 1,2
```
		
## kafka 보관주기 설정
```
kafka-configs.bat --zookeeper localhost:2181/peter-kafka --alter --entity-type topics --entity-name test4 --add-config retention.ms=3600000
```
```
Completed Updating config for entity: topic 'test4'.
```

## kafka 보관주기 설정 삭제
```
kafka-configs.bat --zookeeper localhost:2181/peter-kafka --alter --entity-type topics --entity-name test4 --delete-config retention.ms
```

## kafka 파티션 변경
```
kafka-topics.bat --zookeeper localhost:2181/peter-kafka --alter --topic test4 --partitions 3
```
```
WARNING: If partitions are increased for a topic that has a key, the partition logic or ordering of the messages will be affected 
Adding partitions succeeded!
```

## kafka replication factor 변경

변경 전
```
Topic:test4     PartitionCount:3        ReplicationFactor:1     Configs:
        Topic: test4    Partition: 0    Leader: 1       Replicas: 1     Isr: 1
        Topic: test4    Partition: 1    Leader: 2       Replicas: 2     Isr: 2
        Topic: test4    Partition: 2    Leader: 0       Replicas: 0     Isr: 0
```

변경하기
```
D:\kafka_2.12-2.0.0\bin\windows>kafka-reassign-partitions.bat --zookeeper localhost:2181/peter-kafka --reassignment-json-file rf.json --execute
```
```
Current partition replica assignment
```
```
{"version":1,"partitions":[{"topic":"test4","partition":1,"replicas":[2],"log_di
rs":["any"]},{"topic":"test4","partition":0,"replicas":[1],"log_dirs":["any"]},{
"topic":"test4","partition":2,"replicas":[0],"log_dirs":["any"]}]}
```
```
Save this to use as the --reassignment-json-file option during rollback  
Successfully started reassignment of partitions.
```

변경 후  
```
Topic:test4     PartitionCount:3        ReplicationFactor:2     Configs:
        Topic: test4    Partition: 0    Leader: 1       Replicas: 1,2   Isr: 1,2

        Topic: test4    Partition: 1    Leader: 2       Replicas: 2,0   Isr: 2,0

        Topic: test4    Partition: 2    Leader: 0       Replicas: 0,1   Isr: 0,1
```
		
## kafka서버에 jmx 적용
kafka-server-start.bat 파일에 
`SET JMX_PORT=9999` 삽입

커맨드창에서 `netstat -ano | findstr "9999"`  
(죽이려면? `tasklist /fi /pid "pid"`)


## kafka manager on windows

[https://www.scala-lang.org/download/](https://www.scala-lang.org/download/)     -> scala, sbt 다운  
참고> https://my.oschina.net/yogiwang/blog/2052253  

cmd > kafka manager 폴더 > sbt > (kafka-manager cli 진입) > compile > run  