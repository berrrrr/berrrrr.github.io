---
layout: post
title: Ubuntu에서 port forwarding하기
subtitle: Ubuntu에서 port forwarding하기
categories: programming
tags: infra
comments: true
---

Ubuntu linux 에서 port forwarding하기

## 명령어
```
sysctl net.ipv4.ip_forward=1
iptables -t nat -A PREROUTING -p tcp --dport CUR_PORT -j DNAT --to-destination DES_IP:DES_PORT
iptables -t nat -A POSTROUTING -j MASQUERADE
```

## 초기화

```
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT
iptables -t nat -F
iptables -t mangle -F
iptables -F
iptables -X
```

## 초기화(ip6)
```
ip6tables -P INPUT ACCEPT
ip6tables -P FORWARD ACCEPT
ip6tables -P OUTPUT ACCEPT
ip6tables -t nat -F
ip6tables -t mangle -F
ip6tables -F
ip6tables -X
```