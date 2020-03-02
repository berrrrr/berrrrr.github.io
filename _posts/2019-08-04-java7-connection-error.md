---
layout: post
title: Java 7 에서 특정 Api만 Connection reset Error 
subtitle: Java 7 에서 특정 Api만 Connection reset Error 
categories: programming
tags: java
comments: true
---

java 7 Connection reset Error

## 문제점 및 에러메세지

JDK 1.7 (JAVA7) 에서 특정 https request가   
org.apache.http.impl.execchain.RetryExec execute  
정보: I/O exception (java.net.SocketException) caught when processing request to {s}->{주소}: Connection reset  
에러를 뱉으며 연결되지 않는 현상

## 발생 원인
Java7에서 tls1.2를 지원하지 않는 것을 의심했으나 여러 테스트 결과 tls1.2 문제는 아닌듯함

## 해결방법
1. Java8버전으로 올린다. (java8부터는 에러가안남)
2. 불가피하게 java7을 사용하여야하는 경우 jersey client를 이용한다.  

```xml
 <dependency>
            <groupId>org.glassfish.jersey.core</groupId>
            <artifactId>jersey-client</artifactId>
            <version>2.25</version>
 </dependency>
```
