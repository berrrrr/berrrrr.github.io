---
layout: post
title: "[Modern Java In Action] 8. 컬렉션API 개선"
subtitle: "[Modern Java In Action] 8. 컬렉션API 개선"
categories: programming
tags: java
comments: true
---

"컬렉션 API가 없었다면 자바 개발자의 삶은 많이 외로웠을 것이다"

## 8.1 컬렉션 팩토리

### 8.1.1 리스트 팩토리

```java
1. 기존 방식 (변경 가능)
List<String> friends = new ArrayList<>();
friends.add("Raphael");
friends.add("Olivia");
friends.add("Thibaut");

2. Arrays.asList() 방식 (변경 불가)
List<String> friends
   = Arrays.asList("Raphael", "Olivia", "Thibaut");

3. Stream 방식 (변경 가능)
Set<String> friends
   = Stream.of("Raphael", "Olivia", "Thibaut")
           .collect(Collectors.toSet());

4. List Factory (변경 불가) - java9 이상
List<String> friends = List.of("Raphael", "Olivia", "Thibaut");
```

- 변경을 제약하는 것이 꼭 나쁜것은 아니다. 컬렉션이 의도치 않게 변하는 것을 막을 수 있다.
- 데이터 변경이 필요하면 Stream, 필요없다면 Factory를 권장

### python 컬렉션 리터럴

```python
# Literal Collections
fruits = ["apple", "mango", "orange"]  # list
numbers = (1, 2, 3)  # tuple
alphabets = {'a': 'apple', 'b': 'ball', 'c': 'cat'}  # dictionary
vowels = {'a', 'e', 'i', 'o', 'u'}  # set
```

- 이런걸 하고 싶었는 듯

### 내부 구현

```java
static <E> List<E> of(E e1) { return new ImmutableCollections.List12<>(e1);}
static <E> List<E> of(E e1, E e2) { ... }
static <E> List<E> of(E e1, E e2, E e3) { ... }
......
static <E> List<E> of(E... elements) { ... }  // 가변 인수 버전
```

- 가변 인수 버전은 배열 할당, 초기화, gc 비용이 들어가므로 최적화를 위해 요소 10개 까지는 노가다(?)로 고정 요소 버전의 인터페이스를 만들었다

### 8.1.2 집합 팩토리

```java
Set<String> friends = Set.of("Raphael", "Olivia", "Thibaut");
```

### 8.1.2 맵 팩토리

```java
1. 10개 이하의 key-value
Map<String, Integer> ageOfFriends
   = Map.of("Raphael", 30, "Olivia", 25, "Thibaut", 26);

2. 10개 초과 key-value
Map<String, Integer> ageOfFriends
       = Map.ofEntries(entry("Raphael", 30),
                       entry("Olivia", 25),
                       entry("Thibaut", 26));
```

- 둘 다 변경 불가

## 8.2 리스트와 집합 처리

List, Set에 추가된 method(java 8)

1. removeIf : Predicate를 만족하는 요소 제거

```java
1. 기존 코드 - Iterator와 Collection이 동기화 되지 않은 문제를 해결하느라 사용하기 까다롭다
for (Iterator<Transaction> iterator = transactions.iterator();
             iterator.hasNext(); ) {
           Transaction transaction = iterator.next();
           if(Character.isDigit(transaction.getReferenceCode().charAt(0))) {
               iterator.remove();
           }
}

2. removeIf 사용
transactions.removeIf(transaction ->
             Character.isDigit(transaction.getReferenceCode().charAt(0)));
```

2. replaceAll

```java
1. 기존 코드
for (ListIterator<String> iterator = referenceCodes.listIterator();
             iterator.hasNext(); ) {
           String code = iterator.next();
           iterator.set(Character.toUpperCase(code.charAt(0)) + code.substring(1));
}

2. replaceAll 사용
referenceCodes.replaceAll(code -> Character.toUpperCase(code.charAt(0)) +
             code.substring(1));
```

## 8.3 맵 처리

### 8.3.1 forEach 메서드

