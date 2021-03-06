---
layout: post
title: CentOS7에 ELK stack 설치하기
subtitle: CentOS7에 ELK stack 설치하기
categories: programming
tags: infra
comments: true
---

CentOS7에 ELK(logstash + elastaic search + kibana)를 설치해보자

## Elastic search 설치 

### Import the Elasticsearch PGP Key
```
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
```

### Installing from the RPM repository
```
vim /etc/yum.repos.d/elasticsearch.repo
```
elasticsearch.repo 내용은
```
[elasticsearch-7.x]
name=Elasticsearch repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```

설정하고나서

```
sudo yum -y install elasticsearch
```

### Running elasticsearch with systemd
```
sudo systemctl start elasticsearch.service
sudo systemctl stop elasticsearch.service
```

### 방화벽설정
```
sudo firewall-cmd --permanent --add-port=9200/tcp
sudo firewall-cmd --permanent --add-port=9300/tcp
sudo firewall-cmd --reload
```

### 실행확인
```
curl -X GET http://localhost:9200
```

### Configuration Elasticsearch
(defualt path) /etc/elasticsearch/elasticsearch.yml 수정

## Kibana 설치

### Import the Elasticsearch PGP Key
```
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
```

### Installing from the RPM repository
```
vim /etc/yum.repos.d/kibana.repo
```
elasticsearch.repo 내용은
```
[kibana-7.x]
name=Kibana repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```

설정하고나서

```
sudo yum -y install kibana
```

### Running elasticsearch with systemd
```
sudo systemctl start kibana.service
sudo systemctl stop kibana.service
```

### 방화벽설정
```
sudo firewall-cmd --permanent --add-port=5601/tcp
sudo firewall-cmd --reload
```

### Configuration Elasticsearch
(defualt path) /etc/kibana/kibana.yml 수정


>참고  
https://www.elastic.co/guide/en/elasticsearch/reference/7.3/rpm.html#rpm-repo  
https://www.elastic.co/guide/en/kibana/7.3/rpm.html#rpm-repo  