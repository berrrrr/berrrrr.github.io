---
layout: post
title: Maven이란?
subtitle: Maven이란?
categories: programming
tags: spring
comments: true
---

# MAVEN

## MAVEN 이란? 
- Apache에서 개발한 자바 프로젝트의 빌드 자동화 도구

- 주로 라이브러리 의존성 관리를 위해 사용되며, 프로젝트에서 필요한 라이브러리들을 POM(Project Object Model)에 정의해주면, Maven이 네트워크를 통해 자동으로 다운로드하여 프로젝트에 주입해준다.

- Spring Framework랑 같이 많이 쓰인다. 

## MAVEN 설치

[https://maven.apache.org/download.cgi#](https://maven.apache.org/download.cgi#)  
위 사이트에서 최신버전으로 다운로드 받은 뒤 압축을 풀면 됨.  
(설치하는 형식이 아님. 압축풀고 끝)

## 환경변수 설정
1. 시스템 환경변수 설정에 들어간다. 
2. MAVEN_HOME - 다운로드받아 저장한 maven home directory 
3. PATH 변수에 ;%MAVEN_HOME%bin 추가한다. 

## GROUP ID, ARTIFACT ID
- Group ID 

uniquely identifies your project across all projects. A group ID should follow Java's package name rules. This means it starts with a reversed domain name you control. For example,
`org.apache.maven`, `org.apache.commons`  
프로젝트 전반을 정의할 수 있는 ID. java의 패키지 이름 룰을 따름. 


- Artifact ID  

name of the jar without version. If you created it, then you can choose whatever name you want with lowercase letters and no strange symbols. If it's a third party jar, you have to take the name of the jar as it's distributed.  
jar의 이름.(버전 표기x)