```java
1. 기존 코드 
for(Map.Entry<String, Integer> entry: ageOfFriends.entrySet()) {
           String friend = entry.getKey();
           Integer age = entry.getValue();
           System.out.println(friend + " is " + age + " years old");
}

2. forEach 사용
ageOfFriends.forEach((friend, age) -> System.out.println(friend + " is " +
             age + " years old"));

```

### 8.3.2 정렬 메서드

- Entry.comparingByValue
- Entry.comparingByKey

```java
Map<String, String> favouriteMovies
               = Map.ofEntries(entry("Raphael", "Star Wars"),
               entry("Cristina", "Matrix"),
               entry("Olivia",
               "James Bond"));

favouriteMovies
  .entrySet()
  .stream()
  .sorted(Entry.comparingByKey())
  .forEachOrdered(System.out::println);
```

- 부록 : forEachOrdered
    - forEach는 parallelStream에서는 순서 보장이 안됨
    - forEachOrdered는 병렬처리가 안됨
    - 참고 : [https://docs.oracle.com/javase/tutorial/collections/streams/parallelism.html](https://docs.oracle.com/javase/tutorial/collections/streams/parallelism.html)

### 8.3.3 getOrDefault

```java
Map<String, String> favouriteMovies
               = Map.ofEntries(entry("Raphael", "Star Wars"),
              entry("Olivia", "James Bond"));

System.out.println(favouriteMovies.getOrDefault("Olivia", "Matrix"));
System.out.println(favouriteMovies.getOrDefault("Thibaut", "Matrix"));
```

### 8.3.4 계산 패턴

1. computeIfAbsent

```java
1. 기존 코드
String friend = "Raphael";
List<String> movies = friendsToMovies.get(friend);
if(movies == null) {
    movies = new ArrayList<>();
   friendsToMovies.put(friend, movies);
}
movies.add("Star Wars");

2. computeIfAbsent 사용
friendsToMovies.computeIfAbsent("Raphael", name -> new ArrayList<>())
              .add("Star Wars");
```

### 8.3.5 삭제 패턴

```java
 
1. 기존 코드
String key = "Raphael";
String value = "Jack Reacher 2";
if (favouriteMovies.containsKey(key) &&
     Objects.equals(favouriteMovies.get(key), value)) {
   favouriteMovies.remove(key);
   return true;
} else {
   return false;
}

2. remove 사용
favouriteMovies.remove(key, value);

```

### 8.3.6 교체  패턴

1. replaceAll : 각 항목 값을 교체

```java
Map<String, String> favouriteMovies = new HashMap<>();
favouriteMovies.put("Raphael", "Star Wars"); 
favouriteMovies.put("Olivia", "james bond");
favouriteMovies.replaceAll((friend, movie) -> movie.toUpperCase()); 
```

2. Replace : 키가 존재하면 값을 교체

### 8.3.7 합침

merge : 중복된 키를 합칠 때 주어진 함수에 따라 동작

```java
Map<String, Long> moviesToCount = new HashMap<>();

1. 기존 코드
String movieName = "JamesBond";
long count = moviesToCount.get(movieName);
if(count == null) {
   moviesToCount.put(movieName, 1);
}
else {
   moviesToCount.put(moviename, count + 1);
}

2. merge 사용
moviesToCount.merge(movieName, 1L, (key, count) -> count + 1L);
```

8.4 개선된 ConcurrentHashMap

- 부록 : Map 구현체
    - HashMap : 비동기(Thread-Safe 하지 않음)
    - HashTable : 동기화 되있음
    - ConcurrentHashMap : HashTable과 동일하지만 Entry 별로 동기화 처리하여 고성능
- CurrentHashMap에 추가된 연산
    - forEach : 각 (키, 값) 쌍에 주어진 액션 실행
    - reduce : 모든 (키, 값) 쌍을 제공된 리듀스 함수를 이용해 합침
    - searcch : 널이 아닌 값을 반환할 때까지 각 (키, 값) 쌍에 함수를 적용

```java
ConcurrentHashMap<String, Long> map = new ConcurrentHashMap<>();
        long parallelismThreshold = 1;
        Optional<Integer> maxValue =
           Optional.ofNullable(map.reduceValues(parallelismThreshold, Long::max));
```