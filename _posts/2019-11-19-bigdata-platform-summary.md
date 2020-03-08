---
layout: post
title: 빅데이터 분석 플랫폼 요약
subtitle: 빅데이터 분석 플랫폼 요약
categories: datascience
tags: bigdata
comments: true
---

# 빅데이터 분석 플랫폼 요약
빅데이터 분석 플랫폼으로 일컬어지는 플랫폼은 매우 여러개가있다. 그리고 무척 많은 카테고리로 나뉘어진다. 수집, 저장, 분석, 시각화..  
이게 분류도 많고 종류도 많고 자꾸 헷갈려서 대략적으로 각 카테고리별로 대표 빅데이터 분석 플랫폼들을 정리해보려고 한다.

## 데이터 수집
아파치 플럼(Apache plume), 아파치 스쿱(Apache Scoop)

## 데이터 저장 (분산파일시스템)
Apache Hadoop. (Hadoop 안에서 사용되는 저장 시스템을 HDFS 라고 함.)

## 분산 데이터베이스 (No SQL)

### CAP 이론
- Consistency(일관성): 각각의 사용자가 항상 동일한 데이터를 조회한다.
- Availability(가용성): 모든 사용자가 항상 읽고 쓸 수 있다. 특정 노드가 문제가 생겨도 요청에 대한 응답은 받을 수 있다.
- Partition tolerance(분산 허용성): 물리적 네트워크 분산 환경에서 시스템이 잘 돌아간다. 네트워크 문제 때문에 메시지가 손실되어도 시스템은 정상적으로 운영된다. 
No SQL은 보통 이 CAP중에 2가지만 만족할 수 있다.  
어떤 CAP를 만족하는데 중점을 두고 개발했는지에 따라 No SQL을 분류한다.  

#### CP (Consistency + Partition tolerance)
Redis, HBase, MongoDB

#### AP (Availability + Partition tolerance)
Cassasndra

### 저장방식별 분류
CAP 기능별 외에, 저장이 어떻게 되는지에 따라서도 분류 가능하다.

#### Key-Value
말그대로 key-value 형태로 저장을 한다.  
Redis가 가장 유명하다.

#### Big Table
Big table은 한 row에 여러개의 coloumn을 가진 형태로 RDB와 매우 유사하다.  
HBase, Cassandra 등이 여기 속한다.  

#### Document
저장할때 Document(ex. Json 같은 형태) 형태로 저장한다.  
MongoDB, elasticSearch가 여기 속한다.  

## 성능개선
보통 빅데이터 저장시 성능개선이 필요할경우 2가지 방법이 있다.
### scale-up
현재 구성에서 hard 를 추가하거나, ram 을 추가하는 등 infra를 추가하여 성능을 개선한다.
### scale-out
cluster 구성을 늘린다. 예를들면 서버 2대가 처리하던것을 서버3대가 나눠서 처리할 수 있도록 클러스터링 환경을 추가하여 성능을 개선한다.

## 분산저장
분산저장에는 2가지 방법이있다. 
### Replication
중복분산저장. 여러 서버에 중복하여 저장하는것이다.(ex. Kafka의 replication) 가용성이 좋아진다. 읽기성능이 향상된다. 
### Sharding 
분할분산저장. 분할하여 여러 서버에 저장하는것이다. (ex. HDFS의 분할저장) 읽기는 느릴수있다. 쓰기성능이 향상된다. 

## 분산 병렬 배치처리
Map - Reduce
### Map
Key-Value로 묶는다
### Reduce
중복을 제거하고 데이터를 추출한다.

## SQL on Hadoop
Haddop 환경에서 쓰는 SQL
### Hive
Hadoop에서 SQL쿼리를 작성해 맵리듀스를 돌릴 수 있다. 

## Streaming Data 처리
실시간 스트리밍 데이터를 처리하는 플랫폼에는 뭐가있을까?
### Aapche Strom
실시간 처리. tuple로 병렬 분산 처리
### Apache Spark
대용량 분산 처리, 분석 플랫폼. RDD사용. 실시간이라기보다는 마이크로 배치.(배치를 아주 작게 쪼개서 마치 실시간처럼 돌리는것)