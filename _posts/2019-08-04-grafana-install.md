---
layout: post
title: Grafana 설치하기
subtitle: Grafana 설치하기
categories: programming
tags: infra
comments: true
---

Grafana를 Window/CentOS에 다운받고 설치해본다

## Grafana down
[https://grafana.com/grafana/download](https://grafana.com/grafana/download)
Widow는 installer 다운받아서 설치하면되고  
CentOS는 아래 명령어를 입력하면 다운받아진다.
```
wget https://dl.grafana.com/oss/release/grafana-6.2.5-1.x86_64.rpm 
sudo yum localinstall grafana-6.2.5-1.x86_64.rpm 
```

## Python으로 influxDB와 Grafana 연동하기
우선 python으로 연동하려면 influx db 패키지를 python에 설치해야한다.
```
pip install influxdb
```
https://blog.naver.com/wideeyed/221426165764  


