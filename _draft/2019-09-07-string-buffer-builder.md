---
layout: post
title: String vs StringBuffer vs Stringbuilder
subtitle: String vs StringBuffer vs Stringbuilder
categories: programming
tags: java
comments: true
---

java의 String vs StringBuffer vs Stringbuilder 차이는 무엇일까?

## String
불변의 문자열클래스. 한번 힙 영역에 생성되면 값을 변경시킬수없음.
연산이 많지 않고 조회를 주로하는 환경, 멀티스레드 환경에서 사용(불변)

## StringBuffer
가변의 문자열클래스. 동기화 지원. 멀티스레드환경에서 사용.

## Stringbuilder
가변의 문자열클래스. 동기화 미지원. 단일스레드환경에서 사용.

> 출처 https://blog.naver.com/good_ray/221596411200