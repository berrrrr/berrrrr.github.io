---
layout: post
title: zeppelin 설치하기
subtitle: zeppelin 설치하기
categories: datascience
tags: hadoop
comments: true
---

구축한 hadoop ecosystem에 zeppelin을 추가해보자.  
zeppelin은 hadoop에 밀어넣은 데이터를 spark로 분석하고 시각화해주는 역할을 할 것이다.  

## 다운로드
[https://zeppelin.apache.org/download.html](https://zeppelin.apache.org/download.html) 에서 zeppelin tar.gz를 다운받는다. 


## 설치
설치해준다.
```
tar xvzf zeppelin-0.8.2-bin-all.tgz
ln -s zeppelin-0.8.2-bin-all.tgz zeppelin
```

## 환경설정

환경변수 추가해주고
```
vim ~/.bashrc
```

bashrc
```
export ZEPPELIN_HOME=/home/hduser/zeppelin
export PATH=$PATH:$ZEPPELIN_HOME/bin
```

~/zeppelin/conf 에서 zeppelin-env.sh.template 파일을 복사해 zeppelin-env.sh를 만들고 원하는 설정값을 넣는다
```
export ZEPPELIN_ADDR=127.0.0.1                         # Bind address (default 127.0.0.1)
export ZEPPELIN_PORT=9999   # 나는 다른 포트랑 겹치지 말라고 9999로 바꿔줌. default는 8080
export MASTER=spark://namenode:7077     # 설치한 spark의 master url을 넣어줌
```

## 실행
~/zeppelin/bin 에 들어가서
```
zeppelin-daemon.sh start
```

이제 브라우저에 localhost:9999 치고 들어가면 zeppelin 화면을 볼 수 있다.

## 중지
~/zeppelin/bin 에 들어가서
```
zeppelin-daemon.sh stop
```

## 삽질
분명 환경설정할때 MASTER 에 spark master url을 넣어줬는데..  실제로 zeppelin이 spark session을 못문다...  
yarn 설정을 잡아줘야되는건가 싶은데..  

결국 이런식으로 제플린 노트 내에서 spark session을 강제로 물려주면 실행이 된다.
```python
spark = SparkSession \
    .builder \
    .master("spark://namenode:7077") \
    .appName("spark_test") \
    .config(conf=conf) \
    .getOrCreate()
```

