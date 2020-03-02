---
layout: post
title: influxDB CentOS에 설치하기
subtitle: influxDB CentOS에 설치하기
categories: programming
tags: infra
comments: true
---

influxDB를 CentOS에 다운받고 설치해본다.

## influxDB 다운로드
[https://portal.influxdata.com/downloads/](https://portal.influxdata.com/downloads/)
위 링크에서 내 OS에 맞는 버전을 다운로드받는다. 
window는 설치파일 링크눌러서 설치파일 다운받으면 되고  
centOS는 아래 명령어를 입력하면 다운받아진다. 
```
wget https://dl.influxdata.com/influxdb/releases/influxdb-1.7.7.x86_64.rpm
sudo yum localinstall influxdb-1.7.7.x86_64.rpm
```


## influxDB 구동

```
sudo yum install influxdb
sudo systemctl start influxdb
```

설치하고나서 2가지방법으로 환경설정을 하고 influxdb를 띄울수있다. 
1) 실행시 config file 지정  
2) 환경변수에 config파일 경로 설정  
본인이 내키는방법으로 환경설정하고 influx db를 띄워주면된다.

- config file 지정
`influxd -config /etc/influxdb/influxdb.conf` 명령어로 config 파일을 지정할 수 있다.

```
[root@master app]# influxd -config /etc/influxdb/influxdb.conf

 8888888           .d888 888                   8888888b.  888888b.
   888            d88P"  888                   888  "Y88b 888  "88b
   888            888    888                   888    888 888  .88P
   888   88888b.  888888 888 888  888 888  888 888    888 8888888K.
   888   888 "88b 888    888 888  888  Y8bd8P' 888    888 888  "Y88b
   888   888  888 888    888 888  888   X88K   888    888 888    888
   888   888  888 888    888 Y88b 888 .d8""8b. 888  .d88P 888   d88P
 8888888 888  888 888    888  "Y88888 888  888 8888888P"  8888888P"

2019-07-30T07:20:04.047134Z     info    InfluxDB starting       {"log_id": "0GxRqxol000", "version": "1.7.7", "branch": "1.7", "commit": "f8fdf652f348fc9980997fe1c972e2b79ddd13b0"}
2019-07-30T07:20:04.047151Z     info    Go runtime      {"log_id": "0GxRqxol000", "version": "go1.11", "maxprocs": 1}
run: open server: listen: listen tcp 127.0.0.1:8088: bind: address already in use

```

- 환경변수 설정

```
vim ~/.bashrc
```

```
export INFLUXDB_CONFIG_PATH=/etc/influxdb/influxdb.conf
```

```
source ~/.bashrc
```
위 내용을 환경변수에 추가한다.

- influx db실행

```
influxd
```

## influxDB CLI 접근

`influx`를 치면 CLI 가 나온다.
```
[root@master app]# influx
Connected to http://localhost:8086 version 1.7.7
InfluxDB shell version: 1.7.7
>
```


## InfluxDB 사용자 생성
config파일에서 auth-enable=true로 설정하면 influxDB를 사용할때 로그인해야지만 사용하게 할수있음.  
```
CREATE USER <username> WITH PASSWORD '<password>' WITH ALL PRIVILEGES
```

## influxDB create table
```
CREATE DATABASE <database name>
```


## influxDB insert data
```
insert <measurement>,<tag1>=<tag1 value>,<tag2>=<tag2 value> <field1>=<field1 value>,<field2>=<field2 value>
insert monitoring,cpu=i5,core=5 memory=600,disk=50000
insert test a=5,b=6 c=5,d=7
```
measurement : 테이블
tag : 인덱스컬럼  
field : 비인덱스컬럼  

## influxDB select data
```
select * from <measurement>
select * from monitoring
select * from test
```



> 참고 https://dev-t-blog.tistory.com/33  
https://docs.influxdata.com/influxdb/v1.7  
https://blog.naver.com/alice_k106/221226137412  


## csv file to influx DB on Python
https://github.com/fabio-miranda/csv-to-influxdb































