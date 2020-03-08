---
layout: post
title: logstash vs filebeat
subtitle: logstash vs filebeat
categories: programming
tags: infra
comments: true
---

처음에는 좀 헷갈렸는데 기능이 이렇게 다른듯함.

## filebeat
말그대로 file을 수집. 수집한 file은 원하는곳에 연결해서 넘겨줄수있음.
이미 저장된 log file을 긁어옴.
ex. kafka가 생성해내는 kafka.log파일을 수집해 elasticsearch에 넣기 가능.

## logstash
consumer의 역할. 
logger들이 logstash로 로그를 바로 쏘게하여 저장함.
ex. kafka 토픽을 구독해와서 elasticsearch에 넣기 가능. 
