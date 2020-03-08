---
layout: post
title: Proxy Pattern(프록시 패턴)
subtitle: Proxy Pattern(프록시 패턴)
categories: programming
tags: designpattern
comments: true
---

프록시패턴은 실제 기능을 수행하는 객체Real Object 대신 가상의 객체Proxy Object를 사용해 로직의 흐름을 제어하는 디자인 패턴이다. 이때 Proxy Object는 Real Object의 결과값을 조작하거나 변경하면 안된다. 말 그대로 Proxy (대리자) 이기때문이다. 

이러한 Proxy Pattern을 어떻게 구현하는지 예제코드를 통해 알아보자 (구현: Java)

## Proxy Pattern 예제코드

### IService.java
```java
public interface IService {
 
    String runSomething();
}
```
     
### Service.java
```java
public class Service implements IService{
 
    @Override
    public String runSomething() {
        return "blah";
    }
     
}
```

### Proxy.java
```java
public class Proxy implements IService{
 
    IService service1;
     
    @Override
    public String runSomething() {
        System.out.println("호출에 대한 흐름 제어가 주목적, 반환 결과를 그대로 전달");
         
        service1 = new Service();
        return service1.runSomething();
    }
 
}
```

### Main.java
```java
public c class Main {
 
    public static void main(String[] args) {
        //직접 호출하지 않고 프록시를 호출한다.
        IService proxy = new Proxy();
        System.out.println(proxy.runSomething());
    }
}
```


이와같이 client는  service에 직접 접근하지않고, proxy를 통해 우회 접근하는것을 확인할 수 있다. 

## proxy pattern 활용법
게임등에서 proxy object에서는 실제 게임 서비스Real Object를 호출하고,  로딩을 기다리는동안 가능한 다른 작업을 진행하다가 real object 가 return 되면 결국에는 그 작업을 수행하는 (ex. 배틀그라운드에서 맵 로딩되는동안 대기실을 띄워주는것) 식으로 활용할 수 있다.

> 출처 : https://limkydev.tistory.com/79







