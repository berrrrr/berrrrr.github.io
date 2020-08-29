---
layout: post
title: Java Collections (List, Set, Map) 이해하기
subtitle: Java Collections (List, Set, Map) 이해하기
categories: programming
tags: java
comments: true
---

Java에서는 데이터를 저장하는 기본적인 자료구조들을 한 곳에 모아 관리하고 편하게 사용하기 위해 Java Collection Framework를 제공한다. 다음은 JCF의 상속 구조이며 사용 용도에 따라 List, Set, Map 3가지로 요약할 수 있다.  
![114](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/114_1.jpg)

## 각 Interface 특징

| Interface | Class | Charateristic |
|:---:|:---:|:---:|
| List | LinkedList, Stack, Vector, ArrayList | 순서 O. 데이터 중복 O |
| Set | HashSet, TreeSet | 순서 X. 데이터 중복 X |
| Map | HashMap, TreeMap, HashTable, Properties | Key-Value 쌍으로 이루어진 데이터 집합. 순서 X. Key는 중복 X. Value는 중복 O  |

## Collection Interface
모든 collection의 상위 인터페이스. collection이 가지는 핵심 method 선언. (add, contain, isEmpty, remove, size, iterator..)

### 1. List Interface
요소들의 순서를 저장. index를 사용해 특정 위치에 요소를 삽입, 접근 가능. 중복 허용.

#### 1) ArrayList
- 빠르고 크기를 마음대로 조절 가능한 배열
- 단방향 포인터구조. 순차적 접근에 강점

#### 2) Vector
- Array List의 구형 버전
- 모든 method가 동기화
- 많이 사용되진 않음

#### 3) LinkedList
- 양방향 포인터구조.
- 데이터 삽입, 삭제가 빈번하면 빠른성능 보장
- Stack, Queue, Deque 등을 만들때 사용됨

### 2. Set Interface
집합을 정의하며 요소의 중복을 허용하지 않음. 상위 메소드만 사용함.

#### 1) HashSet
- 가장 빠른 임의 접근
- 순서를 전혀 예측할 수 없음

#### 2) LinkedHashSet 
추가된 순서, 또는 가장 최근에 접근한 순서대로 접근 가능

#### 3) TreeSet
- 정렬된 순서대로 보관. 정렬 방법 지정 가능.

### 3. Map Interface
Key와 Value 쌍으로 연관지어 저장하는 객체.

#### 1) HashMap
- HashTable을 사용하여 Key값을 indexing하여 Map을 구현
- 중복 허용 X. 순서 보장 X
- Key와 Value에 Null이 가능

#### 2) HashTable
- HashMap보다 느리지만 동기화 지원
- key와 Value에 Null 불가능

#### 3) TreeMap
- Binary Search Tree로 Key-Value 데이터를 저장
- 정렬된 순서로 Key-Value를 저장해 빠른 검색이 가능
- 저장시 sorting하기때문에 저장시간이 오래걸림
- 내부적으로 red black tree로 구성되어있음.

#### 4) LinkedHashMap
- HashMap을 상속받은 클래스
- Map에 있는 Entry들이 LinkedList로 유지되므로 입력한 순서대로 접근 가능

> 출처 https://hackersstudy.tistory.com/26