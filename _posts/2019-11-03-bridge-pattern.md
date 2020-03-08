---
layout: post
title: Bridge Pattern (브릿지 패턴)
subtitle: Bridge Pattern (브릿지 패턴)
categories: programming
tags: designpattern
comments: true
---

Bridge Pattern (브릿지 패턴) 이란, 구현부에서 추상층을 분리하여 각자 독립적으로 변형 및 확장이 가능하도록 하는 디자인 패턴이다. 즉 기능과 구현에 대해 별도 클래스로 구현하는 패턴이다. 

## 활용방법
가령 동물 Animal 이라는 상위 클래스가 있을때, 하위클래스의 동물들(가령 호랑이, 새, 토끼 등등..)은 각자 다른 사냥방법을 가질 수 있다. 이 사냥방법(Hunting)을 Bridge Pattern을 적용하여 분리하여 설계해보자. 

## 예제코드

### Hunting.java
```java
public interface Hunting{
    public void findTarget();
    public void attack();
}
```
사냥방식 공통 인터페이스.  
1. 목표를 찾고 2. 공격하는 공통의 메소드를 가진다.

### HuntingMethod.java
```java
public class HuntingMethodOfTiger{
    public void findTarget(){
        System.out.println("토끼발견");
    }

    public void attack(){
        System.out.printlnt("어흥!사냥");
    }
}

public class HuntingMethodOfBird{
    public void findTarget(){
        System.out.println("벌레발견");
    }

    public void attack(){
        System.out.printlnt("짹짹!사냥");
    }
}
```
호랑이와 새의 구체적인 사냥방법을 각자 정의

### Animal.java
```java
public class Animal {
    
    private Hunting hunting;
    
    public Animal(Hunting hunting)
    {
        this.hunting=hunting;
    }
    public void findTarget(){
        hunting.findTarget();
    }
    public void attack()
    {
        hunting.attack();
    }
    public void hunt()
    {
        findTarget();
        attack();
    }
}
```
Animal 은 각자의 hunting 방법을 가짐

### Tiger.java , Bird.java

```java
public class Tiger extends Animal{
    public Tiger(Hunting hunting){
        super(hunting);
    }

    public void hunt(){
        findTarget();
        attack();
    }
}

public class Bird extends Animal{
    public Bird(Hunting hunting){
        super(hunting);
    }

    public void hunt(){
        findTarget();
        attack();
    }
}
```


### Main.java
```java
public class Main {
    
    public static void main(String argsp[])
    {    
        Animal tiger = new Tiger(new HuntingOfTiger());
        Animal bird = new Bird(new HuntingOfBird());
        
        tiger.hunt();
        System.out.println("--------------");
        bird.hunt();
    }
}
```
호랑이와 새는 각자의 사냥방법으로 사냥하도록 쉽게 구현할수있다! 

>출처 : https://lktprogrammer.tistory.com/35?category=672216