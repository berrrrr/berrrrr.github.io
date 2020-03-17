---
layout: post
title: Memento Pattern (메멘토 패턴)
subtitle: Memento Pattern (메멘토 패턴)
categories: programming
tags: designpattern
comments: true
---

이전의 상태를 기억하고, 필요할때 그 기억을 되살려 이전의 상태로 돌릴수 있는 디자인패턴을 메멘토 패턴이라고 한다. 

## 예제코드

### Information.java

```java
public class Information {
    private String Data1;                         
    private int Data2;                            
    public Information(String Data1, int Data2)    
    {
        this.Data1 = Data1;
        this.Data2 = Data2;
    }

     public Memento CreateMemento()                    //Memento (상태저장) 
    {
        return new Memento(this.Data1,this.Data2);
    }
    public void RestorMemento(Memento memento)         //Memento (상태복원)
    {
        this.Data1 = memento.getData1();
        this.Data2 = memento.getData2(); 
    }
    public void set_Data1(String Data1)                
    {
        this.Data1 = Data1;
    }
    public void set_Data2(int Data2)                
   {
        this.Data2 = Data2;
    }
    public String get_Data1()                        
    {
        return this.Data1;
    }
    public int get_Data2()                         
    {
        return this.Data2;
    }
```
실제 데이터를 가지고 있는 클래스

### Memento.java

```java
public class Memento {
    
    //Information의 상태정보를 가지고 있음
    private String Data1;
    private int Data2;
    
    public Memento(String Data1,int Data2)
    {
        this.Data1 = Data1;
        this.Data2 = Data2;
    }
    public String getData1()
    {
        return this.Data1;
    }
    public int getData2()
    {
        return this.Data2;
    }
}
```
데이터를 저장/복원하는 메멘토클래스 


### CareTaker.java

```java
import java.util.Stack;
 
public class CareTaker {
    
    Stack<Memento> mementos = new Stack<>();    //Memento 관리를 위한 Stack
    
    public void push(Memento memento)            //특정 시점에 생성된 Memento를 Push
    {
        mementos.push(memento);
    }
    public Memento pop()                        //복원을 위한 Memento 객체 반환
    {
            return mementos.pop();
    }
}
```
이전 데이터의 기록(메멘토)를 스택에 쌓음


### User.java

```java
public class User {
    
    Information info;
    CareTaker caretaker;
    public void exe()
    {
        info  = new Information("Data1",10);            //Information 객체 생성
        caretaker = new CareTaker();                    //CareTaker 객체 생성
        //현재 Information의 상태 정보를 가지는 Memento를 생성하여 CareTaker에 추가
        caretaker.push(info.CreateMemento());
        
        //Information 정보를 수정
        info.set_Data1("Data2");
        info.set_Data2(20);
        //현재 Information의 상태정보를 출력
        System.out.println("현재 Data1 : " + info.get_Data1());
        System.out.println("현재 Data2 : " + info.get_Data2());
        //가장 최근에 생성 된 Memento를 가지고와서 상태 정보를 복원
        info.RestorMemento(caretaker.pop());
        //상태 정보를 복원 한 후에 Information의 상태 정보를 출력
        System.out.println("복구된 Data1 : " + info.get_Data1());
        System.out.println("복구된 Data2 : " + info.get_Data2());
    }
}
```
memento를 이용해 information 을 저장/복원하는 모습

>출처 : https://lktprogrammer.tistory.com/65