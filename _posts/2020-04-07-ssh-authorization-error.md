---
layout: post
title: ssh authorization error
subtitle: ssh authorization error
categories: programming
tags: infra
comments: true
---

## 발단
연구실에서 총 3대 PC에 하둡을 설치해서 클러스터링해서 돌리고있었다.
PC1 - namenode  
PC2 - datanode1  
PC3 - datanode2  

어느날부터 namenode가 제대로 뜨질 않았다.

에러메세지는 다음과 같았다
```
namenode: hduser@namenode: Permission denied (publickey).
```

namenode가 namenode의 ssh로 못붙고있는것이다. 본인의 public key를 소유하고있는데도.. 

## 전개
일반적으로 위와 같은 에러가날때의 답변은 이렇다
`/etc/ssh/sshd_config` 파일을 수정하고 ssh를 재시작하라.  
```
sudo nano /etc/ssh/sshd_config
PasswordAuthentication yes
sudo service sshd reload
```

근데 백번을 리로드해도 바뀌지않았고  
ssh key를 수십번을 재발급받아서 public key에 추가하였으나 계속 동일한 현상이 반복됐다

## 결말
해답은 [이 블로그](https://m.blog.naver.com/PostView.nhn?blogId=kamagod&logNo=150129032252) 에서 찾을 수 있었다..  
ssh로 접속할때 `tail -f /var/log/auth.log` 로 어떤이유로 권한이 거부당하는지 에러메세지를 볼수있는데,  
```
Authentication refused: bad ownership or modes for directory /home/hduser
```
위와 같은 에러메세지가 로깅되고있었다.  
찾아보니 홈디렉터리 권한이 낮아지면 ssh 접속자체가 거부당하는 문제가 있었던것이다.
랩실 학생 중 한명이 뭔가 하다가 무턱대고 home directory의 권한을 777로 풀었고 이후로 ssh 접속이 거부당하게된것이다.   
위 현상은 홈디렉터리의 권한을 원복하자 정상적으로 돌아왔다.  
