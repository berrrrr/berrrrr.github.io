---
layout: post
title: "Mybatis $과 # 차이"
subtitle: "Mybatis $과 # 차이"
categories: programming
tags: spring
comments: true
---

Mybatis $과 # 차이

## #{} - prepared Statement (동적)
- 파라미터가 String형태로 들어와 자동적으로 'parameter' 형식이 된다.  ex) 111 --> '111'
- SQL Injection을 예방할 수 있다. 
- pre statement
- select * from TABLE where col = ? 에서 ?에 bind된 값이 들어감. (set해줌)
- 컴파일된 내용을 재사용할 수 있음

## ${} - statement (정적)
- 파라미터가 바로 출력된다
- 해당 컬럼의 자료형에 맞추어 파라미터의 자료형이 변경된다.
- SQL Injection을 예방할 수 없다.
- table명이나 coloumn명을 파라미터로 전달하고싶을때 사용한다.
- 단순한 문자열 치환