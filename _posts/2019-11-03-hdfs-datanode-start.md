---
layout: post
title: HDFS 에서 특정 datanode만 start하는법
subtitle: HDFS 에서 특정 datanode만 start하는법
categories: datascience
tags: hadoop
comments: true
---

hadoop에서 특정 datanode만 다운되는 경우가있다.  
그럴때 특정 datanode만 start하려면 sbin폴더로 가서 아래 명령어를 사용한다.  

## datanode만 재시작
```
hdfs --daemon start datanode
```

## deprecate된 명령어 (동작은함)
```
./hadoop-daemon.sh start datanode
```
