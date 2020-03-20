---
layout: post
title: sqoop 설치하기
subtitle: sqoop 설치하기
categories: datascience
tags: hadoop
comments: true
---

sqoop은 RDBMS to HADOOP 혹은 HADOOP to RDBMS를 쉽게 해주는 어플리케이션이다.  
이러한 sqoop을 어떻게 설치하고 어떻게 실행하는지 알아보자. 

## hadoop 환경 구성
우선 hadoop 과 hive가 설치되어있는 환경이 구성되어있어야한다.  
[hadoop 설치](https://berrrrr.github.io/datascience/2019/08/04/hadoop-spark-install/)  
hive 설치 (링크 차후 추가)  

## sqoop 설치
```
wget -O sqoop-1.4.6.tar.gz http://archive.apache.org/dist/sqoop/1.4.6/sqoop-${SQOOP_VERSION}.bin__hadoop-2.0.4-alpha.tar.gz
tar zxvf  sqoop-1.4.6.tar.gz  -C /program
```

심볼릭링크도 만든다
```
ln -s /program/sqoop-1.4.6.bin__hadoop-2.0.4-alpha /program/sqoop
```

환경변수 설정
```
export SQOOP_HOME=/program/sqoop
```

사용하고자하는 RDBMS의 jdbc드라이버를 넣어준다. (나같은경우 postgresql)
```
curl -L 'https://jdbc.postgresql.org/download/postgresql-9.3-1104.jdbc4.jar' -o postgresql-9.3-1004.jdbc4.jar
cp postgresql-9.3-1004.jdbc4.jar ${SQOOP_HOME}/lib
```

만약 json형식 사용하면 json드라이버(?)도 `${SQOOP_HOME}/lib` 여기에 넣어줘야함

## sqoop 환경설정
conf폴더의 sqoop-env.sh를 수정해준다.
```
#Set path to where bin/hadoop is available
export HADOOP_COMMON_HOME=$HADOOP_HOME

#Set path to where hadoop-*-core.jar is available
export HADOOP_MAPRED_HOME=$HADOOP_HOME

#set the path to where bin/hbase is available
#export HBASE_HOME=

#Set the path to where bin/hive is available
export HIVE_HOME=$HIVE_HOME

#Set the path for where zookeper config dir is
#export ZOOCFGDIR=


export HCAT_HOME=$HIVE_HOME/hcatalog
```
나같은경우는 HADOOP_HOME등 기존 경로들을 다 환경변수에 넣어놨기에 위와 같이 설정해줬다.
그리고 HBASE나 ZOOCF 등은 깔지 않았기때문에 스킵. (나중에 sqoop실행시 경로잡아달라고 에러가뜨긴하지만 무시하면됨)

## sqoop 실행
설치가 잘 됐다면 sqoop version 입력시 아래와 같이 버전이 잘 뜬다.
```
root@ff84d83259ed:/program/sqoop/conf# sqoop version
Warning: /program/sqoop/../hbase does not exist! HBase imports will fail.
Please set $HBASE_HOME to the root of your HBase installation.
Warning: /program/sqoop/../accumulo does not exist! Accumulo imports will fail.
Please set $ACCUMULO_HOME to the root of your Accumulo installation.
Warning: /program/sqoop/../zookeeper does not exist! Accumulo imports will fail.
Please set $ZOOKEEPER_HOME to the root of your Zookeeper installation.
20/03/16 18:31:32 INFO sqoop.Sqoop: Running Sqoop version: 1.4.6
Sqoop 1.4.6
git commit id 어쩌고
Compiled by root on Mon Apr 27 14:38:36 CST 2015
```
(위에 말한대로 hbase등을 안잡아줬더니 계속 warning이뜬다..)


기본적으로 아래 명령어로 sqoop을 실행할 수 있다  
### RDBMS to Hadoop
```
sqoop import \
-connection-manager "org.apache.sqoop.manager.GenericJdbcManager" \
-driver "org.postgresql.Driver" \
-connect "jdbc:postgresql://db주소" \
-username "아이디" \
-password "패스워드" \
-num-mappers 1 \
-split-by "키컬럼" \
-query "SELECT * FROM 테이블명 WHERE \$CONDITIONS 조건" \
-hive-import \
-hive-table "하이브테이블명" \
-target-dir "hdfs 폴더위치" \
-fields-terminated-by '\t'
-lines-terminated-by '\n'
```
