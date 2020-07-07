---
layout: post
title: '[Effective java] item10. equals는 일반 규약을 지켜 재정의하라'
subtitle: '[Effective java] item10. equals는 일반 규약을 지켜 재정의하라'
categories: programming
tags: java
comments: true
---

## 재정의 하지 않는 경우
- 각 instance가 본질적으로 고유할때. (ex. Thread, Enum..)
- 논리적 동치성(logical equality)를 검사할 일이 없을때. 
- 상위 클래스에서 재정의한 equals가 하위 클래스에도 딱 들어맞을때.
- 클래스가 private, private-private이고 equals 메서드를 호출할 일이 없을때. 


## 재정의해야하는 경우
- 논리적 동치성(logical equality)를 확인해야하는데 상위클래스 equals가 논리적 동치성을 비교하도록 재정의되지 않았을때. (ex. 값클래스 - Integer, String ..)

## equals 메서드 일반 규약
equals 메서드는 동치관계를 구현. 
- 반사성(reflexivity) : x.equals(x) == true
- 대칭성(symmetry) : when x.equals(y) == true then y.equals(x) == true
- 추이성(transitivity) : when x.equals(y) == true and y.equas(z) == true then x.equals(z) == true
- 일관성(consisteny) : 한번 true 인건 다시호출해도 true. 
- null 아님  : null이 아닌 x에 대해 x.equals(null) == false

## 주의할점
- equals 규약을 어기면 그 객체를 사용하는 다른 객체들이 어떻게 반응할 지 알 수 없다.
- equals의 판단에 신뢰할 수 없는 자원이 끼어들면 안된다. 

## 양질의 equals 메서드 구현 방법
1. `==`연산자를 사용해 입력이 자기 자신의 참조인지 확인. 
2. `instanceof`연산자로 입력이 올바른 타입인지 확인한다.
3. 입력을 올바른 타입으로 형변환한다.
4. 입력객체와 자기 자신의 대응되는 핵심 필드들이 모두 일치하는지 검사한다.

## 결론
꼭 필요한 경우가 아니면 equals를 재정의하지 말자! 웬만해서는 Object의 equals 가 우리가 원하는 비교룰 정확히 수행해준다.  
꼭 필요해서 재정의한다면 일반규약을 꼭 지켜야한다. 