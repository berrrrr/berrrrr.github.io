---
layout: post
title: spark 클러스터링 모드로 분산처리하기
subtitle: spark 클러스터링 모드로 분산처리하기
categories: datascience
tags: spark
comments: true
---

여러 서버에 spark 설치하고 데이터를 분석하려면 spark를 클러스터로 묶어줘야한다.  
아래와 같이 각 서버의 spark 환경설정파일을 수정하면 여러대의 spark를 cluster로 묶을 수 있다.  
(반드시 묶고자하는 모든 서버의 spark 환경설정파일 모두 수정 )

## spark-env.sh 수정
/spark/conf/spark-env.sh 에 아래 내용을 추가한다.
```
PYSPARK_PYTHON=/usr/bin/python3
PYSPARK_DRIVER_PYTHON=/usr/bin/python3
SPARK_MASTER_IP=namenode
SPARK_MASTER_PORT=7077
SPARK_MASTER_WEBUI_PORT=8080
```
그 외에 템플릿에서 보고 자신이 필요한 설정들을 넣어주면된다.

## spark-defaults.conf수정
/spark/conf/spark-defaults.conf 에 아래 내용을 추가한다. 
```
spark.master    spark://namenode:7077
```
내 경우에는 namenode라는 host를 등록해서 사용하고있어서 위와 같이 등록한것이고,  
자신이 master로 삼고자하는 spark의 ip를 넣어주면 된다.  
(ex. master로 삼고자하는 spark 서버 ip가 192.168.0.11이라면 spark://192.168.0.11:7077 로 등록하면됨)

## spark session 에 master 지정
코드에서 spark session 선언할때 아래와 같이 master node를 지정해준다.   
나는 pyspark를 사용하고있어서 아래와 같이 수정해줬음.  
```python
spark = SparkSession \
    .builder \
    .master("spark://namenode:7077") \
    .appName("csv2parq") \
    .config(conf=conf) \
    .getOrCreate()
``` 

## Spark shell 실행
마스터노드
```
cd ~/spark/sbin
./start-master.sh
```

워커노드  
```
cd ~/spark/sbin
./start-slave spark://namenode:7077
```
master, slave 모두에서 실행

## 확인
namenode:8080 페이지에 접속하면 마스터, 슬레이브가 연결된 정보를 시각적으로 볼 수 있다

## 연결이 안된다면?
connection refused가 뜬다면?  
(우분투)  
```
sudo ufw allow 7077
sudo ufw allow 8080
```

7077 :  spark master node 접근포트  
8080 : spark web ui 접근포트  
 
자신의 SPARK설정에 맞게 열어주면된다 