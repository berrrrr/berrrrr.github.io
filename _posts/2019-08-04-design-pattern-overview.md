---
layout: post
title: 디자인패턴 개요
subtitle: 디자인패턴 개요
categories: programming
tags: designpattern
comments: true
---

디자인 패턴 개요

## 디자인 패턴의 이해
소프트웨어를 설계할 때 특정 맥락에서 자주 발생하는 고질적인 문제들이 또 발생했을 때 재사용할 수 있는 훌륭한 해결책.

## 디자인 패턴 구조
1. 콘텍스트(Context) : 문제가 발생하는 여러 상황. 패턴이 적용될 수 있는 상황.
2. 문제(Problem) : 패턴이 적용되어 해결될 필요가 있는 여러 디자인 이슈. 여러 제약사항과 영향력도 문제 해결을 위해 고려해야함.
3. 해결(Solution) : 문제를 해결하도록 설계를 구성하는 요소들과 그 요소들 사이의 관계, 책임, 협력 관계를 기술. 해결은 반드시 구체적인 구현 방법이나 언어에 의존적이지 않으며 다양한 상황에 적용할 수 있는 일종의 템플릿. 

## GoF 디자인 패턴
Gof(Gang of Four : 에리히 감마, 리차드 헬름, 랄프 존슨, 존 블리시디스)가 정리한 소프트웨어 개발 영역에서의 디자인패턴.  
생성/구조/행위 3가지로 분류되어있으며 총 23개의 디자인패턴으로 정리된다. 

1. 생성 패턴
 - Abstract Factory
 - Builder
 - Factory Method
 - Prototype
 - Singletone

2. 구조 패턴
 - Adapter
 - [Bridge](https://berrrrr.github.io/programming/2019/11/03/bridge-pattern/)
 - Composite
 - Decorator
 - Facade
 - Flyweight
 - [Proxy](https://berrrrr.github.io/programming/2019/11/03/proxy-pattern/)

3. 행위 패턴
 - Chain of Responsibility
 - Command
 - Interpreter
 - Iterator
 - Mediator
 - [Memento](https://berrrrr.github.io/programming/2019/11/03/memento-pattern/)
 - Observer
 - State
 - [Strategy](https://berrrrr.github.io/programming/2019/11/03/strategy-pattern/)
 - Template Method
 - Visitor

