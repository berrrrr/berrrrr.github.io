---
layout: post
title: CentOS7 고정아이피로 바꾸기
subtitle: CentOS7 고정아이피로 바꾸기
categories: programming
tags: infra
comments: true
---
CentOS7 고정아이피로 바꾸기

기본적으로 CentOS7 의 network설정은 자동으로 받아오게되어있다.  
그런데 자꾸 ip가 바뀌어 원격설정에 지장이생겨 고정ip로 변경하게되었다.

(1) `ifconfig` 를 치면 지금 내 OS가 사용하고있는 인터넷의 이름이 뭔지 알수있다. 내 경우에는 ens33이었다.  
(2) /etc/sysconfig/network-scripts/ifcfg-{인터넷이름} 파일을 수정할것이다.  
나의경우에는 인터넷이름이 ens33이므로 `/etc/sysconfig/network-scripts/ifcfg-ens33` 파일을 수정할것이다.  
```
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

수정모드로 들어가면
```
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=dhcp
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
UUID=자신의 uuid
DEVICE=ens33
ONBOOT=yes
ZONE=

```
이런식으로 설정이 되어있다
이걸 아래와 같이 바꿔주면된다

```
TYPE=Ethernet
BOOTPROTO=static
DEFROUTE=yes
PEERDNS=yes
PEERROUTES=yes
NAME="내 인터넷 이름"
UUID="내 uuid"
DEVICE="내 device 이름"
ONBOOT="yes"
IPADDR=내가 고정하길 원하는 ip
NETMASK=내가 고정하길 원하는 netmask
GATEWAY=내가 고정하길 원하는 gateway
DNS1=내가 고정하길원하는 dns
DNS2=내가 고정하길원하는 dns
USERCTL=no
NM_CONTROLLED=yes
```