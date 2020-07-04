---
layout: post
title: SpringBootApplication 어노테이션
subtitle: SpringBootApplication 어노테이션
categories: programming
tags: spring
comments: true
---

@SpringBootApplication 어노테이션에 대해 알아보자.

# @SpringBootApplication 의 3가지 특징
- @EnableAutoConfiguration : Spring Boot의 자동화 기능(Spring 설정)을 활성화
- @ComponentScan : 패키지내 Compnonet와 Bean 을 Scan
- @Configuration : Bean에 대해서 Context에 추가하거나 특정 클래스를 참조해올 수 있습니다

즉 @SpringBootApplication 어노테이션을 쓰면 위 3개 어노테이션을 쓴 효과를 볼 수 있다.

