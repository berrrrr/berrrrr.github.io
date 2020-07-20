---
layout: post
title: JAVA Stream API란?
subtitle: JAVA Stream API란?
categories: programming
tags: java
comments: true
---

java8부터 추가된 Stream API 에 대해 알아보자

## 스트림(Stream)이란?
데이터 원소의 유한 혹은 무한 Sequence. (순서가 존재하는것들의 집합)

## 스트림 파이프라인(Stream pipeline)이란?
원소들로 수행하는 연산 단계를 표현하는 개념.  
소스스트림(source stream) -> 중간 연산(intermediate operation) -> 종단 연산(terminal operation)



## java의 Stream API
데이터 소스를 추상화하고 데이터를 다루는데 자주 사용되는 메서드들을 정의. 데이터를 추상화함으로써 데이터 소스가 무엇이든 동일한 방식으로 데이터를 다룰 수 있게됨. (-> 코드의 재사용성이 높아짐)
```java
//Stream 사용 전
String[] strArr = { "mash-up", "backend", "codingsquid" }
List<String> strList = Arrays.asList(strArr);

Arrays.sort(strArr);
Collections.sort(strList);

for(String str: strArr) {
  System.out.println(str);
}

for(String str : strList) {
  System.out.println(str);
}
```
```java
//Stream 사용 후
Stream<String> listStream = strList.stream();
Stream<String> arrayStream = Arrays.stream(strArr);

listStream.sorted().forEach(System.out::println);
arrayStream.sorted().forEach(System.out::println);
```

## Stream 특징
- Stream은 데이터소스를 변경하지않음. 필요하다면 정렬된 결과를 컬렉션에 담아 반환해야함. 
```java
List<String> sortedList = listStream.sorted().collect(Collections.toList());
```

- Stream은 일회용임. 한번사용하면 닫혀서 사용할 수 없음
```
listStream.sorted().forEach(System.out::print);
int numOfElement = listStream.count(); //에러. 스트림이 이미 닫힘
```

- Stream은 작업을 내부반복으로 처리함. (반복문을 메서드 내부에 숨길수있음) 

## Stream 생성 
스트림으로 작업을 하려면, 스트림을 생성해야함. Stream의 소스가 될 수 있는 객체는 배열, 컬렉션, 파일 등 다양함.
### Collection
```
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> listStream = list.stream();
```

### Array
```
Stream<String> strStream = Stream.of(new String[] {"a", "b", "c"});
Stream<String> strStream = Arrays.stream(new String[] {"a", "b", "c"});
```

## Stream 연산
### 중간 연산(intermediate operation) 
스트림을 어떠한 방식으로 변환(transform). 연산결과를 스트림으로 반환하기 때문에 중간 연산을 연속해서 연결할 수 있다.  
ex) map(), flatMap()

### 종단 연산(terminal operation)
중간연산이 내놓은 stream에 최후의 연산 수행.  스트림의 요소를 소모하면서 연산을 수행하기 때문에 단 한번만 연산이 가능.
ex) 원소를 출력  
ex) 특정 원소 하나를 선택   
ex) reduce(), collect()


## 병렬 stream
parallel()이라는 메서드를 호출하면 연산을 병렬로 수행 가능
```java
int sum = strStream.parallel()
                   .mapToInt(s -> s.length())
                   .sum();
```


> 참고 : effective java, https://effectivesquid.tistory.com/entry/Java-Stream%EC%9D%B4%EB%9E%80