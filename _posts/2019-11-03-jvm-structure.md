---
layout: post
title: JVM 메모리구조
subtitle: JVM 메모리구조
categories: programming
tags: java
comments: true
---

JVM(Java Virtual Machine)의 메모리 구조를 알아보자.

## JAVA 프로그램 수행 과정
![129](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/129.png?raw=true)
- JAVA source File : 사용자가 작성한 Java code (.java)
- JAVA Compiler : Java Source파일을 JVM이 해석할 수 있는 Java Byte Code로 변경.
- JAVA Byte Code : Java Compiler에 의해 수행된 결과물 (.class)
- Class Loader : JVM내로 .class파일들을 Load하여 Lading된 클래스들을 Runtime Data Area에 배치.
- Execution Engine : Loading된 클래스의 Bytecode를 해석(Interpret)
- Runtime Data Area : JVM이라는 프로세스가 프로그램을 수행하기 위해 OS에서 할당 받은 메모리 공간. 

## Runtime Data Area
- Method Area : 클래스, 변수, Method, static 변수, 상수 정보 등이 저장되는 영역. (모든 Thread 공유)
- Heap Area : new 명령어로 생성된 인스턴스와 객체가 저장되는 구역. (모든 Thread 공유. GC 이슈의 원인)
- Stack Area : Method 내에서 사용되는 값들(매개변수, 지역변수, 리턴값 등)이 저장되는 구역. LIFO으로 생성/제거됨 (각 Thread별 생성)
- PC Register : 현재 수행중인 JVM 명령의 주소값이 저장 (각 Thread별 생성)
- Native Method Stack : 다른 언어의 메소드 호출을 위해 할당되는 구역으로 언어에 맞게 Stack 형성. 

> https://blog.naver.com/kingwjdduq/221221508736