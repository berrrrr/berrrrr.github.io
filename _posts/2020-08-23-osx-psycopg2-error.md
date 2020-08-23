---
layout: post
title: OSX에서 psycopg2 설치시에러나는 경우
subtitle: OSX에서 psycopg2 설치시에러나는 경우
categories: programming
tags: python
comments: true
---


MAC(OSX)에서 psycopg2 설치시 에러나는 경우

python에서 postgresql을 붙기위해 psycopg2 를 설치하려는데 `pip install psycopg2` 를 하면 자꾸 다음과 같이 에러가났다. 
```
Collecting psycopg2
  Using cached psycopg2-2.8.5.tar.gz (380 kB)
Building wheels for collected packages: psycopg2
  Building wheel for psycopg2 (setup.py) ... error
  ERROR: Command errored out with exit status 1:
```
이는 psycopg2 f를 설치할때 필요한 path가 안잡혀있으면 난다고한다. 


```
brew install postgresql

export LDFLAGS="-L/usr/local/opt/openssl/lib"

export CPPFLAGS="-I/usr/local/opt/openssl/include"

pip install psycopg2
```

위 내용대로 적용하니 정상적으로 설치가됐다. 