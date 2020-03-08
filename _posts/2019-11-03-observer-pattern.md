---
layout: post
title: Observer Pattern (구독자 패턴)
subtitle: Observer Pattern (구독자 패턴)
categories: programming
tags: designpattern
comments: true
---

출판사가 주제를 출판하면 구독자 그것을 구독하는 패턴

## 정의
한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 연락이 가고 자동으로 내용이 갱신되는 방식으로 일대다(one-to-many) 의존성을 정의한다.

주제와 옵저버는 서로 독립적. 서로 변경되어도 영향을 받지않음.

## 예시코드
성적이라는 주제(subject)가 있고, 그 성적을 구독하여 사용자에게 보여주는 기능을 하는 구독자들이 있다고 하자. 아래와 같이 구현할 수 있다.

### Observer.java
```java
public interface Observer{
    public abstract void update();
}
```
옵저버(구독자) 클래스는 subject를 구독하다가 변경되면 통보받는 역할을 한다.

### Sbject.java
```java
public abstract class Subject{
    private List<Observer> observers = new ArrayList<Observer>(); // 구독자들 목록을 가지고있는다
    
    public void attach(Observer observer){
        observers.add(observer); // 구독자 추가
    }

    public void detach(Observer observer){
        observers.remove(observer); // 구독자 제거
    }

    public void notifyObservers(){
        for (Observer o:observers){
            o.update(); // 구독자들에게 변경 통보
        }
    }
}
```
Subject클래스는 변경 대상 데이터로, 변경시 옵저버들에게 통보한다. 

### Score.java
```java
public class Score extends Subject {
    private List<Integer> scores = new ArrayList<Integer>();

    public void addScore(int score){
        scores.add(score);

        notifyObservers();
    }

    public List<Integer> getScore(){
        return scores;
    }
}

```
구체적으로 변경 감시 대상 데이터인 성적클래스

### ScoreViewer.java
```java
public class ScoreViewer implements Observer{
    private Score score;

    public ScoreViewer(Score score){
        this.score = score;
    }

    public void update(){
        List<Integer> scores = score.getScore();
        displayScore(scores);
    }

    public void displayScore(List<Integer> scores){
        for (int score:scores){
            System.out.println(score);
        }
    }
}
```
Score를 출력하는 ScoreViewer클래스. 
출력 대상인 score가 변경되어도 구독하고있기때문에 별다른 수정 없이 성적을 업데이트하며 출력이 가능하다. 
