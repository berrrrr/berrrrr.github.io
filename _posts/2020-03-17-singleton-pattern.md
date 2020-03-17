---
layout: post
title: 싱글톤 패턴 (singleton pattern)
subtitle: singleton pattern
categories: programming
tags: designpattern
comments: true
---

싱글톤패턴은 개인적으로 생각하기에는 개발자가 개발하면서 가장 많이 사용하게되고 가장 기본적인 디자인패턴인것같다.   
싱글톤패턴에 대해 알아보자. 

## 싱글톤패턴이란? 
인스턴스가 오직 하나만 생성되는것을 보장하고 어디에서든 이 인스턴스에 접근할 수 있도록 하는 패턴. 

## 싱글톤패턴 코딩

```java
public class Singleton{
    private static Singleton singleton = null;
    public synchronized static Singleton getInstance(){
        if(singleton == null){
            singleton = new Singleton();
        }
        return singleton;
    }
}

```

static (정적변수)로 선언되기때문에 어디서든 이 인스턴스에 접근할 수 있고  초기화가 한번만 실행되기때문에 위와같이 싱글톤 구현이 가능하다.