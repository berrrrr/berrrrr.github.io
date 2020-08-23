---
layout: post
title: zeppelin 과 spark 연동시 삽질 에러 모음
subtitle: subtitle:Enter subtitle
categories: datascience
tags: spark
comments: true
---

애증의 zeppelin.. 이쁘게 시각화해주는데 spark랑 찰떡궁합이어야하는놈이 왜이리 삐걱거리는지 고생을 많이 시켰다. 삽질내용 정리해보았다.

## 삽질1
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
(이건 정석 해결방법은 아니고 걍 우회적으로 해결..yarn위에 hadoop, spark, zeppelin 모두 올리면 해결될거같다) 

## 삽질2
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
한달넘게 골머리를 앓게한문제이다.
뭔 명령어를 쳐도 `java.lang.NoSuchMethodError: io.netty.buffer.PooledByteBufAllocator.defaultNumHeapArena()`가 뜨면서 제플린노트 안에서 명령어가 안먹는 문제였다.

3/27 드뎌 해결방법 찾음..!!  
spark의 netty 버전과 zeppelin의 netty 버전이 맞지 않아서 생겼던 오류로..  
spark의 netty jar파일을 갖고와서 zeppelin에 넣어주니 해결되었다.  
spark 의 netty jar파일은 `${SPARK_HOME}/jars`에 있고 zeppelin의 netty jar파일은 `${ZEPPELIN_HOME}/lib`에 있다.  
아래와 같이 zeppelin이 기존 갖고있는 netty jar파일은 삭제해버리고 spark netty jar파일을 복사해오면된다.  
```
cp ~/spark/jars/netty-all-4.1.17.Final.jar ~/zeppelin/lib/
```
이것도 중국사이트 구글링하다가 해결함.. 최근 stack overflow에서도 해결 안되는부분을 중국사이트에서 힌트를 얻어서 해결하는 경우가 많은거같다.   

## 삽질3
위 에러를 해결했다 싶었는데 또 복병으로 나타나는 에러가 있다.
```
Caused by: com.fasterxml.jackson.databind.JsonMappingException: Incompatible Jackson version: 2.8.11-1
    at com.fasterxml.jackson.module.scala.JacksonModule$class.setupModule(JacksonModule.scala:64)
    at com.fasterxml.jackson.module.scala.DefaultScalaModule.setupModule(DefaultScalaModule.scala:19)
    at com.fasterxml.jackson.databind.ObjectMapper.registerModule(ObjectMapper.java:747)
    at org.apache.spark.rdd.RDDOperationScope$.<init>(RDDOperationScope.scala:82)
    at org.apache.spark.rdd.RDDOperationScope$.<clinit>(RDDOperationScope.scala)
    ... 16 more
```
jackson 버전이 안맞는다는..^^;;  
다행히 위 원인과 동일한 원인이다.
spark에서 사용하는 jackson과 zeppelin에서 사용하는 jackson 라이브러리 버전이 맞지 않아서그런것이다. 
```
cp ~/spark/jars/jackson* ~/zeppelin/lib/
```
spark가 가지고 있는 jackson 관련 jar파일들을 전부 zeppelin lib폴더로 옮기면 해결된다. 

> 출처 : https://www.jianshu.com/p/983b4cc59137