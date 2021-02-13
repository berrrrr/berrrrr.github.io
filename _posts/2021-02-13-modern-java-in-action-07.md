---
layout: post
title: "[Modern Java In Action] 7. 병렬데이터 처리와 성능"
subtitle: "[Modern Java In Action] 7. 병렬데이터 처리와 성능"
categories: programming
tags: java
comments: true
---

병렬스트림으로 데이터를 병렬처리하는방법을 알아보자!

## 7.1 병렬스트림

컬렉션에  `parallelStream` 호출시 생성되는 스트림. 각 스레드에서 분할된 작업을 처리할 수 있도록 분할한 스트림.

### 1) 순차스트림을 병렬스트림으로 변환

```java
public long parallelSum(long n) {
    return Stream.iterate(1L, i -> i + 1)
                 .limit(n)
                 .parallel()  // 스트림을 병렬스트림으로 변환
                 .reduce(0L, Long::sum);
}
```

위와 같이 `parallel` 메서드를 호출하면 병렬로 처리된다. 아래와 같이 스트림이 여러 청크(chunk : 큰 덩어리)로 분할되고 각 청크가 병렬로 수행된다.

![_2021-02-08__12.24.50.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-02-08__12.24.50.png?raw=true)

### 2) 순차,병렬을 여러번 호출하면?

```java
stream.parallel()
          .filter(...)
          .sequential()
          .map(...)
          .parallel() // 얘로 최종결정됨.
          .reduce();
```

이런식으로 출한다면? 최종 호출된 메서드가 전체 파이프라인에 영향미침. 

### 3) 스트림 성능 측정

JMH 같은 라이브러리를 이용하자. 

### 4) 병렬 스트림의 올바른 사용

보통 병렬스트림 쓰다가 공유된 상태를 바꾸는 알고리즘을 사용했을때 망하게된다. 병렬 스트림이 올바로 동작하려면 공유된 가변상태, 쉽게 말해 공유자원을 조작하는 행동을 피해야한다는것을 기억하자

### 5) 병렬스트림 효과적으로 사용하기

- 병렬스트림 쓰는게 좋은지 확신안서면 직접 뭐가빠른지 측정해보기
- boxing, unboxing 주의..
- 요소의 순서에 의존하는 연산같이 순차스트림보다 병렬스트림에서 효율이 나쁜애들에 쓰지않도록 주의
- 전체 파이프라인 연산비용 고려
- 소량데이터에서는 병렬스트림 도움안됨
- 스트림 구성 자료구조가 적절한지 확인. 참조지역성좋은 자료구조들이 좋다 ([참고](https://berrrrr.github.io/programming/2020/08/23/effectivejava-item48/))
- 최종연산 병합과정 비용이 적어야 좋음

## 7.2 포크/조인 프레임워크

포크/조인 프레임워크는 병렬화할수있는 작업을 재귀적으로 작은 작업으로 분할한 뒤, 각 결과를 합쳐 전체 결과를 만들도록 설계된 프레임워크.

### 1) Recursive Task

어떻게 divde-and-conquer(분할-정복)할건지 구현해야함.

![_2021-02-08__12.33.36.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-02-08__12.33.36.png?raw=true)
위와 같이 포크/조인과정을 `RecursiveTask` 를 통해 구현한다

### 2) 제대로 사용해보기

- join메서드 : 두 서브태스크가 모두 시작된 다음에 join 호출하도록 구현
- invoke 메서드는 병렬계산 시작할때만 사용
- fork 메서드 : threadPool의 일정 조정
- compute 메서드 : 한쪽작업이 fork 호출하면 다른 한쪽은 compute 호출
- fork/join 프레임워크는 디버깅 어려움..
- fork/join쓴다고 무조건 순차처리보다 빨라질거라는 생각은 금물

### 3) 작업훔치기

할일을 먼저 끝낸 스레드가 다른 스레드의 작업을 뺏어옴으로서 스레드풀의 작업이 각 스레드들에게 공정하게 분배되도록하는 알고리즘을 작업훔치기라고 함. 이거덕분에 노는 스레드없이 풀로 병렬처리를 가동시킬수있다 

## 7.3 Spliterator 인터페이스

앞장에서 Collector 인터페이스를 구현해서 내가 원하는대로 데이터 수집할수있는 콜렉터를 만들었던것처럼 병렬처리에서도 Spliterator인터페이스를 구현해서 분할작업을 내맘대로 할수있게 커스터마이징할수있다..

- tryAdvance : 요소를 순차적으로 탐색하다가 남은 요소가 있으면 참, 없으면 거짓 반환
- tryeSplit : Spliterator의 핵심.. 요소를 분할해서 두번째 Spliterator를 생성
- estimateSize : 탐색해야할 요소수
- characteristics : Spliterator에게 작업의 힌트를 제공

### 1) 분할과정

스트림을 여러 스트림으로 분할하는 과정을 재귀적으로 수행. trySplit을 이용하여 분할하고 이친구가 null을 리턴할때까지 반복함. 

### 2) charateristics

작업에게 아래와 같이 힌트를 제공할수있다

ORDERED, DISTINCK, SORTED, SIZED, NON-NULL, IMMUTABLE, CONCURRENT, SUBSIZED