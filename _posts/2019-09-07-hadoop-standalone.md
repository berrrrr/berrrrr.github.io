---
layout: post
title: standalone으로 hadoop 설치시 설정값
subtitle: standalone으로 hadoop 설치시 설정값
categories: datascience
tags: hadoop
comments: true
---

## standalone으로 hadoop 설치시 설정값
서버 1대에 namenode, datanode 모두 한대씩만 standalone으로 hadoop 설치할때 config 모음

## coresite.xml
```
<configuration>
<property>
<name>fs.default.name</name>
<value>hdfs://localhost:9000</value>
</property>
</configuration>
```

## hdfs-site.xml
```
<configuration>
<property>
<name>dfs.replication</name>
<value>1</value>
</property>
<property>
<name>dfs.name.dir</name>
<value>/data/namenode</value>
</property>
<property>
<name>dfs.data.dir</name>
<value>/data/datanode</value>
</property>
</configuration>
```


## yarn-site.xml
```
<configuration>

<!-- Site specific YARN configuration properties -->

</configuration>
```
-> yarn은 클러스터링해주는 툴인데 어차피 standalone이므로 클러스터링할게없으므로 비워주면된다.
