---
layout: post
title: Spring Framework란
subtitle: Spring Framework란
categories: programming
tags: spring
comments: true
---

## Spring framwwork
자바 엔터프라이즈 개발을 편하게 해주는 경량급 오픈소스 애플리케이션 프레임워크. 동적인 웹 사이트를 개발하기 위한 여러 가지 서비스를 제공하고 있다. 대한민국 공공기관의 웹 서비스 개발 시 사용을 권장하고 있는 전자정부 표준프레임워크의 기반 기술로서 쓰이고 있다.

## Spring boot
기존의 Spring Framework 에서 설정했던 많은 내용들 (web.xml, dependency, datasource 관련 xml, 기타 xml)을 자동으로 구성해 주면서 사용자로 하여금 꼭 필요한 부분만 간단하게 개발할 수 있는 환경을 제공  



## 장점

1) IoC (Inversion of Control)
자바의 반영(reflection)을 이용해서 객체의 생명주기를 관리하고 의존성 주입(Dependency Injection)을 통해 각 계층이나 서비스들간의 의존성을 맞춰준다. 이러한 기능들은 주로 환경설정을 담당하는 XML 파일에 의해 설정되고 수행된다.  
ex. templete-method pattern  
ex. factory pattern  

2) DI (Dependency Injection)
의존관계주입.
각각의 계층이나 서비스들 간에 의존성이 존재할 경우 Spring이 서로 연결시켜준다.  
POJO 객체들 사이의 의존 관계를 Spring이 알아서 연관성을 맺어준다.  

3) AOP(Aspect Oriented Programming)
관점중심 프로그래밍.  
Spring은 핵심적인 비즈니스 로직과 관련이 없으나 여러 곳에서 공통적으로 쓰이는 기능들을 분리(공통 관심사를 분리)하여 개발하고 실행 시에 서로 조합할 수 있는 AOP를 지원한다.
이를 통해 코드를 단순하고 깔끔하게 작성할 수 있다.

4) 생명주기

5) POJO
Plain Old Java Object
상속, 인터페이스가 필요없는 아주 단순하고 가벼운 객체를 의미한다.  
원하는 business logic만 넣을 수 있도록 돕는다  
https://gmlwjd9405.github.io/2018/10/26/spring-framework.html  