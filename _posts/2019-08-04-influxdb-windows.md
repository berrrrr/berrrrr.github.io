---
layout: post
title: influxDB windows에 설치하기
subtitle: influxDB windows에 설치하기
categories: programming
tags: infra
comments: true
---

influxDB를 window에 다운받고 설치해본다.

## influxDB 다운로드
[https://portal.influxdata.com/downloads/](https://portal.influxdata.com/downloads/)
위 링크에서 내 OS에 맞는 버전을 다운로드받는다. 
window는 설치파일 링크눌러서 설치파일 다운받으면 된다.

## influxDB config 설정
다운로드받은 파일을 압축을 푼 뒤
`influxdb.conf`를 아래와 같이 수정한다.  
(파일 경로는 자신이 원하는곳으로 설정하면 됨)
```conf
[meta]
  dir = "C:/develop/influxdb-1.7.7-1/influxdb/meta"
  retention-autocreate = true


[data]
  # The directory where the TSM storage engine stores TSM files.
  dir = "C:/develop/influxdb-1.7.7-1/influxdb/data"

  # The directory where the TSM storage engine stores WAL files.
  wal-dir = "C:/develop/influxdb-1.7.7-1/influxdb/wal"

[coordinator]


[retention]


[shard-precreation]

[monitor]

[http]
  # Determines whether HTTP endpoint is enabled.
  enabled = true

  # Determines whether the Flux query endpoint is enabled.
  # flux-enabled = false

  # The bind address used by the HTTP service.
  bind-address = ":8086"

  # Determines whether user authentication is enabled over HTTP/HTTPS.
  auth-enabled = false

  # The default realm sent back when issuing a basic auth challenge.
  # realm = "InfluxDB"

  # Determines whether HTTP request logging is enabled.
  log-enabled = true

[subscriber]

[[graphite]]

[[collectd]]

[[opentsdb]]

[[udp]]

[continuous_queries]

[tls]
```




## influxDB 구동

```
C:\develop\influxdb-1.7.7-1>influxd -config influxdb.conf

 8888888           .d888 888                   8888888b.  888888b.
   888            d88P"  888                   888  "Y88b 888  "88b
   888            888    888                   888    888 888  .88P
   888   88888b.  888888 888 888  888 888  888 888    888 8888888K.
   888   888 "88b 888    888 888  888  Y8bd8P' 888    888 888  "Y88b
   888   888  888 888    888 888  888   X88K   888    888 888    888
   888   888  888 888    888 Y88b 888 .d8""8b. 888  .d88P 888   d88P
 8888888 888  888 888    888  "Y88888 888  888 8888888P"  8888888P"

2019-07-26T04:27:26.485466Z     info    InfluxDB starting       {"log_id": "0Gs8
O1aG000", "version": "1.7.7", "branch": "1.7", "commit": "f8fdf652f348fc9980997f
e1c972e2b79ddd13b0"}
2019-07-26T04:27:26.486466Z     info    Go runtime      {"log_id": "0Gs8O1aG000"
, "version": "go1.11", "maxprocs": 2}
2019-07-26T04:27:26.738481Z     info    Using data dir  {"log_id": "0Gs8O1aG000"
, "service": "store", "path": "C:/develop/influxdb-1.7.2-1/influxdb/data"}
2019-07-26T04:27:26.740481Z     info    Compaction settings     {"log_id": "0Gs8
O1aG000", "service": "store", "max_concurrent_compactions": 1, "throughput_bytes
_per_second": 50331648, "throughput_bytes_per_second_burst": 50331648}
2019-07-26T04:27:26.741481Z     info    Open store (start)      {"log_id": "0Gs8
O1aG000", "service": "store", "trace_id": "0Gs8O2aG000", "op_name": "tsdb_open",
 "op_event": "start"}
2019-07-26T04:27:26.742481Z     info    Open store (end)        {"log_id": "0Gs8
O1aG000", "service": "store", "trace_id": "0Gs8O2aG000", "op_name": "tsdb_open",
 "op_event": "end", "op_elapsed": "1.000ms"}
2019-07-26T04:27:26.743481Z     info    Opened service  {"log_id": "0Gs8O1aG000"
, "service": "subscriber"}
2019-07-26T04:27:26.744481Z     info    Starting monitor service        {"log_id
": "0Gs8O1aG000", "service": "monitor"}
2019-07-26T04:27:26.745481Z     info    Registered diagnostics client   {"log_id
": "0Gs8O1aG000", "service": "monitor", "name": "build"}
2019-07-26T04:27:26.746481Z     info    Registered diagnostics client   {"log_id
": "0Gs8O1aG000", "service": "monitor", "name": "runtime"}
2019-07-26T04:27:26.747481Z     info    Registered diagnostics client   {"log_id
": "0Gs8O1aG000", "service": "monitor", "name": "network"}
2019-07-26T04:27:26.747481Z     info    Registered diagnostics client   {"log_id
": "0Gs8O1aG000", "service": "monitor", "name": "system"}
2019-07-26T04:27:26.749481Z     info    Starting precreation service    {"log_id
": "0Gs8O1aG000", "service": "shard-precreation", "check_interval": "10m", "adva
nce_period": "30m"}
2019-07-26T04:27:26.750481Z     info    Starting snapshot service       {"log_id
": "0Gs8O1aG000", "service": "snapshot"}
2019-07-26T04:27:26.749481Z     info    Storing statistics      {"log_id": "0Gs8
O1aG000", "service": "monitor", "db_instance": "_internal", "db_rp": "monitor",
"interval": "10s"}
2019-07-26T04:27:26.751481Z     info    Starting continuous query service
{"log_id": "0Gs8O1aG000", "service": "continuous_querier"}
2019-07-26T04:27:26.753482Z     info    Starting HTTP service   {"log_id": "0Gs8
O1aG000", "service": "httpd", "authentication": false}
2019-07-26T04:27:26.754482Z     info    opened HTTP access log  {"log_id": "0Gs8
O1aG000", "service": "httpd", "path": "stderr"}
2019-07-26T04:27:26.761482Z     info    Listening on HTTP       {"log_id": "0Gs8
O1aG000", "service": "httpd", "addr": "[::]:8086", "https": false}
2019-07-26T04:27:26.765482Z     info    Starting retention policy enforcement se
rvice   {"log_id": "0Gs8O1aG000", "service": "retention", "check_interval": "30m
"}
2019-07-26T04:27:26.766482Z     info    Listening for signals   {"log_id": "0Gs8
O1aG000"}
2019-07-26T04:27:26.767482Z     info    Sending usage statistics to usage.influx
data.com        {"log_id": "0Gs8O1aG000"}
2019-07-26T04:57:26.768436Z     info    Retention policy deletion check (start)
{"log_id": "0Gs8O1aG000", "service": "retention", "trace_id": "0GsA5ux0000", "op
_name": "retention_delete_check", "op_event": "start"}
2019-07-26T04:57:26.768436Z     info    Retention policy deletion check (end)
{"log_id": "0Gs8O1aG000", "service": "retention", "trace_id": "0GsA5ux0000", "op
_name": "retention_delete_check", "op_event": "end", "op_elapsed": "0.000ms"}
2019-07-26T05:27:26.768391Z     info    Retention policy deletion check (start)
{"log_id": "0Gs8O1aG000", "service": "retention", "trace_id": "0GsBomC0000", "op
_name": "retention_delete_check", "op_event": "start"}
```


## influxDB CLI 접근

influxDB를 띄운상태에서 influx.exe를 실행하면 쿼리문을 칠수있는 쉘이 뜬다.
```

C:\develop\influxdb-1.7.7-1>influx.exe
Connected to http://localhost:8086 version 1.7.7
InfluxDB shell version: 1.7.7
>
```


## InfluxDB 사용자 생성
config파일에서 auth-enable=true로 설정하면 influxDB를 사용할때 로그인해야지만 사용하게 할수있음.  
```
CREATE USER <username> WITH PASSWORD '<password>' WITH ALL PRIVILEGES
> insert monitoring,cpu=i5,core=5 memory=600,disk=50000
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































