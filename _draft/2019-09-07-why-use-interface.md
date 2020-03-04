---
layout: post
title: Interface를 사용하는 이유(Service와 ServiceImple)
subtitle: Interface를 사용하는 이유(Service와 ServiceImple)
categories: programming
tags: spring
comments: true
---

보통 application을 설계하고 구현하면 서비스영역은 Service(Interface)와 ServiceImple(구현class)로 분리된다.  
이유는 다음과 같다. ,

- 느슨한 결합(loose coupling)을 유지하여 각 기능간 **의존관계를 최소화**한다.
- 의존관계의 최소화로 기능의 변화에도 **최소한의 수정**으로 개발할 수 있는 유연함을 가질 수 있다.
- 모듈화를 통해 어디서든 사용할 수 있도록하여 **재사용성**을 높인다.
- 스프링의 IoC/DI의 기능을 이용한 **빈 관리 기능을 사용**할 수 있다.