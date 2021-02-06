---
layout: post
title: "[Modern Java In Action] 3. 람다 표현식"
subtitle: "[Modern Java In Action] 3. 람다 표현식"
categories: programming
tags: java
comments: true
---

람다 표현식에 대해 알아보자

## 3.1 람다란 무엇인가?

**람다표현식**이란 메서드로 전달할 수 있는 익명함수를 단순화한것이다. 

한마디로 자바에서 인스턴스하게 함수를 쓰고싶을때 굳이 선언하지 않고 쓰기위해 있던 익명함수라는 애가 너무 장황하고 코드 가독성을 헤치니까 간결하게 쓸수있도록 표현식을 만든것이 람다표현식이다. 

람다표현식은 이름은 없지만 **파라미터 리스트, 바디, 리턴타입, 예외리스트**가 존재한다. 

기존코드

```java
Comparator<Apple> byWeight = new Comparator<Apple>{
	public int compare(Apple a1, Apple a2){
		return a1.getWeight().compareTo(a2.getWeight));
}
```

람다를 이용한 코드

```java

Comparator<Apple> byWeight = 
(Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight());
```

이렇게 람다 표현식을 사용하면 훨씬 간결한 코드를 쓸 수 있다.! 

`(Apple a1, Apple a2)` : 람다 파라미터 리스트

`->` : 화살표 (파라미터 리스트와 바디를 구분)

`a1.getWeight().compareTo(a2.getWeight()` : 람다 바디. 리턴타입에 해당하는 표현식.

### 람다의 기본 문법

`(parameteres) -> expression`

`(parameteres) -> { statements; }`

람다에서 표현식이 하나인데 return문을 사용하는 경우 블록으로 감싸야 한다.

```java
(String s) -> return "Alan" + i; // X 이렇게쓰면안됨 
(String s) -> {return "Alan" + i;} // O 이렇게써야됨
```

## 3.2 람다 사용법

### 1) 함수형 인터페이스

함수형 인터페이스는 **오직 하나의 추상메서드만 지정하는 인터페이스** 이다. 두개여도안된다. **오직 하나**의 추상메서드만 가지고있어야한다! 

생각해보면 당연한거다. 람다표현식이 해당 클래스를 대체해야하는데, 메서드(동작)이 여러개면 람다표현식이 도대체 어떤 동작을 대체할지 알수가없게된다. 따라서 당연히 동작(메서드)가 한개만 있는 인터페이스여야한다. 

ex) Predicate<T>, Comparator, Runnable 등...

```java
public interface Predicate<T> {
  boolean Test (T t);
}

public interface Comparator<T> {
  int compare(T o1, T o2);
}

public interface Runnable {
  void run();
}

public interface ActionListener extends EventListener {
  void actionPerformed(ActionEvent e);
}

public interface Callable<V> {
  V call() throws Exception;
}

public interface PrivilegedAction<T> {
  T run();
}
```

람다표현식으로 함수형 인페이스의 추상 메서드 구현을 직접 전달할수있다. 즉, 람다 표현식 선언만으로도 마치  함수형 인터페이스를 구현한것과 동일하게 쓸 수 있다는것이다. 

`@FunctionalInterface` 어노테이션으로 함수형 인터페이스임을 명시할 수 있다. 

### 2) 함수 디스크립터

그냥 정말 간단하게 말해서, 뭐가들어오고(파라미터), 뭐가 반환된다(리턴) 를 기술한걸 함수디스크립터라고 보면된다.

위에서 람다 표현식을 함수인터페이스의 추상메서드로 사용할 수 있다고 말했다. 즉  함수형 인터페이스의 추상메서드의 시그니처는 람다 표현식의 시그니처와 동일해야한다. 예를들어 Runnable 인터페이스의 유일한 추상 메서드 run은 인수와 반환값이 없으므로 void 반환 `() -> void`가 함수 디스크립터가 된다. 

## 3.3 람다활용

스프링 aop같이 중복된 코드가 작업의 전후로 반복되어 실행되는 패턴을 실행 어라운드 패턴이라고한다. 자바에서는 이러한 실행 어라운드 패턴을 람다전달을 통해 쉽게 풀 수 있다. 

## 3.4 함수형 인터페이스 사용

### 1) Predicate

(T) → boolean

특정객체를 받아서 true/false를 반환 (조건 따질때 많이사용)

### 2) Consumer

(T) → void

T 형식의 객체를 인수로 받아서 어떤 동작을 수행하고 싶을 때 Consumer 인터페이스를 사용. 예를 들어 Integer 리스트를 인수로 받아서 각 항목에 어떤 동작을 수행하는 forEach 메서드를 정의한다거나...

### 3) Function

(T) → (R)

제네릭 형식 T를 인수로 받아서 제네릭 형식 R 객체를 반화하는 추상 메서드 apply를 정의

