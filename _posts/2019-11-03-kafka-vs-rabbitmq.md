---
layout: post
title: Kafka vs RabbitMQ
subtitle: Kafka vs RabbitMQ
categories: programming
tags: infra
comments: true
---

대용량 스트리밍 데이터 처리 중요성이 대두되면서 메세지플랫폼 역할이 커졌다. 그중에서 최근 가장 많이 화두에 오르는 Kafka와 RabbitMQ를 비교해보자.

## RabbitMQ
클러스터 관리를 위해 ZooKeeper 사용.  
브로커상에서 전달 상태를 확인하기 위한 플래그(표식)을 사용한다.  
대량데이터를 위해 디자인되지 않아서 consumer가 느리면 실패할 가능성이 높다.  
초당 20k+ 정도 이벤트를 처리하도록 구성됨.  
topic, queue등 다양한 exchange 사용.  
메세지당 전달 보장을 해줄 필요가 있을때 사용.  
배달 순서를 별로 관여치 않을때 사용. (보장하게도 할수있긴함..)  
Kafka보다 좀더 성숙된 솔루션.  
Broker중심적.  

## Kafka
클러스터 관리를 위해 ZooKeeper 사용.  
Batch Consumer를 위해 디자인되어 초당 100k+ 처리 가능.   
topic을 exchange로 사용.  
Partition 안에서 메세지 순서(offset)을 제공하고 파티션간 엄격한 순서를 가짐.  
Consumer들이 스스로 파티션간 순서 문제를 해결해야함.  
디스크상에 메세지를 저장하고 데이터 손실을 막기 위해 클러스터로 데이터를 복제.  
생산자 중심적.  
