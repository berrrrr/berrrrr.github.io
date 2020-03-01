---
title: CentOS 7에 python3.6 설치하기
date: 2019-08-03 20:50:24
categories: 
 - Python
tags: 
 - Python
sidebar:
 nav: "categories"
toc: true
toc_label: "List"
toc_icon: "list"
---
# CentOS 7에 python3.6 설치하기 
CentOS 7버전에 python 3.6버전 설치하기

리눅스는 대부분 python 2.x 버전이 설치되어 있는데, Allias 를 python 으로 하면 나중에 yum 을 이용할 때 문제가 발생한다. 그래서 여기서는 Alias 를 'python3' 으로 지정했다

1) yum 으로 python3.6 설치
```
$ yum install -y https://centos7.iuscommunity.org/ius-release.rpm
$ yum search python3
$ yum install -y python36u python36u-libs python36u-devel 
```

2) 설치 및 위치 확인
```
# 설치 확인
$ python3.6 -V
# 설치장소 확인
$ which python3.6
```

3) Alias 설정(python3.6, pip3.6 등)
```
# 현재 python 커맨드의 Alias를 확인하면 python → python2 → python2.7로 되어 있음
# Alias 확인
$ ls -l /bin/python*
# python3 으로 등록(python 으로 등록하면 yum 사용할 수 없음.)
$ ln -s /bin/python3.6 /bin/python3

# pip3.6 을 pip3 으로 설정
$ ln -s /bin/pip3.6 /bin/pip3
```

4) 설치확인
```
$ python3 -V
$ pip3 -V
```


> [출처] [python3] CentOS7에 python3.6 설치하기|작성자 demonic
 https://blog.naver.com/varkiry05/221213600251

