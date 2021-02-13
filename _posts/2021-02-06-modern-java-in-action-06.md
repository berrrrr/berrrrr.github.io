---
layout: post
title: "[Modern Java In Action] 6. 스트림으로 데이터 수집"
subtitle: "[Modern Java In Action] 6. 스트림으로 데이터 수집"
categories: programming
tags: java
comments: true
---

최종연산 collect 를 통해 다양한 방식으로 데이터를 수집하는 연산을 수행할 수 있다. 다양한 collect 활용 방식을 알아보자. 

이 장에서는 스트림으로 데이터를 수집하는 다양한 방법에 대해 다룬다. 이때 사용되는 용어 Collection / collect / Collector를 헷갈리지 않게 아래와 같이 구분하고 넘어가자.

- **Collection** : 데이터의 집합. (ex. ArrayList)
- **collect** : 스트림의 최종연산중 하나. 스트림 데이터에 연산을 가해 최종 결과물을 얻게해주는 친구.
- **Collector** : collect에게 데이터를 어떻게 수집할지에 대한 '방식'을 알려주는 친구.

그리고 아래 Dish list객체를 예제에 계속 사용하니 어떻게생겼는지 일단 보고 넘어가자

```java
List<Dish> menu = Arrays.asList(
 new Dish("pork", false, 800, Dish.Type.MEAT),
 new Dish("beef", false, 700, Dish.Type.MEAT),
 new Dish("chicken", false, 400, Dish.Type.MEAT),
 new Dish("french fries", true, 530, Dish.Type.OTHER),
 new Dish("rice", true, 350, Dish.Type.OTHER),
 new Dish("season fruit", true, 120, Dish.Type.OTHER),
 new Dish("pizza", true, 550, Dish.Type.OTHER),
 new Dish("prawns", false, 300, Dish.Type.FISH),
 new Dish("salmon", false, 450, Dish.Type.FISH) );
```

## 6.1 컬렉터란?

함수형프로그래밍은 '무엇'을 원하는지 직접 명시하기만 하면 값을 얻을 수 있음. 

collect에 '무엇'을 원하는지를 직접 명시할 수 있는게 Collector 인터페이스. 

Collector 인터페이스를 구현하여 스트림의 요소를 어떻게 수집할지 지정할 수 있다. 

Collectors에서 제공하는 메서드의 기능은 크게 세 가지로 구분.

- 스트림 요소를 하나의 값으로 리듀싱/요약
- 요소 그룹화
- 요소 분할

## 6.2 리듀싱/요약

스트림을 넘겨주고 해당 스트림에서 요약된 정보를 얻는다.

### 1) 스트림에서 최댓값/최솟값 검색

```java
Comparator<Dish> dishCaloriesComparator = Comparator.comparingInt(Dish::gertCaloreis);
Optional<Dish> mostCaloriesDish = menu.stream().collect(maxBy(dishCaloriesComparator);
```

`Collectors.maxBy`, `Collectors.minBy` 메서드를 이용해 스트림의 최대값, 최소값을 계산할 수 있다. 요소를 비교할때 사용할 Comparator를 인수로 받아서 원하는 기준으로 비교할수있다. 

### 2) 요약연산

스트림에 존재하는 숫자객체의 **합계**나 **평균**등을 반환하는 연산을 요약연산이라고한다. 

음식들의 총 칼로리 계산을 아래와 같이 단 한줄로 가능하다. 

```java
int totalCalories = menu.stream().collect(summingInt(Dish::getCalories));
```

아래 그림을 보면 내부순환이 대충 어떻게 돌아가는지 보이는데, 내부적으로 '누적자'라는 친구한테 결과값을 누적하고 최종적으로 그 누적자를 결과로 리턴하게된다. 

![_2021-02-01__9.59.42](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-02-01__9.59.42.png?raw=true)

그 외 아래와 같이 다양한 요약연산이 존재한다.

- summingInt,summingLong, summimgDouble : 합계
- averagingInt, averagingLong, averagingDouble : 평균
- summarizingInt, summarizingLong, summarizingDouble : 카운트/합계/평균/최대값/최소값 등을 포함한 IntSummaryStatistics 라는 객체를 반환. pandas의 `Dataframe.describe()` 같은 친구이다.

### 3) 문자열 연결

joining 메서드를 이용해 연결된 문자열을 얻을 수 있다. 

- joining() : toString 메서드로 나타나는 객체의 문자열을 연결해서 반환
- joining(delimiter) : 문자열 사이사이 delimiter 삽입해서 연결해서 반환

