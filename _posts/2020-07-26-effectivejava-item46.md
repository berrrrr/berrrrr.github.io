---
layout: post
title: '[Effective java] item46. 스트림에서는 부작용 없는 함수를 사용하라'
subtitle: '[Effective java] item46. 스트림에서는 부작용 없는 함수를 사용하라'
categories: programming
tags: java
comments: true
---

스트림은 **함수형 프로그래밍**에 기초한 패러다임이다. 따라서 그냥 가져다 쓴다는 생각보다는, 이 패러다임 자체를 이해해야한다.   
(함수형 프로그래밍의 개념에 대해서는 차후 다시 정리. 간단히 말해서는 순수한 함수를 작성해 사용해서 share/immutable한 상황을 겪지 않는 안정적인 프로그래밍을 지향하는 방식)   


## 1. 스트림 패러다임의 핵심
스트림 패러다임의 핵심은 계산을 변환으로 재구성하는것.  
이때 변환은 입력만이 결과에 영향을 주는 순수함수(pure function) 이어야함!  
- f(x) = y 라는 함수가 있을때, x가 입력이면 때려죽여도 y가 나와야한다는말. 절대절대 y+1이 나오면 안된다는말.   
- f(x) = y 라는 함수에 x를 넣었는데 y+1이 나오는걸 부작용(side effect) 라고 지칭함. 
스트림연산에 사용되는 함수객체는 부작용이 없어야함.   

ex) 잘못된 스트림 연산의 예시  
```java
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()){
    words.forEach(word -> {
        freq.merge(word.toLowerCase(), 1L, Long::sum);
    });
}
```
스트림코드를 가장한 반복코드블럭임.  
forEach는 연산결과를 보여주는 역할만 하는 **종단연산** 인데, 여기서는 종단연산 안에서 외부변수 `freq`를 수정하고있음.   

올바르게 고친 코드  
```java
Map<String, Long> freq = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()){
    freq = words.collect(groupingBy(String::toLowerCase, counting()))
}
```

## 2. 수집기(collector) 개념 
위의 예시에서 사용된 수집기(collector) 개념은 스트림 연산에서는 매우 필수적인 개념. `java.util.stream.Collectors` 클래스에 있는 메서드들을 사용하는데, 이 메서드들은 간단히 말해서 축소(reduction) - 스트림의 원소들을 객체 하나에 취합하는 행동을 한다. 그래서 collector를 사용하면 스트림의 원소들을 손쉽게 내가 원하는 컬렉션의 형태로 모을 수 있다. 
- toList() : 스트림 원소를 List형식으로 모음. 
- toSet() : 스트림 원소를 Set형식으로 모음. 
- toCollection(collectionFactory) : 스트림 원소를 프로그래머가 지정한 컬렉션 타입으로 모음. 

ex) 말뭉치 토큰 빈도표(freq)에서 가장 많이 나온 단어 10개 뽑기 
```java
List<String> topTen = freq.keySet().stream()
    .sorted(comparing(freq::get).reversed())
    .limit(10)
    .collect(toList());
```
- `freq::get`은 입력받은 단어의 빈도수를 반환 
- 빈도수를 가지고있는 `comparing`를 reverse(역순)으로 sorted (정렬)
- `collect(toList())`로 결과를 리스트 형식으로 반환

이제 어떤 수집기들이 있는지도 알아보자. (책에서는 36개 수집기를 다 다루는데 귀찮으니 몇개만..ㅎ)
### 1) toMap
스트림 원소를 Key-Value 형태로 재생산함. 
1. `toMap(keyMapper, valueMapper)` : 스트림원소를 키에 매핑하는 함수와 갚에 매핑하는 하는 함수를 인자로 받음. 
```java
class Book {
    private String name;
    private int releaseYear;
    private String isbn;
}

public Map<String, String> listToMap(List<Book> books) {
    return books.stream().collect(Collectors.toMap(Book::getIsbn, Book::getName));
}
```

2. `toMap(keyMapper, valueMapper, mergeFunction)` : 같은 키를 공유하는 값들이 있을 경우 입력받은 병합함수(mergeFunction)을 사용하여 기존값과 합침.
```java
Map<Artist, Album> topHits = albums.collect(toMap(Album::artist, a->a, maxBy(comparing(Album::sales))));
```
-> 앨범 스트림을 맵으로 바꾸는데, 이 맵은 각 음악가와 그 음악가의 베스트 앨범을 짝지은것 
```java
toMap(keyMapper, valueMapper, (oldVal, newVal) -> newVal)
```
-> key 충돌시 마지막값(new val)을 취하는 수집기 

### 2) groupingBy
분류함수(classifier)를 입력받아서 출력으로 원소들을 분류기가 분류한 카테고리별로 모아놓은 맵을 반환함. 
```java
words.collect(groupingBy(words -> alphabetize(word)))
```
--> 알파벳화 결과가 같은 단어들의 리스트로 매핑하는 맵 

인자로 다운스트림 수집기(down stream collector)를 같이 전달해주면 원소 리스트를 다른걸로 바꿀 수 있음
```java
words.collect(groupingBy(String::toLowerCase, counting())
```
--> 결과로 각 카테고리에 속하는 원소의 개수를 매핑한 맵을 얻을 수 있음 

### 2) joining
CharSequence의 인스턴스 스트림에만 적용 가능한 메서드로, 원소들을 연결(concat)함. 
1. `joining()` : 단순 concat
2. `joining(delimiter)` : delimiter를 넣어서 연결
3. `joining(prefix, delimiter, suffix)` : 접두문자, 구분자, 접미문자를 넣어서 연결 

## 정리
- 스트림파이프라인 프로그래밍의 핵심은 side effect없는 함수객체! 
- 스트림을 올바로 쓰려면 collector(수집기) 함수 객체를 잘 알아두고 사용해라! 