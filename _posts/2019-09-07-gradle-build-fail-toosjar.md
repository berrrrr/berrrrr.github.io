---
layout: post
title: gralde build시 could not find tools.jar 에러
subtitle: gralde build시 could not find tools.jar 에러
categories: programming
tags: spring
comments: true
---
```
gradle build could not find tools.jar. please check that ~  
```
이런식으로 나오는 에러

## 원인
gradle 설정에 java 경로가 제대로 안잡혀있어서그렇다

## 해결방법
이클립스의경우  
Window > preference > gradle > java home을 실제 내 로컬의 java home directory로 잡아주고나서 gradle build하면 성공한다. 