```java
String shortMenu = menu.stream().map(Dish::getName).collect(joining());
// porkbeefchickenfrench friesriceseason fruitpizzaprawnssalmon

String shortMenu = menu.stream().map(Dish::getName).collect(joining(", "));
// pork, beef, chicken, french fries, rice, season fruit, pizza, prawns, salmon
```

### 4) 범용 리듀싱 요약연산

위에서 사전정의된 Collector들은 사용하기 쉽게 따로 구현된 인터페이스들인거고, 사실은 모두 reducing 팩터리메서드로 구현할수있다. 

가령 summingInt 같은 경우는 아래와 같이 구현된다. 

```java
int totalCalories = menu.stream()
  .collect(reducing(0, Dish::getCaloreis, (i, j) -> i + j));
```

reducing은 3개 인수를 받는다.

- 첫번째인수(0) : 누적자의 init값.(default값)
- 두번째인수(Dish::getCalories) : 변환함수
- 세번째인수((i, j) -> i + j)) : 합계함수

```java
Optional<Dish> mostCaloireDish = menu.stream().collect(reducing((d1, d2) -> d1.getCaloreis() > d2.getCalories() ? d1 : d2));
```

reducing은 위와같이 1개인수를 받을수도있다. 자기 자신을 그대로 반환하는 **항등함수**처럼 동작한다.  재귀함수처럼 동작하는..? 

### 5) **자신의 상황에 맞는 최적의 해법 선택**

사실 아래와 같이 스트림에서 직접 제공하는 메서드를 이용해서 합계를 구할수도잇다. (성능도 더 좋음;;) 

```java
int totalCalories = menu.stream().mapToInt(Dish::getCalories).sum();
```

Collector를 사용하는게 더 복잡해보일수도 있지만 재사용가능하고 내맘대로 커스터마이징이 가능하다는 장점이 있음. 이런걸 고려해서 상황에 따라 최적의 방법을 선택해서 개발하도록하자! 

## 6.3 그룹화

명령형으로 그룹화를 구현하려면 답이 없음. (6-1 트랜잭션 예제 참고) 그러나, 자바8의 함수형 프로그래밍을 이용하면 가독성 있는 한 줄의 코드로 그룹화를 구현할 수 있다.

```java
Map<Type, List<Dish>> dishesByType = menu.stream().collect(groupingBy(Dish::getType));
// {FISH=[prawns, salmon], 
// OTHER=[french fries, rice, season fruit, pizza],
// MEAT=[pork, beef, chicken]}
```

Dish.getType를 **분류함수(Classification function)**으로 하여 분류되어 쉽게 분류된다. 

![_2021-02-01__10.35.14](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-02-01__10.35.14.png?raw=true)

### 1) 그룹화된 요소 조작

그룹화 한 후, 각 그룹의 요소를 또 조작하고자 한다면? 

예를들어 type으로 그룹화한 만약 500칼로리가 넘는 요리만 필터한다고하자. 

```java
Map<Type, List<Dish>> caloricDishesByType = menu.stream()
																.filter(dish -> dish.getCalroies() > 500)
															  .collect(groupingBy(Dish::getType));
// {OTHER=[french fries, pizza], MEAT=[pork, beef]}
```

앞에서 배운 filter를 적용하면 될거같았는데, 미리 필터링해버리고 그룹화를 하다보니 결과에 FISH 애들이 아예 빠져버린다. 

근데 나는 이런필터링을 원하지 않았다. 그루핑을 하고, 그다음에 필터링해서 없으면 없는대로 그룹정보는 모두 보존하고싶다. 그렇다면 filtering 메소드를 사용하면 된다.

```java
Map<Type, List<Dish>> caloricDishesByType = menu.stream().collect(
groupingBy(Dish::getType, filtering(dish -> dish.getCalories() > 500, toList())));
// {OTHER=[french fries, pizza], MEAT=[pork, beef], FISH=[]}
```

groupBy 메서드를 오버로드해 두번째 인자로 필터링 메서드를 넣어주니, 각 그룹의 요소와 필터링 된 요소를 재그룹하여 원하는 결과를 얻을 수 있었다. 

같은 맥락으로 아래와 같이 groupingBy와 `mapping` , `flatmapping` 메서드를 연계할 수 있다. 

