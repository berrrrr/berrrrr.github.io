---
layout: post
title: "[Modern Java In Action] 2. 동작 파라미터화 코드 전달하기"
subtitle: "[Modern Java In Action] 2. 동작 파라미터화 코드 전달하기"
categories: programming
tags: java
comments: true
---

java8부터 지원하는 메서드를 코드에 파라미터로 전달하는 방법에 대해 알아보자 

프로그래밍에서 젤 중요한것중 하나! 유지보수가 쉬워야됨..!! 왜냐면 요구사항이 계속 바뀌기때문.

이번 장에서 소개할 동작 파라미터화를 이용하면 자주 바뀌는 요구사항에 효과적으로 대응이 가능하다. 어떤 동작(메서드)를 파라미터화 할 수 있기때문이다. 

## 2.1 변화하는 요구사항에 대응하기

녹색사과 필터링하기~

```java
public static List<Apple> filterGreenApples(List<Apple inventory) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if(GREEN.equals(apple.getColor)) {
      result.add(apple);
    }
  }
}
```

근데 갑자기 농부가 빨간사과 필터링해줘~! 라고 요청한다면? 

```java
public static List<Apple> filterGreenApples(List<Apple inventory) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if(RED.equals(apple.getColor)) {
      result.add(apple);
    }
  }
}
```

근데 딱봐도 코드가 너무 반복.. 색을 파라미터화 해보자! 

```java
public static List<Apple> filterApplesByColor(List<Apple> inventory, Color color) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if(apple.getColor().equals(color)) {
      result.add(apple);
    }
  }
}
```

이랬더니 농부가 갑자기 150그램 이상인 사과를 필터링해줘~ 라고 요청하면? 열씨미 색 필터를 만든게 소용없음. 아래와 같이 새로운 필터를 만든다..... 

```java
public static List<Apple> filterApplesByWeight(List<Apple> inventory, int weight) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if(apple.getWeight() > weight) {
      result.add(apple);
    }
  }
  return result;
}

List<Apple> heavyApples = filterApplesByWeight(inventory, 150);
```

근데 이번엔 또 색이랑 무게에 대한 조건을 다 걸어서 필터링하고싶어~ 라고 요청하면? 

```java
public static List<Apple> filterApples(List<Apple> inventory, Color color, int weight, boolean flag) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if((flag && apple.getColor().equals(color)) || (!flag && apple.getWeight() > weight)) {
      result.add(apple);
    }
  }
  return result;
}

List<Apple> greenApples = filterApples(inventory, GREEN, 0, true);
List<Apple> heavyApples = filterApples(inventory, null, 150, false);
```

와..정말 별로다! true/false는 또 뭘 의미하는건데? 노답이다. 

얘를 도대체 어떻게 해야 예쁘고 간결하게 만들수있을까? 

## 2.2 동작 파라미터화

[전략 디자인 패턴](https://berrrrr.github.io/programming/2019/11/03/strategy-pattern/)을 사용해서 필요에 따른 필터를 넘겨줘서 사과를 필터링할수있게 해보자. 이때, Predicate(특정 조건에 대해 참/거짓을 반환하는 함수) 인터페이스를 사용할 수 있다. 

```java
public interface ApplePredicate {
  boolean test (Apple apple);
}

public class AppleHeavyWeightPredicate implements ApplePredicate {
  public boolean test(Apple apple) {
    return apple.getWeight() > 150;
  }
}

public class AppleGreenColorPredicate implements ApplePredicate {
  public boolean test(Apple apple) {
    return GREEN.equals(apple.getColor());
  }
}
```

오 .. 이 Predicate들을 매개변수로 넘겨받는 filter메서드를 정의하면 여러개의 중복filter를 정의하지 않고 1개만으로도 다양한 필터링을 할 수 있겠어! 

```java
public static List<Apple> filterApples(List<Apple> inventory, ApplePredicate p) {
  List<Apple> result = new ArrayList<>();
  for(Apple apple : inventory) {
    if(p.test(apple)) {
      result.add(apple);
    }
  }
  return result;
}
```

이렇게 한 메서드가 여러가지 동작(필터)를 할 수 있도록 해주는것이 **동작 파라미터화**의 강점이다. 

## 2.3 복잡한 과정 간소화

### 1) 익명클래스 사용

Predicate를 선언하는것도 귀찮다...!! 그럼 우리는 자바의 익명클래스를 사용할 수 있다 

```java
List<Apple> redApples = filterApples(inventory, new ApplePredicate() {
  public boolean test(Apple apple) {
    return RED.equals(apple.getColor());
  }
}
```

근데 이것도...... 장황하고 길다.

### 2) 람다표현식 사용

람다표현식을 사용하면 더 간결하게 할 수 있다! 

```java
List<Apple> result = filterApples(inventory, (Apple apple) -> RED.equals(apple.getColor()));
```

가독성도 훨씬 나아졌다.

### 3) 리스트 형식으로 추상화

```java
public interface Predicate<T> {
  boolean test(T t);
}

public static <T> List<T> filter(List<T> list, Predicate<T> p) {
  List<T> result = new ArrayList<>();
  for(T e : list) {
    if(p.test(e)) {
      result.add(e);
    }
  }
  return result;
}

List<Apple> redApples = filter(inventory, (Apple apple) -> RED.equals(apple.getColor()));
List<Integer> evenNumbers = filter(numbers, (Integer i) -> i % 2 == 0);
```

제너릭을 사용해서 추상화했더니 Apple뿐 아니라 Integer, String .. 무궁무진하게 필터링할수잇게됐다.