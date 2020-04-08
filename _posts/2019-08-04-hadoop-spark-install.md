---
layout: post
title: Hadoop & Spark 설치하기
subtitle: Hadoop & Spark 설치하기
categories: datascience
tags: hadoop
comments: true
---

Hadoop & Spark 설치

## java 설치

(1) java 설치파일 다운로드
[https://www.oracle.com/technetwork/java/javase/downloads/index.html](https://www.oracle.com/technetwork/java/javase/downloads/index.html)
여기서 8버전이상의 java 파일 다운로드

(2) scp로 리눅스에 업로드

(3) 설치 - 가장 대중적으로 설치되는 /usr/local에 설치
```
mv jdk-8u221-linux-x64.tar.gz  /usr/local
tar -xvf jdk-8u221-linux-x64.tar.gz
```
자바 버전이 뜨면 정상적으로 설치 완료

(4) 심볼릭링크 생성
```
ln -s jdk1.8.0_221/ java
```
이제 java접근시 /usr/local/java로 접근하면됨

(5) 환경변수 설정
사용자 profile에 다음의 환경변수들을 추가한다.  
(centOS, openjdk 기준. 각자 자기 환경에 맞게 환경변수를 넣어줘야함.)

```
vim ~/.bashrc
```

```
export JAVA_HOME=/usr/local/java
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH="."
```

```
source ~/.bashrc
```

(6) 설치확인

```
java -version
```
자바 버전이 뜨면 정상적으로 설치 완료

## SSH 키 만들기
여러개 서버가 ssh 통신을 하기 위한 작업으로 1개서버만 돌린다면 생략해도 됨.
```
[hduser@localhost ~]$ ssh-keygen -t rsa -P ''
[hduser@localhost ~]$ ssh localhost
[hduser@localhost .ssh]$ cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
[hduser@localhost .ssh]$ chmod 0600 ~/.ssh/authorized_keys
```
ssh key를 생성하고 공개키를 authorized_keys 파일에 추가  
(그래야 암호 없이 ssh 접속 가능)

## HOST 변경
여러개 서버일경우 아래와 같이 호스트명 변경해서 사용해야 연결이 쉬움  

(1) 각 PC 호스트파일변경
```
vim /etc/hosts
```
```
192.168.29.115 master
192.168.29.143 worker1
```

(2) master PC 호스트네임 변경
```
hostnamectl set-hostname master
```
(3) worker PC 호스트네임 변경

```
hostnamectl set-hostname worker1
```

(4) 재부팅
```
reboot
```

(5) master의 ssh key를 worker에 적용
```
[hduser@master ~]$ ssh-copy-id  -i ~/.ssh/id_rsa.pub worker1
``` 

master가 namenode역할을하고  
worker1가 datanode 역할을 할것임.  
보통 1개의 namenode (master) 와 여러개의 datanode(workers)를 가지게 환경설정하는데  
일단 나는 실습용으로 1개 namenode(master)와 1개datanode(worker1) 를 세팅함.

## hadoop 설치

(1) hduser 생성
```
adduser hduser
```

(2) hadoop 설치
(https://hadoop.apache.org/releases.html)[https://hadoop.apache.org/releases.html]
에서 최신버전 binary 다운로드받아 sftp나 winSCP등으로 서버에 upload
```
tar xvzf hadoop-3.2.0.tar.gz
```

(3) 심볼릭 링크 생성  
나는 /home/hduser/hadoop-3.2.0 에 설치하였다.  
이에대한 심볼릭링크를 생성해주면 이후 버전업 등에 유연하게 대처할 수 있다.   
앞으로는 hadoop 에 접근할때 /home/hduser/hadoop으로 접근하면된다.  
```
ln -s hadoop-3.2.0 hadoop
```

(4) 환경변수 설정
사용자 profile에 다음의 환경변수들을 추가한다.  
(centOS, openjdk 기준. 각자 자기 환경에 맞게 환경변수를 넣어줘야함.)
```
vim ~/.bashrc
```

```
export JAVA_HOME=/usr/local/java

export HADOOP_HOME=/home/hduser/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export HADOOP_YARN_HOME=$HADOOP_HOME
export HADOOP_CLASSPATH=${JAVA_HOME}/lib/tools.jar
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export HADOOP_OPTS="-Djava.library.path=$HADOOP_INSTALL/lib/native"

export PATH=:$PATH:/usr/local/java/lib/tools.jar:$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$JAVA_HOME/bin

```

```
source ~/.bashrc
```

(5) master서버에 worker들 등록
/home/hduser/hadoop 에 pids 디렉토리를 만들어준다
```
mkdir /home/hduser/hadoop/pids
```
workers파일 수정해준다.
```
/home/hduser/hadoop/etc/hadoop/workers
```
```
worker1
```
구 버전에서는 slaves 파일로 설정을 잡았던듯.  
최신버전에서는 workers 파일로 작성해준다.  


(6) master서버 $HADOOP_HOME/etc/hadoop/hadoop-env.sh 설정  
hadoop 환경변수를 추가해준다.
```
export JAVA_HOME=/usr/local/java
export HADOOP_PID_DIR=/home/hduser/hadoop/pids
```

(7) $HADOOP_HOME/etc/hadoop/core-site.xml 설정  
```
<configuration>
<property>
<name>fs.default.name</name>
<value>hdfs://master:9000</value>
</property>
</configuration>
```

(8) $HADOOP_HOME/etc/hadoop/hdfs-site.xml 설정
```
<configuration>
 <property>
  <name>dfs.replication</name>
  <value>1</value>
 </property>

 <property>
  <name>dfs.namenode.name.dir</name>
  <value>/home/hduser/data/dfs/namenode</value>
 </property>

 <property>
  <name>dfs.namenode.checkpoint.dir</name>
  <value>/home/hduser/data/dfs/namesecondary</value>
 </property>

 <property>
  <name>dfs.datanode.data.dir</name>
  <value>/home/hduser/data/dfs/datanode</value>
 </property>

 <property>
  <name>dfs.http.address</name>
  <value>master:9870</value>
 </property>

 <property>
  <name>dfs.secondary.http.address</name>
  <value>worker1:9868</value>
 </property>
</configuration>

```
dfs.replication : 파일의 기본 복제본 수를 지정. default값은 3.
여기서는 데이터노드가 1개이므로 복제수를 1로 지정.  
secondary namenode는 걍 worker1로 지정함.  
일반적으로는 datanode를 3개 두고 3개 복제하여 사용하는것이 일반적임.

(9) $HADOOP_HOME/etc/hadoop/mapred-site.xml 설정
맵리듀스에서 사용할 환경정보 설정
```
<configuration>
 <property>
  <name>mapreduce.framework.name</name>
  <value>yarn</value>
 </property>
 <property>
  <name>yarn.app.mapreduce.am.env</name>
  <value>HADOOP_MAPRED_HOME=/home/hduser/hadoop</value>
 </property>

 <property>
  <name>mapreduce.map.env</name>
  <value>HADOOP_MAPRED_HOME=/home/hduser/hadoop</value>
 </property>

 <property>
  <name>mapreduce.reduce.env</name>
  <value>HADOOP_MAPRED_HOME=/home/hduser/hadoop</value>
 </property>
</configuration>
```

(10) namenode 포맷
```
hdfs namenode -format
```

(11) hadoop 시작
```
# dfs daemon 시작

[hduser@master sbin]$ ./start-dfs.sh
Starting namenodes on [master]
Starting datanodes
Starting secondary namenodes [worker1]

#yarn daemon 시작
[hduser@master hadoop]$ start-yarn.sh
Starting resourcemanager
Starting nodemanagers

# 아니면 start-all.sh로 시작해도됨
```

(12) 실행확인
```
[hduser@master sbin]$ jps
25024 ResourceManager
24642 NameNode
25331 Jps
[root@worker1 ~]# jps
17872 NodeManager
18021 Jps
17640 DataNode
17724 SecondaryNameNode
```

(13) 종료
```
[hduser@master hadoop]$ stop-yarn.sh
Stopping nodemanagers
Stopping resourcemanager
[hduser@master hadoop]$ stop-dfs.sh
Stopping namenodes on [master]
Stopping datanodes
Stopping secondary namenodes [worker1]

# 아니면 stop-all.sh 로 종료해도 됨
```

참고 https://javaworld.co.kr/77  
https://blog.naver.com/man_do__/221539061708  
https://hadoop.apache.org/docs/r3.1.2/


## Hadoop 각 노드 역할

### namenode
메타데이터(파일이름, 파일크기, 파일생성시간, 파일접근권한, 파일 소유자 및 그룹소유자, 파일이 위치한 블록 정보 등) 관리, 데이터노드의 관리

### datanode
블록의 실질적인 읽기와 쓰기 담당. 

### secondary namenode
namenode의 fsimage(block위치정보), edits(트랜잭션 기록)파일을 주기적으로 합치고 최신 블록의 상태로 파일 생성.  
디스크부족문제 방지


## spark 설치

(1) spark download  
[http://spark.apache.org/downloads.html](http://spark.apache.org/downloads.html)
에서 최신버전 binary 다운로드받아 sftp나 winSCP등으로 서버에 upload
```
tar xvzf spark-2.4.3-bin-hadoop2.7.tgz
```

(2) 심볼릭 링크 생성  
나는 /home/hduser/spark-2.4.3-bin-hadoop2.7 에 설치하였다.  
이에대한 심볼릭링크를 생성해주면 이후 버전업 등에 유연하게 대처할 수 있다.   
앞으로는 spark 에 접근할때 /home/hduser/spark 접근하면된다.  
```
ln -s spark-2.4.3-bin-hadoop2.7 spark
```
(3) 환경변수 설정
사용자 profile에 다음의 환경변수들을 추가한다.  
```
vim ~/.bashrc
```

```
export PATH=:$PATH:/usr/local/java/lib/tools.jar:$HADOOP_HOME/sbin:$HADOOP_HOME/bin:/home/hduser/spark/bin
```

spark는 PATH부분에만 :/home/hduser/spark/bin 를 추가해주면 된다. 

(4) 실행
```
[hduser@localhost ~]$ spark-shell

Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 2.4.3
      /_/

Using Scala version 2.11.12 (OpenJDK 64-Bit Server VM, Java 1.8.0_212)
Type in expressions to have them evaluated.
Type :help for more information
```

위와같이 뜨면 spark 기본설정이 잘 된것이다

>참고 : https://hajiz.tistory.com/entry/%EC%95%84%EB%AC%B4%EA%B2%83%EB%8F%84-%EB%AA%B0%EB%9D%BC%EB%8F%84-%EC%84%A4%EC%B9%98%ED%95%A0-%EC%88%98-%EC%9E%88%EB%8A%94-Spark-202-%EC%84%A4%EC%B9%98-%EA%B0%80%EC%9D%B4%EB%93%9C#recentComments



## hadoop 이나 spark 접속이안될때
방화벽 문제일수있음  
centos는 
```
sudo firewall-cmd --zone=public --add-port=9000/tcp --permanent
sudo firewall-cmd --reload
```
ubuntu는  
```
sudo ufw allow 9000
sudo ufw reload
```
내 경우 datanode 접근 포트인 9000이 안뚫려있어서 가동이 안됐었음.  
9000 포트 뚫어주니 datanode 정상적으로 올라감.  
9870 포트도 뚫기전에는 웹에서 안떴었음.  
9870 포트 뚫어주니 hdfs site 정상적으로 접속됨.  
