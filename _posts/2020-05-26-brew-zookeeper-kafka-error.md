---
layout: post
title: brew로 설치한 zookeeper, kafka 에러
subtitle: brew로 설치한 zookeeper, kafka 에러
categories: programming
tags: infra
comments: true
---

## brew로 설치한 zookeeper, kafka 에러
OSX에서 Homebrew로 설치한 zookeeper, kafka 가 계속 정상적으로 올라오지 않고 에러가났다. 

## 로그확인

처음에 `brew services ls` 로 서비스들의 상태를 확인했을때는 마치 kafka만 에러인 것 처럼 보였다. 
```
Name       Status  User  Plist
hbase      stopped
kafka      error kakao /Users/kakao/Library/LaunchAgents/homebrew.mxcl.kafka.plist
postgresql started kakao /Users/kakao/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
redis      stopped
tomcat     stopped
zookeeper  started kakao /Users/kakao/Library/LaunchAgents/homebrew.mxcl.zookeeper.plist
```
`/usr/local/var/log` 에서 service 들의 로그를 볼 수 있는데, kafka에서 zookeeper로 연결할때 connection 에러가 나고있었다. 
```
Exception in thread "main" kafka.zookeeper.ZooKeeperClientTimeoutException: Timed out waiting for connection while in state: CONNECTING
	at kafka.zookeeper.ZooKeeperClient.$anonfun$waitUntilConnected$3(ZooKeeperClient.scala:259)
	at scala.runtime.java8.JFunction0$mcV$sp.apply(JFunction0$mcV$sp.java:23)
	at kafka.utils.CoreUtils$.inLock(CoreUtils.scala:253)
	at kafka.zookeeper.ZooKeeperClient.waitUntilConnected(ZooKeeperC…
```

그래서 이번에는 zookeeper 로그를 봤더니 아래와 같이 에러가 나고있었다. (근데 `brew services ls`에서는 정상인척한다.)
```
2020-04-17 15:20:09 NIOServerCnxnFactory [ERROR] Thread Thread[main,5,main] died
java.lang.NoSuchMethodError: java.nio.ByteBuffer.clear()Ljava/nio/ByteBuffer;
        at org.apache.jute.BinaryOutputArchive.stringToByteBuffer(BinaryOutputArchive.java:77)
        at org.apache.jute.BinaryOutputArchive.writeString(BinaryOutputArchive.java:107)
        at org.apache.zookeeper.data.Id.serialize(Id.java:50)
        at org.apache.jute.BinaryOutputArchive.writeRecord(BinaryOutputArchive.java:123)
        at org.apache.zookeeper.data.ACL.serialize(ACL.java:51)
        at org.apache.zookeeper.server.ReferenceCountedACLCache.serialize(ReferenceCountedACLCache.java:136)
        at org.apache.zookeeper.server.DataTree.serialize(DataTree.java:1218)
        at org.apache.zookeeper.server.util.SerializeUtils.serializeSnapshot(SerializeUtils.java:152)
        at org.apache.zookeeper.server.persistence.FileSnap.serialize(FileSnap.java:210)
        at org.apache.zookeeper.server.persistence.FileSnap.serialize(FileSnap.java:227)
        at org.apache.zookeeper.server.persistence.FileTxnSnapLog.save(FileTxnSnapLog.java:406)
        at org.apache.zookeeper.server.persistence.FileTxnSnapLog.restore(FileTxnSnapLog.java:248)
        at org.apache.zookeeper.server.ZKDatabase.loadDataBase(ZKDatabase.java:240)
        at org.apache.zookeeper.server.ZooKeeperServer.loadData(ZooKeeperServer.java:290)
        at org.apache.zookeeper.server.ZooKeeperServer.startdata(ZooKeeperServer.java:450)
        at org.apache.zookeeper.server.NIOServerCnxnFactory.startup(NIOServerCnxnFactory.java:764)
        at org.apache.zookeeper.server.ServerCnxnFactory.startup(ServerCnxnFactory.java:98)
        at org.apache.zookeeper.server.ZooKeeperServerMain.runFromConfig(ZooKeeperServerMain.java:144)
        at org.apache.zookeeper.server.ZooKeeperServerMain.initializeAndRun(ZooKeeperServerMain.java:106)
        at org.apache.zookeeper.server.ZooKeeperServerMain.main(ZooKeeperServerMain.java:64)
        at org.apache.zookeeper.server.quorum.QuorumPeerMain.initializeAndRun(QuorumPeerMain.java:128)
        at org.apache.zookeeper.server.quorum.QuorumPeerMain.main(QuorumPeerMain.java:82)

```

추측컨데 자바 버전과 zookeeper 최신버전이 맞지않아서인듯하다.

```
openjdk version "1.8.0_232"
OpenJDK Runtime Environment (AdoptOpenJDK)(build 1.8.0_232-b09)
OpenJDK 64-Bit Server VM (AdoptOpenJDK)(build 25.232-b09, mixed mode)
```


## 특정버전으로 재설치
기존 zookeeper, kafka를 삭제하고 
```
brew uninstall --force zookeeper
brew uninstall --force kafka

```
아래 명령어로 zookeeper와 kafka를 강제로 낮은 버전으로 설치해줬다.  
```
# force install zookeeper first
brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/6d8197bbb5f77e62d51041a3ae552ce2f8ff1344/Formula/zookeeper.rb

# then force install kafka compatible with zookeeper 3.4.14
brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/6d8197bbb5f77e62d51041a3ae552ce2f8ff1344/Formula/kafka.rb
```

실행하니 드뎌 잘된다. ㅎㅎ