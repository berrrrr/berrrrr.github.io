---
layout: post
title: sshd 기본 port변경
subtitle: sshd 기본 port변경
categories: programming
tags: infra
comments: true
---


sshd 에 기본포트가 잘못잡혀서..
ssh 외부ip 이렇게쳤을대 자꾸 22포트가 아닌 다른포트가 잡혀서 고생을했다.\
ssh로 외부접속할때 접속시도하는 기본포트 설정은 아래에있다

```
vim /etc/ssh/ssh_config
```
여기서 Port정보를 변경해준다. 


재시작
```
sudo systemctl restart sshd.service
```