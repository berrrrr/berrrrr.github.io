---
layout: post
title: "[AWS EC2] redis 설치"
subtitle: "[AWS EC2] redis 설치"
categories: programming
tags: infra
comments: true
---

삽질후에 설치성공

## 1. redis 설치

```bash
# linux update 
sudo yum update -y
# gcc make
sudo yum install gcc make -y

# Redis 설치 및 압축풀고 gcc make로 컴파일
wget http://download.redis.io/releases/redis-6.2.5.tar.gz
tar xzf redis-6.2.5.tar.gz
cd redis-6.2.5
make

# 디렉토리 생성 및 Redis 설정 파일 복사
sudo mkdir /etc/redis
sudo mkdir /var/lib/redis
sudo cp src/redis-server src/redis-cli /usr/local/bin/
sudo cp redis.conf /etc/redis/
```

## 2. redis.conf 설정

```bash
	sudo vi /etc/redis/redis.conf
```

아래내용들로 수정

```bash
bind 0.0.0.0
daemonize yes
supervised systemd
logfile /var/log/redis_6379.log
dir /var/lib/redis
```

## 3. **Redis 서버 초기화 스크립트 설정**

```bash
wget https://raw.github.com/saxenap/install-redis-amazon-linux-centos/master/redis-server
sudo mv redis-server /etc/init.d
sudo chmod 755 /etc/init.d/redis-server
```

## 4. systemd로 띄우기위해 redis-server 설정

```bash
sudo vim /etc/init.d/redis-server
```

아래내용들 확인 및 수정

```bash
config:      /etc/redis/redis.conf
pidfile:     /var/run/redis.pid
redis="/usr/local/bin/redis-server"
prog=$(basename $redis)
```

## 5. systemd로 redis-server 띄우기

```bash
systemctl daemon-reload
systemctl restart redis-server
systemctl status redis-server
```

아래와같이 떠야 정상적으로 뜬것

```bash
● redis-server.service - SYSV: Redis is a persistent key-value database
   Loaded: loaded (/etc/rc.d/init.d/redis-server; bad; vendor preset: disabled)
   Active: active (running) since 일 2022-02-20 10:35:32 UTC; 4s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 31139 ExecStart=/etc/rc.d/init.d/redis-server start (code=exited, status=0/SUCCESS)
   CGroup: /system.slice/redis-server.service
           └─31013 /usr/local/bin/redis-server 0.0.0.0:6379
```