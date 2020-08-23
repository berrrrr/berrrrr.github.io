---
layout: post
title: '[Effective java] item48. 스트림 병렬화는 주의해서 사용하라'
subtitle: '[Effective java] item48. 스트림 병렬화는 주의해서 사용하라'
categories: programming
tags: java
comments: true
---

스트림 병렬화는 주의해서 사용해야한다

## 1. java의 동시성 프로그래밍
1. java5 : 동시성컬렉션 `java.util.concurrent`, `Executor` Framework
2. java7 : 고성능 병렬분해 framework `fork-join`
3. java8 : Stream의 `parallel` method

## 2. 안정성과 응답가능
동시성프로그래밍을 올바로 작성하려면 안정성(safety)과 응답 가능(liveness) 상태를 유지해야함. 
스트림 라이브러리가 파이프라인을 병렬화하는 방법을 찾아내지 못하는 케이스에 parallel 메서드를 적응하면 강제종료할때까지 응답이 없을 수 있음.  
환경이 아무리 좋더라도 데이터소스가 `Stream.iterate`거나 중간연산으로 `limit`를 쓰면 파이프라인 병렬화로 성능개선을 할 수 없음.  
**스트림 파이프라인을 마구잡이로 병렬화하면 성능이 오히려 끔찍하게 나빠질수도 있다.**

## 3. 병렬화 효과가 좋은경우
### 1) 참조지역성이 좋은애들
스트림의 소스가 ArrayList, HashMap, HashSet, ConcurrentHashMap의 인스턴스거나 배열, int범위, long범위일 때 병렬화의 효과가 가장 좋다.  
얘네들의 공통점은 참조지역성(이웃한 원소의 참조들이 메모리에 연속해서 저장되는 특성)이 좋은 인스턴스들이라는것.!  
배열같은경우는 데이터 자체가 메모리에 연속해서 저장되므로, 가장 참조지역성이 좋아서 병렬화 효과가 가장 좋다.  

### 2) 종단연산이 reduction인 애들
종단연산이 원소들을 하나로 합치는 작업인 reduction 연산일때 병렬화 효과가 좋음. ex) min, max, count, sum..

## 4. 정리
- 스트림을 잘못병렬화 하면 성능이 나빠질 뿐 아니라 결과 자체가 잘못될수 있으니 매우 조심해서 사용해야함.   
- 변경 전후로 테스트해서 병렬화 사용에 가치가 있는지 확인해야함. 
- 계산도 정확하고 성능도 좋아졌음이 확실할때만 병렬화를 운영에 적용. 