```java
// type별 요리의 이름 추출
Map<Type, List<String>> dishNamesByType = menu.stream().
  collect(groupingBy(Dish::getType, mapping(Dish::getName, toList())));

// type별 요리의 태그 추출. (두 수준의 리스트를 한 수준으로 평면화) 
Map<String, List<String>> dishTags = new HashMap<>();
dishTags.put("pork", asList("greasy", "salty"));
dishTags.put("beef", asList("salty", "roasted"));
dishTags.put("chicken", asList("fried", "crisp"));
dishTags.put("french fries", asList("greasy", "fried"));
dishTags.put("rice", asList("light", "natural"));
dishTags.put("season fruit", asList("fresh", "natural"));
dishTags.put("pizza", asList("tasty", "salty"));
dishTags.put("prawns", asList("tasty", "roasted"));
dishTags.put("salmon", asList("delicious", "fresh"));
Map<Type, Set<String>> dishNamesByType = 
  menu.stream().collect(groupingBy(Dish::getType, flatMapping(dish -> dishTags.get(dish.getName()).stream(), toSet())));
// {MEAT=[salty, greasy, roasted, fried, crisp], FISH=[roasted, tasty, fresh,delicious], OTHER=[salty, greasy, natural, light, tasty, fresh, fried]}
```

### 2) 다수준 그룹화

groupingBy를 중첩해서 다수준 그룹화를 할 수 있다.  두번째 인자로 groupingBy를 넘겨준다. 

```java
Map<Dish.Type, Map<CaloricLevel, List<Dish>>> dishesByTypeCaloricLevel =
menu.stream().collect(
			 groupingBy(Dish::getType,      // 첫번째 수준의 분류함수
				 groupingBy(dish -> {         // 두번째 수준의 분류함수 
					 if (dish.getCalories() <= 400) return CaloricLevel.DIET;
					 else if (dish.getCalories() <= 700) return CaloricLevel.NORMAL;
					 else return CaloricLevel.FAT;
					 } )
				 )
			);
```

그룹화의 결과로 이렇게 2단계 맵을 얻을 수 있다.

```java
{MEAT={DIET=[chicken], NORMAL=[beef], FAT=[pork]},
 FISH={DIET=[prawns], NORMAL=[salmon]},
 OTHER={DIET=[rice, seasonal fruit], NORMAL=[french fries, pizza]}}
```

첫번째수준 분류함수 : MEAT, FISH, OTHER

두번째수준 분류함수 : DIET, NORMAL, FAT

### 3) 서브그룹으로 데이터 수집

groupingBy 로 넘겨주는 컬렉터 형식은 제한이 없다. 다양한 메서드들을 넘겨서 결과를 받을 수 있다. 

```java
Map<Dish.Type, Long> typesCount = menu.stream().collect(
 groupingBy(Dish::getType, counting()));
// {MEAT=3, FISH=2, OTHER=4}
```

### 4) 컬렉터 결과를 다른 형식에 적용

컬렉터의 결과에 다른 연산을 한번 더 하고싶을때가 있다. 

```java
Map<Dish.Type, Optional<Dish>> mostCaloricByType =
 menu.stream().collect(
				groupingBy(Dish::getType,
				maxBy(comparingInt(Dish::getCalories))));
// {FISH=Optional[salmon], OTHER=Optional[pizza], MEAT=Optional[pork]}
```

예를들어 위 collect의 결과로는 Optional<Dish>를 리턴으로 받게되는데, 나는 Optional.get 연산을 해서 Dish 객체를 오롯이 받고싶다면..?? 

`collectingAndThen` 을 사용하여 컬렉터가 반환한 결과를 다른 형식으로 활용할 수 있다. 

적용할 컬렉터와 변환함수를 인수로 받아 다른 컬렉터를 반환한다. 

```java
Map<Dish.Type, Dish> mostCaloricByType =
 menu.stream().collect(
			groupingBy(Dish::getType,       // 분류함수 
							   collectingAndThen(maxBy(comparingInt(Dish::getCalories)), // 컬렉터 
								 Optional::get)));  // 변환함수 
// {FISH=salmon, OTHER=pizza, MEAT=pork}
```

![_2021-02-01__11.59.43](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-02-01__11.59.43.png?raw=true)


## 6.4 분할

분할은 분할함수라 불리는 Predicate를 분류함수로 사용하는 특수한 그루핑 기능. 

`partitioningBy` 콜렉터를 이용한다.

ex. 채식인요리 / 채식아닌 요리로 분류

```java
Map<Boolean, List<Dish>> partitionedMenu =
 menu.stream().collect(partitioningBy(Dish::isVegetarian));

// {false=[pork, beef, chicken, prawns, salmon],
//  true=[french fries, rice, season fruit, pizza]}
```

### 분할의 장점

- 분할 함수가 반환하는 참,거짓 두 가지 요소의 스트림 리스트를 모두 유지한다.
- 참/거짓 두가지 키만 포함하므로 더 간결하고 효과적이다.
- 다수준 그루핑과 마찬가지로, 다수준 분할이 가능하다.

