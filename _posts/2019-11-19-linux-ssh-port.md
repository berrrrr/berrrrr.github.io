---
layout: post
title: Linux SSH port 변경하기
subtitle: Linux SSH port 변경하기
categories: programming
tags: infra
comments: true
---

# Linux SSH port 변경하기
ubuntu linux에서 ssh port를 변경해보자 

## root계정으로접속
root 계정으로 switch user한다.

## sshd_config파일 수정
```
vi /etc/ssh/sshd_config
```

sshd_config 파일을 수정한다.  

```
# Port 22
```
위부분에서 주석을 제거하고 원하는 port로 변경한다.

```
Port 22
Port 10022
```
이런식으로 multi port설정도 가능하다. 

## service restart
```
service sshd restart
```
sshd service를 restart한다.