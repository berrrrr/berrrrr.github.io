---
layout: post
title: Strategy Pattern (전략 패턴)
subtitle: Strategy Pattern (전략 패턴)
categories: programming
tags: designpattern
comments: true
---


Strategy Pattern 은 전략을 쉽게 바꿀 수 있도록 해주는 디자인 패턴이다.  
같은 문제를 해결하는 여러 방식(알고리즘)이 클래스별로 캡슐화 되어있고 이들을 필요할 때 교체할 수 있도록 함으로써 동일한 문제를 다른 알고리즘으로 해결할 수 있게 하는 디자인 패턴이다.  

그렇다면 구체적으로 한 문제를 여러 방식으로 해결해야하는 케이스는 어떤 상황이 있을까?  
그리고 이러한 상황에서 Strategy Pattern을 어떻게 적용하여 해결할까?  
구체적인 예시를 들어서 Strategy Pattern을 이해해보자.  
(예시코드 : java)

## 문제 - 로봇만들기 
```java
pulic abstract class Robot{
    private String name;
    public Robot(String name){
        this.name = name;
    }

    public String getName(){
        return name;
    }

    public abstract void attack();
    public abstract void move();
}
```
공격하고 움직이는 기능을 가진 로봇클래스가 있다.  
이 로봇클래스를 상속하는 태권브이 (공격 : 미사일 /  이동: 걷기) 와 아톰(공격 : 펀치 / 이동 : 비행) 이 있다고 하자.  
아래와 같이 선언이 가능할것이다.

```java
public class TaekwonV extends Robot}
public TaekwonV(String name){
    super(name);
}

public void attack(){
    System.out.println("Missale attack");
}

public void move(){
    System.out.println("walking");
}
```

```java
public class Atom extends Robot}
public Atom(String name){
    super(name);
}

public void attack(){
    System.out.println("Punch attack");
}

public void move(){
    System.out.println("flying");
}
```

이때 갑자기 태권브이가 날수있게된다면..??   
TaekwonV의 attack 메소드를 수정해줘야한다.  
```java
public class TaekwonV extends Robot}
public TaekwonV(String name){
    super(name);
}

public void attack(){
    System.out.println("Missale attack");
}

public void move(){
    System.out.println("flying");
}
```
하지만 이는 새로운 기능으로 변경하기 위해 기존 코드의 내용을 수정해야하므로, OCP(개방-폐쇄의 원칙)에 위배된다.  
또한 Atom의 move() 메소드와 완전히 동일한, 기능 중복이 발생하게된다.  
(중복코드는 유지보수를 힘들게하는 만악의 근원이다 ^^)  

또 새로운 로봇이 추가될때마다 새로운 이동, 공격기능이 계속 개발되고 중복코드는 꾸준히 발견될 수 있다.  

## 해결책- Strategy Pattern 적용하기 

이러한 문제를 피하려면 무엇이 변화했는지 찾고, 이를 클래스로 캡슐화해야한다.  
위 로봇 예제 같은 경우 attack과 move 방식의 변화이다. 새로운 attack, move방식이 계속 추가될 수 있으므로 attack, move가 별다른 코드 변경 없이 변경할 수 있도록 코드가 수정되어야한다.  
이제 attack과 move를 각각 AttackStrategy와 MovingStrategy로 캡슐화하여 이를 해결해보자. 

```java
pulic abstract class Robot{
    private String name;
    public Robot(String name){
        this.name = name;
    }

    public String getName(){
        return name;
    }

    public abstract void attack(){
        attackStrategy.attack();
    }
    public abstract void move(){
        movingStrategy.move();
    }

    public void setMovingStrategy(MovingStrategy movingStrategy){
        this.movingStrategy = movingStrategy;
    }
    
    public void setAttackStrategy(AttackStrategy attackStrategy){
        this.attackStrategy = attackStrategy;
    }

    interface MovingStrategy(){
        public void move();
    }

    public class FlyingStrategy implements MovingStrategy{
        public void move(){
            System.out.println("flying");
        }
    }
    public class WalkingStrategy implements MovingStrategy{
        public void move(){
            System.out.println("walking");
        }
    }
    
    interface AttackStrategy(){
        public void attack();
    }

    public class MissaleStrategy implements AttackStrategy{
        public void move(){
            System.out.println("Missale attack");
        }
    }

    public class PunchStrategy implements AttackStrategy{
        public void move(){
            System.out.println("Punch attack");
        }
    }

    public class Atom extends Robot{
        public Atom(String name){
            super(name);
        }
    }

    public class TaekwonV extends Robot{
        public TaekwonV(String name){
            super(name);
        }
    }
}
```
로봇의 공격/이동방법을 맘대로 갈아끼울 수 있게 되었다. 
그럼 이제 태권브이는 아래와 같이 선언할 수 있겠다.
```java
public static void main(String[] args){
    Robot taekwonV = new TaekwonV("TakwonV");
    taekwonV.setMovingStrategy(new WalkingStrategy());
    taekwonV.setAttackStrategy(new MissaleStrategy());
}
```

이제 새로운 기능의 로봇이 추가되어도 두려움없이 캡슐화된 attackStrategy와 movingStrategy를 내가 원하는 기능을 세팅함으로써 쉽게 추가할 수 있다. 

>출처 : java 객체지향 디자인패턴 (저: 정인상, 채흥석)