## 6.5 Collector 인터페이스

여태까지는 미리 Collector 인터페이스를 구현한 많은 컬렉터들을 살펴봤다.

우리는 Collector 인터페이스를 직접 구현해서 더 효율적으로 문제를 해결하는 컬렉터를 만들 수 있다.

```java
public interface Collector<T, A, R> {
		 Supplier<A> supplier();
		 BiConsumer<A, T> accumulator();
		 Function<A, R> finisher();
		 BinaryOperator<A> combiner();
		 Set<Characteristics> characteristics();
}
```

- T : 수집될 스트림 항목 형식
- A : 중간결과 누적 객체 형식
- R : 반환할 객체 형식

가령, Stream<T>의 모든 요소를 List<T>  로 수집하는 ToListCollector<T> 라는 클래스(toList랑 같은기능)

`public class ToListCollector<T> implements Collector<T, List<T>, List<T>>`

위와 같이 구현된다. 

### 1) Collector 인터페이스의 메서드

다섯개 메서드를 ToListCollector 의 예시를 통해 하나씩 살펴보자. 

- **supplier 메서드** : 빈 누적자 객체를 만드는 메서드.

    ```java
    public Supplier<List<T>> supplier() {
    	 return ArrayList::new;
    }
    ```

- **accumulator 메서드** : 누적자 객체에 리듀싱 연산을 수행하는 함수를 반환.

    ```java
    public BiConsumer<List<T>, T> accumulator() {
    	 return List::add;
    }
    ```

- **finisher 메서드** : 누적자객체를 최종 결과로 변환.

    ```java
    public Function<List<T>, List<T>> finisher() {
    	 return Function.identity();
    }
    ```

- **combiner 메서드** : 병렬처리시 누적자객체가 결과를 어떻게 처리할지 정의.

    ```java
    public BinaryOperator<List<T>> combiner() {
    	return (list1, list2) -> {
    		 list1.addAll(list2);
    		 return list1; }
    }
    ```

- **Charateristic 메서드** : 병렬처리에 대한 힌트 제공.
    - UNORDERED : 리듀싱 결과는 순서에 영향을 받지 않는다
    - CONCURRENT : accumulator를 동시 호출 가능하다. (UNORDERED가 설정되지 않은 상황에서는 순서가 무의미할때만 사용가능)
    - IDENTITY_FINISH : 최종결과로 누적자 객체를 바로 사용한다

    ToListCollector 같은 경우, UNORDERED, CONCURRENT, IDENTITY_FINISH 모두 해당

### 2) 응용하기

```java
import java.util.stream.Collector;
import static java.util.stream.Collector.Characteristics.*;
public class ToListCollector<T> implements Collector<T, List<T>, List<T>> {
 @Override
 public Supplier<List<T>> supplier() {
	 return ArrayList::new;
 }
 @Override
 public BiConsumer<List<T>, T> accumulator() {
	 return List::add;
 }
 @Override
 public Function<List<T>, List<T>> finisher() {
	 return Function.identity();
 }
 @Override
 public BinaryOperator<List<T>> combiner() {
	 return (list1, list2) -> {
		 list1.addAll(list2);
		 return list1;
	 };
 }
 @Override
 public Set<Characteristics> characteristics() {
	 return Collections.unmodifiableSet(EnumSet.of(IDENTITY_FINISH, CONCURRENT));
 }
}
```

위에서 구현한 ToListCollector는 아래와 같이 toList() 컬렉터와 동일하게 작동한다.

```java
List<Dish> dishes = menuStream.collect(new ToListCollector<Dish>());
List<Dish> dishes = menuStream.collect(toList());
```

이때, 복잡하게 `ToListCollector` 처럼 완전히 컬렉터를 구현하지 않고 세 함수를 인수로 받는 collect 메서드를 오버로드하여  동일한 효과를 낼 수 있다. 

```java
List<Dish> dishes = menuStream.collect(
	 ArrayList::new,   // 발행
	 List::add,        // 누적
	 List::addAll);    // 합침
```

하지만 가독성이 구리니 비추한다. 

## 6.6 챕터 요약

- collect 는 다양한 방법(컬렉터)를 인수로 갖는 최종연산
- sum, min, max, average 등의 컬렉터들이 미리 정의되어있으니 갖다쓰기만하면됨
- groupingBy로 스트림요소를 그루핑할수있음
- partitioningBy로 스트림 요소를 분할할수있음
- Collector로 multi-level의 그룹화, 분할, 리듀싱할수있음
- Collector 인터페이스의 5가지 메서드를 구현해서 커스텀컬렉터를 개발할수있음