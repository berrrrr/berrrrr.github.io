---
layout: post
title: annotation @Component와 @Bean 차이
subtitle: annotation @Component와 @Bean 차이
categories: programming
tags: spring
comments: true
---

springboot annotation @Component와 @Bean 차이

## @Component
개발자가 제어 가능한 custom class를 활용하여 만들 경우

## @Bean
개발자가 컨트롤이 불가능한 외부 라이브러리들을 Bean으로 등록하고 싶은 경우

## 개발자가 생성한 클래스에 @Bean 선언이 가능한가?
불가능ㄴ하다. @Bean과 @Component는 각자 선언할수있는 타입이 정해져있어 해당 용도 외에는 컴파일 에러를 발생시킨다. 