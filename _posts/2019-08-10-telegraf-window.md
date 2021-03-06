---
layout: post
title: windows에서 telegraf 사용하기
subtitle: windows에서 telegraf 사용하기
categories: programming
tags: infra
comments: true
---

windows환경에서 telegraf 설치하고 사용해보자

## telegraph 다운받기
[https://portal.influxdata.com/downloads/](https://portal.influxdata.com/downloads/)  
요 링크에서받는데 windows같은경우는  
[https://dl.influxdata.com/telegraf/releases/telegraf-1.11.3_windows_amd64.zip](https://dl.influxdata.com/telegraf/releases/telegraf-1.11.3_windows_amd64.zip)  
이 링크에서 받아서 압축만 풀어주면 됨.

## telegraf 설치

`telegraf.exe` 를 config파일경로와 함께 실행해주면되는데  
보통 압축풀면 같은 경로에 있다. 

```
telegraf.exe -service install -config <path_to_config>
```

```
C:\develop\telegraf-1.11.3_windows_amd64\telegraf>telegraf.exe -service install -config ./
```

## telegraf 실행
cmd창에서 `telegraf`를 치면 telegraf가 구동되는데  
conf파일 위치를 잡아놓지않으면 아래 에러메세지가 발생한다.
```
C:\develop\telegraf-1.11.3_windows_amd64\telegraf>telegraf
2019-08-05T01:46:12Z I! Starting Telegraf 1.11.3
2019-08-05T01:46:12Z E! [telegraf] Error running agent: No config file specified
, and could not find one in $TELEGRAF_CONFIG_PATH, /.telegraf/telegraf.conf, or
C:\Program Files\Telegraf\telegraf.conf
```

따라서 config파일 위치를 잡아줘야하는데
window의 경우 2가지방법이 있다.

### 1. 환경변수 설정
시스템 환경변수에서 
TELEGRAF_CONFIG_PATH 라는 이름으로 conf파일 위치를 잡아준다.

### 2. C:\Program Files\Telegraf 폴더에 telegraf.conf 넣기
`C:\Program Files\Telegraf\telegraf.conf` 이 경로가 아마 default 경로인듯함.
Program Files에 Telegraf폴더를 만들고 위에서 압축풀고 나온 conf 파일을 넣어준다. 

```
C:\develop\telegraf-1.11.3_windows_amd64\telegraf>telegraf
2019-08-05T01:47:19Z I! Starting Telegraf 1.11.3
2019-08-05T01:47:19Z I! Using config file: C:\Program Files\Telegraf\telegraf.conf
```
이제 잘 구동이 된다. 

## influx db 와 연결되었는지 확인
influxdb가 떠있으면 telegraf가 자동으로 붙는듯하다. 
(conf파일에 관련설정값을 따로 넣지 않았는데도 자동으로 붙었음.)
```
2019-08-05T01:47:19.664673Z     info    Executing query {"log_id": "0G~zjxg0000"
, "service": "query", "query": "CREATE DATABASE telegraf"}
```
influx db로그를 보면 telegraf를 처음실행하는순간 이런식으로 telegraf databae가 만들어지면서
pc정보 수집을 시작함.
telegraf 기본 설정이 pc 모니터링 정보 수집인듯.