입력을 출력으로 매핑하는 람다를 정의할 때 Function 인터페이스를 활용. 예를 들면 사과의 무게 정보를 추출하거나 문자열을 길이와 매핑.

### 4) 기본형 특화

자바의 모든 형식은 참조형(ex. Byte, Integer...) 과 기본형(int, double ....) 으로 나뉘는데, 제네릭 파라미터에는 **참조형**만 쓸 수 있다.

자바에서는 기본형을 쉽게 사용할 수 있도록 오토박싱이라는 기능을 제공한다. 

## 3.5 형식검사, 형식추론, 제약

### 1) 형식검사

람다가 사용되는 context(문맥)을 통해서 람다의 type을 추론할수있음. 쉽게말해 Apple 쓰는 코드문맥에서는 람다가 받는 파라미터가 Apple 객체겠거니 추론할수있는걸 말하는거. 이렇게 어떤 context에서 기대되는 람다의 표현식을 Target Type이라고 함.

### 2) 형식추론

자바컴파일러는 람다 표현식이 사용된 context를 이용해 람다 표현식과 함수형 인터페이스를 추론할수있음.

```java
// 형식 추론 하지 않음
Comparator<Apple> c = (Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight());

// 형식 추론 함
Comparator<Apple> c = (a1, a2) -> a1.getWeight().compareTo(a2.getWeight());
```

### 4) 제약

람다표현식에서는 지역변수를 사용할수없다..!! 지역변수는 stack 영역(stack은 스레드랑 같이 생성되고 사라짐)에 존재하기때문에 언제 어덯게 사라질지 모르는 변수이므로 람다표현식에서 쓸수없음. 대신에 final로 선언되거나 heap 영역에 있는 변수의 경우는 사용가능. 

## 3.6 메서드 참조

### 1) 메서드 참조

기존의 메서드 정의를 재활용해서 람다처럼 사용할 수 있다.

메서드 참조는 특정 메서드만을 호출하는 람다의 축약형이라고 생각할 수 있다. 메서드 명을 참조하기 때문에 가독성을 높일 수 있다. 메서드를 참조하는 방법은 메서드명 앞에 구분자(::)를 붙이면 된다.

```java
// 기존코드
inventory.sort((Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight()));

// 메서드참조
inventory.sort(comparing(Apple::getWeight));
```

### 2) 생성자 참조

ClassName::new 처럼 클래스명과 new 키워드를 이용해서 기존 생성자의 참조를 만들 수 있다.

```java
// Supplier<Apple> c1 = () -> new Apple();
Supplier<Apple> c1 = Apple::new;
Apple a1 = c1.get();
```

## 3.7 람다 표현식 조합

역정렬

```java
inventory.sort(comparing(Apple::getWeight).reversed());
```

무게 같을시 국가별 정렬

```java
inventory.sort(comapring(Apple::getWeight)
  .reversed()
  .thenComparing(Apple::getCountry));
```

Predicate interface - negate, and, or

negate ex)빨간색이 아닌 사과

```java
Predicate<Apple> notRedApple = redApple.negate();
```

Function interface - andThen, compose

```java
Function<Integer, Integer> h = f.andThen(g); // g(f(x))
Function<Integer, Integer> h = f.compose(g); // f(g(x))
```

## 3.9 후기

개인적으로 함수형 프로그래밍을 구현하기 위해서 람다표현식이라는걸 고안하고 그걸 사용하게된거자체는 굉장히 유의미한 변화라고 생각함. 바로 도태되지 않을수 있는 원동력도된거같음. 그런데 개인적으로 느낀점은, 이 람다표현식을 알기 위해 함수형 인터페이스가  뭔지(인터페이스형태인데 추상화 함수가 딱 1개만 존재하는거)따로 알아야하고, 그것과 시그니쳐(파라미터리스트, 반환타입, 예외처리)가 같아야하고... 기본형과 참조형은 왜 존재하며... 제너릭에는 또 참조형만쓸수있고.. 이걸 박싱/언박싱하려면 어떻게해야하는지... 이런 복잡한 내용, 히스토리들을 알아야한다는게..(왜 이렇게 만들었는가? 알려면 모던자바인액션에서 묘사한 히스토리를 알아야만 이해가감...) 최근 나오고있는 '태생부터 함수형 프로그래밍'인 언어들과 겨루기에는 너무 비효율적으로 느껴짐.. 신규로 시장에 진입하는 개발자라면 레거시때문이 아니라면 코틀린이나 고랭, 파이썬같이 이미 효율적인 언어들을 사용할거같음. 파이선, 코틀린, 자바스크립트로도 자바가 구현하는 서버를 동일하게 구현할수있는 마당에.. 이렇게 비효율적으로 익혀야되는 언어를 선택할 필요는 없으니까..