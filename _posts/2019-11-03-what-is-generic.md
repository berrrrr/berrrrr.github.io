---
layout: post
title: Generic 타입이란?
subtitle: Generic 타입이란?
categories: programming
tags: java
comments: true
---

Generic type이란 데이터 타입을 아직 명시하지 않은 상태. 
class 안에서 사용하는 데이터 타입을 미리 정의하지 않고 class를 instance화 하는 시점에서 데이터타입을 지정해주는 방식.  
ex. List<T> 에서 T 가 generic type

## Generic 타입을 사용하는 이유?
매번 데이터타입을 강제로 캐스팅한다면 프로그램 성능저하가 발생.  
모든 타입을 Object로 받아서 캐스팅하기보다는 인스턴스화하는 타이밍에 타입을 지정하면 불필요한 강제 타입 변환을 막을 수 있다. 

## Generic MultiType Parameter
제너릭 타입은 두 개 이상의 제너릭 타입 파라미터를 사용할 수 있는데, 이 경우 각 타입 파라미터를 콤마로 구분한다.  
ex) Map<K,V>

## Generic Method
매개타입과 리턴타입으로 generic 타입 파라미터를 사용하는 메소드.

## Bounded Type parameter
ex ) <T extends Number>  
위와 같은 식으로 `extends` 키워드를 붙이고 상위 타입을 명시한다.

## wildcard Type <?>
코드에서 `?`를 일반적으로 와일드카드(wildcard)라고 한다. 제네릭타입을 리턴, 매개변수타입으로 사용할때 구체적인 타입 대신 특정 타입의 하위타입이나 상위타입에 대해서 허용하고자할때 다음과 같이 와일드카드를 사용할 수 있다.  
ex. <?>, <? extends 상위타입>, <? super 하위타입>

## Generic 타입의 상속과 구현
Generic 클래스도 다른 타입과 마찬가지로 부모클래스가 될 수 있다. 