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
ln -s zeppelin-0.8.2-bin-all zeppelin
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

## 추가해야할 삽질 내용
```
java.lang.NoSuchMethodError: io.netty.buffer.PooledByteBufAllocator.defaultNumHeapArena()I
	at org.apache.spark.network.util.NettyUtils.createPooledByteBufAllocator(NettyUtils.java:113)
	at org.apache.spark.network.client.TransportClientFactory.<init>(TransportClientFactory.java:106)
	at org.apache.spark.network.TransportContext.createClientFactory(TransportContext.java:99)
	at org.apache.spark.rpc.netty.NettyRpcEnv.<init>(NettyRpcEnv.scala:71)
	at org.apache.spark.rpc.netty.NettyRpcEnvFactory.create(NettyRpcEnv.scala:461)
	at org.apache.spark.rpc.RpcEnv$.create(RpcEnv.scala:57)
	at org.apache.spark.SparkEnv$.create(SparkEnv.scala:249)
	at org.apache.spark.SparkEnv$.createDriverEnv(SparkEnv.scala:175)
	at org.apache.spark.SparkContext.createSparkEnv(SparkContext.scala:257)
	at org.apache.spark.SparkContext.<init>(SparkContext.scala:424)
	at org.apache.spark.SparkContext$.getOrCreate(SparkContext.scala:2520)
	at org.apache.spark.sql.SparkSession$Builder$$anonfun$7.apply(SparkSession.scala:935)
	at org.apache.spark.sql.SparkSession$Builder$$anonfun$7.apply(SparkSession.scala:926)
	at scala.Option.getOrElse(Option.scala:121)
	at org.apache.spark.sql.SparkSession$Builder.getOrCreate(SparkSession.scala:926)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.apache.zeppelin.spark.BaseSparkScalaInterpreter.spark2CreateContext(BaseSparkScalaInterpreter.scala:263)
	at org.apache.zeppelin.spark.BaseSparkScalaInterpreter.createSparkContext(BaseSparkScalaInterpreter.scala:182)
	at org.apache.zeppelin.spark.SparkScala211Interpreter.open(SparkScala211Interpreter.scala:90)
	at org.apache.zeppelin.spark.NewSparkInterpreter.open(NewSparkInterpreter.java:102)
	at org.apache.zeppelin.spark.SparkInterpreter.open(SparkInterpreter.java:62)
	at org.apache.zeppelin.interpreter.LazyOpenInterpreter.open(LazyOpenInterpreter.java:69)
	at org.apache.zeppelin.interpreter.remote.RemoteInterpreterServer$InterpretJob.jobRun(RemoteInterpreterServer.java:616)
	at org.apache.zeppelin.scheduler.Job.run(Job.java:188)
	at org.apache.zeppelin.scheduler.FIFOScheduler$1.run(FIFOScheduler.java:140)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
```
지금 제일 골머리를 앓게하는 문제인데..  
뭔 명령어를 쳐도 `java.lang.NoSuchMethodError`가 뜨면서 제플린노트 안에서 명령어가 안먹는 문제가 있다.  
좀더 찾아보고 해결되면 해결방법 추가하는걸로.. 