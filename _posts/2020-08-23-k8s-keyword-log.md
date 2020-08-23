---
layout: post
title: '[k8s] 특정 키워드를 포함하는 pod들 로그 전부 파일로 떨구기'
subtitle: '[k8s] 특정 키워드를 포함하는 pod들 로그 전부 파일로 떨구기'
categories: programming
tags: infra
comments: true
---

특정 키워드를 포함하는 pod들 로그 전부 파일로 떨구는 쉘스크립트.  
쉘스크립트 잘 못쓰는데 야매로 필요한 명령어만 찾아서 짜놓으니까 쓸데가 많아서 블로그에 저장해놓음.

```sh
#!/bin/bash

# keyword를 포함하는 PODS 목록 뽑음
PODS=(`kubectl get pods 2>&1 | awk '{print $1}' | grep keyword`)
#echo ${PODS[*]}

# 오늘 날짜 저장 
MONTH=`date +%m`
DAY=`date +%d`
DATE=$MONTH$DAY

# 날짜_POD명.log 형식으로 로그 떨굼 
for POD in "${PODS[@]}"; do
        #echo get $POD logs;
        #echo kubectl logs $POD > ~/Documents/logs/$MONTH$DAY_$POD.log;
        LOG_NAME="${DATE}_${POD}.log";
        echo $LOG_NAME;
        kubectl logs $POD > ~/Documents/logs/$LOG_NAME;
done
exit
```
