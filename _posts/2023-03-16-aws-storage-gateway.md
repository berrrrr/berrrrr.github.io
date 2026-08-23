---
layout: post
title: "[AWS] AWS Storage Gateway란?"
subtitle: "[AWS] AWS Storage Gateway란?"
categories: programming
tags: devops
comments: true
---

> AWS Storage gateway에 대해 알아보자


### AWS storage gateway란?

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/aws-storage-gateway/01.png?raw=true)

gateway라는 이름에서 알 수 있듯이 aws 외부 온프레미스에서 aws내부 저장소(storage)에 접근할 일이 있을때 중간에서 권한제어를 위한 여러 옵션을 제공하는 녀석인듯하다

### File Gateway

aws storage gate에서 지원하는 기능은 여러개가 있지만 내가 관심있는 기능은 file gateway 하나라 이것만 조사함.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/aws-storage-gateway/02.png?raw=true)

on-premise의 file을 aws s3등에 전송할 수 있다
보니까 온프렘 서버에 파일게이트웨이를 설치하고 거기에 nfs 나 smb로 데이터를 전송하면 file gateway가 aws에 전송해주는 모양.
이때 SSL을 사용해 전송되는 데이터를 암호화하여 데이터를 안전하게 업로드/다운로드할 수 있다
최근에 쓰거나 읽은데이터의 캐시를 유지관리해서 빠른 속도로 작업을 할 수 있다

#### Endpoint option

public internet을 통해서 파일을 전송할 수도 있고, VPC 엔드포인트를 이용해서 전송할수도 있음
보안을 생각한다면 아마 보통 후자를 사용할듯싶다

#### Gateway connection option

게이트웨이를 연결하기위해서는 게이트웨이를 VM에 띄우고, 여기에 접속해야함
이때 IP로 접속하거나 Activation Key를 통해서 접속할 수 있다

#### Monitoring

file gateway에 cloudwatch log 및 alarm을 설정할 수 있다.

#### File shares

특정 s3를 지정해서 file 을 공유할수있음. 그러면 온프렘에 nfs를 마운트하고 해당 마운트 폴더에 파일을 넣어주면?! 이게 바로 공유가 된다.
