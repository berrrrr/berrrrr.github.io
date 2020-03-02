---
title: java 기본클래스 을(를) 찾거나 로드할 수 없습니다
date: 2019-08-03 20:42:15
categories: 
 - Tips
tags: 
 - Java
 - Tips
sidebar:
 nav: "categories"
toc: true
toc_label: "List"
toc_icon: "list"
---

기본클래스 을(를) 찾거나 로드할 수 없습니다  

## 자바 실행 에러
기본클래스 을(를) 찾거나 로드할 수 없습니다  
--> 분명히 환경변수 세팅을 다 정상적으로 했는데도 
```
javac Test.java
java Test
```

명령어에서 위와 같은 오류가 발생할 때가 있다.

## 원인
상위 패키지에서 컴파일해야함

## 해결방법
예를들어 Test.java클래스가

chi.project.Test 경로에 속한 클래스라고하면 

프로젝트 디렉토리에 가서
```
javac -cp src\main\java src\main\java\chi\project\Test.java
```

chi 디렉토리의 상위 디렉토리로 가서 
```
java chi.project.Test
```
로 실행해주면 된다.