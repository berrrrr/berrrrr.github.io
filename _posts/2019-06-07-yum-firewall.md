---
layout: post
title: 방화벽이 막혀있지 않은데 yum이 실행이 안되는 경우
subtitle: 방화벽이 막혀있지 않은데 yum이 실행이 안되는 경우
categories: programming
tags: infra
comments: true
---

## 문제점 및 에러메세지
Cent os에서  방화벽이 막혀있지 않은데 yum이 실행이 안되는경우  
[Errno 12] Timeout on http://10.6.12.28/centos-openstack-ocata/repodata/repomd.xml:  
등의 에러 발생  


## 발생원인
DNS서버 및 yum repository가 제대로 설정이 되어있지 않을 가능성이 있다.

## 해결방법
```
vi /etc/resolv.conf
```
resov.conf 에서 DNS 서버를 변경한다  
https://public-dns.info 에서 각 나라의 public dns server 주소 알수있음. 아무거나 넣으면됨

2. `/etc/yum.repos.d` 에 있는 yum respository 정보를 빠른 국내주소로 변경한다


