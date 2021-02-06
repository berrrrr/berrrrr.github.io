---
layout: post
title: "[Modern Java In Action] 5. 스트림 활용"
subtitle: "[Modern Java In Action] 5. 스트림 활용"
categories: programming
tags: java
comments: true
---

다양한 스트림 활용 방법에 대해 알아보자

## 5.1 필터링

스트림 요소를 선택(=필터링)하는 방법을 알아보자 

### 1) Predicate로 필터링

Predicate (boolean 반환 함수)를 인수로 받아 Predicate와 일치하는 요소를 포함하는 스트림 반환

```java
List<Dish< vegetarianMenu = menu.stream()
  .filter(Dish::isVegetarian) 
  .collect(toList());
```

### 2) 고유 요소 필터링 (=중복제거)

Stream은 중복 제거 스트림을 반환하는 distinct 메서드 지원. 

참고로 고유 여부는 스트림객체에서 만든 객체의 hashCode, equals로 결정. 

```java
List<Integer> numbers = Arrays.asList<1, 2, 1, 3, 3, 2, 4);
numbers.stream()
  .filter(i -> i % 2 == 0)
  .distinct()
  .forEach(System.out::println);
```

## 5.2 스트림 슬라이싱

스트림 요소를 선택하거나 스킵하는 방법을 알아보자 

### 1) Predicate로 슬라이싱

filter로 쓰면 될거같지만, 사실 filter는 전체 스트림을 다 검사하니까 매우 비효율적! 이미 칼로리순으로 정렬된 리스트라면, 320 칼로리부터는 더이상 반복작업을 안하는게 효율적이다. 이런 상황에서는 아래와 같이 `takeWhile` 을 사용하면 된다.

```java
List<Dish> slicedMenu1
  = specialMenu.stream()
    .takeWhile(dish -> dish.getCalories() < 320)
    .collect(toList());
```

반대로 320보다 칼라로기 큰요소를 탐색할때는 `dropWhile` 을 사용하면 된다.

```java
List<Dish> slicedMenu2
  = specialMenu.stream()
    .dropWhile(dish -> dish.getCalories() < 320)
    .collect(toList());
```

### 2) 스트림 축소

`limit`을 사용하여 주어진 값 이하의 크기를 갖는 스트림을 얻을 수 있다. 

### 3) 요소 건너뛰기

`skip(n)`을 사용하여 처음 n개 요소를 제외한 스트림을 얻을 수 있다. 

## 5.3 매핑

 특정 객체에서 특정 데이터를 선택하는 작업을 스트림을 통해 할 수 있다

### 1) 스트림의 각 요소에 함수적용

`map` 을 사용하여 스트림 각 요소에 함수를 적용할 수 있다. 

ex) 각 요소 dish에서 요리명 추출

```java
List<String> dishNames = menu.stream()
  .map(Dish::getName)
  .collect(toList());
```

### 2) 스트림 평면화

각 배열을 스트림 콘텐츠로 매핑. 하나의 평면화된 스트림을 얻을 수 있다.

ex) 두 개의 숫자 리스트를 조합한 모든 숫자 쌍의 리스트를 반환

```java
List<Integer> numbers1 = Arrays.asList(1, 2, 3);
List<Integer> numbers2 = Arrays.asList(3, 4);
List<int[]> pairs = numbers1.stream()
  .flatMap(i -> numbers2.stream().map(j -> new int[]{i, j}))
  .collect(toList());
```

## 5.4 검색과 매칭

특정 속성이 데이터 집합에 있는지 여부를 검색하는 기능

- anyMatch : 조건(Predicate)이 스트림 내 적어도 한 요소와 일치하는가?
- allMatch : 조건(Predicate)이 스트림 내 모든 요소와 일치하는가?
- nonMatch : 조건(Predicate)이 스트림 내 모든 요소와 일치하지 않는가?
- findAny : 요소 검색해서 임의의 요소 반환. (요소가 없으면 Optional 반환)
- findFirst : 첫번째 요소를 반환 (병렬작업에서는 첫번째요소 찾을수 X)

### 쇼트서킷

anyMatch, allMatch, findAny, .. 이런애들은 `||, &&` 같은 연산을 사용해서 전체 스트림을 다 보지않아도 결과를 반환할수 있다.(ex. allMatch 검사하는데 하나라도 and조건에서 하나라도 틀린애가 나오면 바로 중지) 이러한 상황을 쇼트서킷이라고 한다. 

## 5.5 리듀싱

모든 스트림 요소를 처리해서 값으로 도출하는 작업을 리듀싱 연산이라고 한다. 

### 1) 요소의 합

for-each를 사용해서 요소의 합을 구한다면?

```java
int sum = 0;
for(int x : numbers) {
  sum += x;
}
```

stream을 사용해서 요소의 합을 구한다면?

```java
int sum = numbers.stream().reduce(0, (a,b) -> a+b);
```

→ 스트림 값이 하나의 값으로 줄어들때까지 람다는 각 요소를 조합. 

첫번째인자 : 초깃값

두번째인자 : 요소에 적용할 함수

합계가 없으면 Optional 객체를 반환. 

### 2) 최댓값과 최솟값

```java
Optional<Integer> max = numbers.stream().reduce(Integer::max);
Optional<Integer> min = numbers.stream().reduce(Integer::min);
```

### 3) 맵리듀싱

map과 reduce를 연결하는 기법을 맵 리듀스 패턴 이라고 한다. 쉽게 병렬화하는 특징 덕분에 구글이 웹 검색에 적용하면서 유명해졌다.

```java
int count = menu.stream()
  .map(d -> 1)
  .reduce(0, (a,b) -> a + b);
```

## 5.7 숫자형 스트림

```java
int calories = menu.stream()
										.map(Dish::getCalories)
										.reduce(0, Integer::sum);
```

 위와같이 메뉴의 칼로리 합계를 계산하는 코드에서는 **박싱비용**이 포함되어있음. 내부적으로 합계를 계산하기 전에 참조형 Integer를 기본형 int로 언박싱해야함. 

이런 숫자스트림을 효율적으로 처리할 수 있게 기본형 특화 스트림을 제공한다. 

### 1) 기본형 특화 스트림

**숫자스트림으로 매핑**

스트림을 특화스트림으로 변환할때mapToInt, mapToDouble, mapToLong 등을 사용할수있다. 기본값으로 OptionalInt를 사용할 수 있다. 

```java
int calories = menu.stream()
  .mapToInt(Dish::getCalories)
  .sum();
```

**객체스트림으로 복원**

숫자스트림에서 다시 원상태 스트림으로 복원할 수 있다. 

```java
IntStream intStream = menu.strema().mapToInt(Dish::getCalories); // 스트림을 숫자 스트림으로 변환
Stream<Integer> stream = intStream.boxed(); // 숫자 스트림을 스트림으로 변환
```

### 2) 숫자범위

자바 8의 IntStream과 LongSteam에서는 range와 rangeClosed라는 두 가지 정적 메서드를 제공한다.

```java
IntSream evenNumbers = IntStream.rangeClosed(1, 100).filter(n -> n % 2 == 0);
System.out.println(evenNumbers.count());
```

rangeClose(1, 100)은 1과 100(경계값)을 포함하며 range(1, 100)은 1과 100(경계값)을 제외한다.

## 5.8 스트림 만들기

다양한 방식으로 스트림을 만들 수 있다.

### 1) 값으로 스트림 만들기

임의의 수를 인수로 받는 정적 메서드 Stream.of를 이용해서 스트림을 만들 수 있다.

```java
Stream<String> stream = Stream.of("Mordern", "Java", "In", "Action");
stream.map(String::toUpperCase).forEach(System.out.println);
```

### 2) null이 될 수 있는 객체로 스트림 만ㄷ르기

null이 될 수 있는 객체를 스트림으로 만들 수 있다.

```java
Stream<String> value = Stream.ofNullable(System.getProperty("home"));
```

### 3) 배열로 스트림 만들기

Arrays.stream을 이용해서 배열을 인수로 받아 스트림을 만들 수 있다.

```java
int[] numbers = {2, 3, 5, 7, 11, 13};
int sum = Arrays.stream(numbers).sum();
```

### 4) 함수로 무한 스트림 만들기

스트림 API는 함수에서 스트림을 만들 수 있는 두 정적 메서드 Stream.iterate와 Stream.generate를 제공한다. 두 연산을 이용해서 무한 스트림(infinite stream) 즉, 언바운드 스트림(unbounded stream)을 만들 수 있다.

**interate** : 요청할때마다 값을 생산

```java
Stream.iterate(new int[]{0, 1}, t-> new int[] {t[1], t[0] + t[1]})
  .limit(10)
  .map(t -> t[0)
  .forEach(System.out::println);
```

generate : 요청할때마다 값을 계산하지만, 생산된 각 값을 연속적으로 계산하지는 않음

```java
Stream.generate(Math::random)
  .limit(5)
  .forEach(System.out::println)
```