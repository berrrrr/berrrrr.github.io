---
layout: post
title: "[Modern Java In Action] 11. null 대신 Optional 클래스"
subtitle: "[Modern Java In Action] 11. null 대신 Optional 클래스"
categories: programming
tags: java
comments: true
---


모든 자바개발자들이 겪고있는 NullPointerException 에러.. 자바8에서는 이를 해결하기위해 Optional이라는 새로운 선택지를 들고왔다. 어떻게 널포인트익셉션지옥에서 벗어날수있을지 알아보자. 

## 11.1 값이 없는 상황을 어떻게 처리할까?

다음처럼 자동차와 자동차 보험을 가지고 있는 사람 객체를 중첩 구조로 구현했다고 하자.

```java
public class Person {
    private Car car;

    public Car getCar() {
        return car;
    }
}

public class Car {
    private Insurance insurance;

    public Insurance getInsurance() {
        return insurance;
    }
}

public class Insurance {
    private String name;

    public String getName() {
        return name;
    }
}
```

다음 코드에서는 어떤 문제가 발생할까?

```java
public String getCarInsuranceName(Person person) {
    return person.getCar().getInsurance().getName();
}
```

코드에는 아무 문제가 없는 것처럼 보이지만 차를 소유하지 않은 사람도 많다.

- 런타임에 NullPointerException 이 발생하면서 프로그램 실행이 중단
- Person이 null이면? getInstance()가 null이면?

### 11.1.1 보수적인 자세로 NullPointerException 줄이기

예기치 않은 NullPointerException을 피하려면 어떻게 해야 할까? 다음은 null 확인 코드를 추가해서 NullPointerException을 줄이려는 코드다.

```java
public String getCarInsuranceName(Person person) {
    if (person != null) { // null 확인 코드
        Car car = person.getCar();
        if (car != null) { // null 확인 코드
            Insurance insurance = car.getInsurance();
            if(insurance != null) { // null 확인 코드
                return insurance.getName();
            }
        }
    }
    return "Unknown";
}
```

- 모든 변수가 null인지 의심하므로 변수를 접근할 때마다 중첩된 if가 추가되면서 들여쓰기 level증가!
- 위와 같은 반복 패턴 코드를 깊은 의심이라고 부름.

```java
public String getCarInsuranceName(Person person) {
    if (person == null) {
        return "Unknown";
    }
    Car car = person.getCar();
    if (car == null) {
        return "Unknown";
    }
    Insurance insurance = car.getInsurance();
    if (insurance == null) {
        return "Unknown";
    }
    return insurance.getName();
}
```

- 중첩 if블록을 없앴다.
- null이 발견하는 즉시 "Unknown"을 반환
- 문제점
    - 메서드에 4개의 출구가 생겼고 출구때문에 유지보수가 어려워진다.
    - 또한 "Unknown"이라는 문자가 반복되기 때문에 오타가 발생할수도 있음. →상수로 바꾸면 좋을듯!

### 11.1.2 null 때문에 발생하는 문제

- **에러의 근원이다** : NullPointerException은 자바에서 가장 흔히 발생하는 에러다.
- **코드를 어지럽힌다**. : 코드의 가독성 저하
- **아무 의미가 없다 :** 값이 없음을 표현하는 방법으로 적절치 않다
- **자바 철학에 위배된다** : 자바는 개발자로부터 모든 포인터를 숨겼으나, null은 예외!
- **형식 시스템에 구멍을 만든다**
    - null은 무형식이며 정보를 포함하지 않음.
    - 모든 참조형식에 할당할 수 있고, 애초에 null을 사용한 의도 파악이 어려움.

### 11.1.3 다른 언어는 null 대신 무얼 사용하나?

최근 그루비 같은 언어에서 안전 내비게이션 연산자(safe navigation operator) - (?.)를 도입해서 null 문제를 해결함.

```groovy
def carInsuranceName = person?.car?.insurance?.name
```

- 그루비 안전 내비게이션 연산자를 이용하면 null 참조 예외 걱정 없이 객체에 접근할 수 있다.
- 이때 호출 체인에 null인 참조가 있으면 결과로 null이 반환된다.
- 안전 내비게이션 연산자를 사용하면  null 예외 문제를 더 근본적으로 해결 가능

하스켈, 스칼라 등의 함수형 언어는 아예 다른 관점에서 null 문제를 접근한다.

- 하스켈은 선택형값(optional value)을 저장할 수 있는 Maybe라는 형식을 제공한다.
- 스칼라도 T 형식의 값을 갖거나 아무 값도 갖지 않을 수 있는 Option[T]라는 구조를 제공한다

자바 8은 선택형값 개념의 영향을 받아서 java.util.Optional<T>라는 새로운 클래스를 제공한다.

## 11.2 Optional 클래스 소개

자바8은 하스켈과 스칼라의 영향을받아서 java.util.Optional<T>라는 새로운 클래스를 제공한다.

Optional은 선택형값을 캡슐화하는 클래스다.

ex) Person이 차를 소유하지 않고 있을 경우 Car 변수에 null을 할당하여야 하지만 Optional을 활용하여 Optional<Car>로 표현할수 있다.


그림 11-1 Optional Car

- 값이 있으면 Optional 클래스는 값을 감싼다.
- 값이 없으면 Optional.empty 메서드로 Optional을 반환한다

      (Optional.empty는 Optional의 특별한 싱글턴 인스턴스를 반환하는 정적 팩토리 메서드이다.)

```java
public class Person {
    // 사람이 차를 소유했을 수도 소유하지 않았을 수도 있으므로 Optional로 정의한다.
    private Optional<Car> car; 

    public Optional<Car> getCar() {
        return car;
    }
}

public class Car {
    // 자동차가 보험에 가입되어 있을 수도 가입되어 있지 않았을 수도 있으므로 Optional로 정의한다.
    private Optional<Insurance> insurance; 

    public Optional<Insurance> getInsurance() {
        return insurance;
    }
}

public class Insurance {
    private String name; // 보험회사에는 반드시 이름이 있다.

    public String getName() {
        return name;
    }
}
```

- Optional 클래스를 사용하면서 모델의 의미(sementic)가 더 명확해졌음을 확인할 수 있다.
- 사람이 자동차를 소유했을 수도 아닐 수도 있으며, 자동차는 보험에 가입되어 있을 수도 아닐 수도 있음을 명확히 설명한다.
- 반면에 보험회사의 이름은 반드시 있어야하는 값이므로 String으로 선언했다.

- Optional을 이용하면 값이 없는 상황이 우리 데이터에 문제가 있는 것인지 아니면 알고리즘의 버그       인지 명확하게 구분할 수 있다.                                                                                                            - 모든 null 참조를 Optional로 대치하는 것은 바람직하지 않다.                                                           - Optional의 역할은 더 이해하기 쉬운 API를 설계하도록 돕는 것이다.

## 11.3 Optional 적용 패턴

 실제로 Optional을 활용하는 방법에 대해서 알아보자.

### 11.3.1 Optional 객체 만들기

Optional을 사용하려면 Optional 객체를 만들어야 한다. 다양한 방법으로 Optional 객체를 만들 수 있다.

**빈 Optional**

정적 팩토리 메서드 Optional.empty로 빈 Optional 객체를 얻을 수 있다.

```java
Optional<Car> optCar = Optional.empty();
```

**null이 아닌 값으로 Optional 만들기**

또는 정적 팩토리 메서드 Optional.of로 null이 아닌 값을 포함하는 Optional을 만들 수 있다

```java
Optional<Car> optCar = Optional.of(car);
```

이제 car가 null이라면 즉시 NullPointerException이 발생한다(Optional을 사용하지 않았다면 car의 프로퍼티에 접근하려 할 때 에러가 발생했을 것이다).

null값으로 Optional 만들기

```java
Optional<Car> optCar = Optional.ofNullable(car);
```

- car가 null이면 빈 Optional 객체가 반환된다.

Optional이 비어있으면 get을 호출했을 때 예외가 발생한다. 

즉, Optional을 잘못 사용하면 결국 null을 사용했을 때와 같은 문제를 겪을 수 있다.

Optional로 명시적인 검사를 제거할 수 있는 방법을 살펴본다.

### 11.3.2 맵으로 Optional의 값을 추출하고 변환하기

예를 들어 보험회사의 이름을 추출한다고 가정하자. 

다음 코드처럼 이름 정보에 접근하기 전에 insurance가 null인지 확인해야 한다.

```java
String name = null;
if(insurance != null) {
    name = insurance.getName();
}
```

이런 유형의 패턴에 사용할 수 있도록 Optional은 map 메서드를 지원한다

```java
Optional<Insurance> optInsurance = Optional.ofNullable(insurance);
Optional<String> name = optInsurance.map(Insurance::getName);
```

- 스트림의 map 메서드와 개념적으로 비슷함
- Optional이 값을 포함하면 map의 인수로 제공된 함수가 값을 바꾸고

       Optional이 비어있으면 아무일도 일어나지 않는다.



### 11.3.3 flatMap으로 Optional 객체 연결

map을 사용하는 방법을 배웠으므로 다음처럼  map을 이용해서 코드를 재구현할 수 있다.

```java
Optional<Person> optPerson = Optional.of(person);
Optional<String> name = optPerson.map(Person::getCar)
                                 .map(Car::getInsurance)
                                 .map(Insurance::getName);
```

안타깝게도 위 코드는 컴파일되지 않는다.~

Why? Why?

- 변수 optPeople의 형식은 Optional<People>이므로 map 메서드를 호출할 수 있다.
- getCat는 Optional<Car> 형식의 객체를 반환한다
- map 연산의 결과는 Optional<Optional<Car>> 형식의 객체다
- getInsurance는 또 다른 Optional 객체를 반환하므로 getInsurance 메서드를 지원하지 않는다.

**어떻게 해야할까?**

- 스트림의 flatMap과 같이 우리도 이차원 Optional을 일차원 Optional로 평준화해야 한다.
- flatMap 메서드를 통해 이차원 Optional이 일차원 Optional로 바뀐다.

**Optional로 자동차의 보험회사 이름 찾기**

Optional의 map과 flatMap을 살펴봤으니 이제 이를 실제로 사용해보자

```java
public String getCarInsuranceName(Optional<Person> person) {
	return person.flatMap(Person::getCar)
							 .flatMap(Car::getInsurance)
							 .map(Insurance::getName)
							 .orElse("Unknown"); //결과 Optional이 비어있으면 기본값 사용
}
```

- null을 확인하느라 조건 분기문을 추가해서 코드를 복잡하게 만들지 않으면서도 쉽게 이해할 수 있는 코드를 완성했다.
- getCarInsuranceName 메서드의 시그니처를 고쳤다.
    - 주어진 조건에 해당하는 사람이 없을 수 있기 때문이다.
    - 그래서 Person 대신 Optional<Person>을 사용하도록 메서드 인수 형식을 바꿈
    - 또한 Optional을 사용하므로 도메인 모델과 관련한 암묵적인 지식에 의존하지 않고 명시적으로 형식 시스템을 정의가 가능했다. (메서드가 빈값을 받거나 빈결과를 반환할 수도 있다)

**Optional을 이용한 Person/Car/Insurance 참조 체인**

우선 Person을 Optional로 감싼 다음에 flatMap(Person::getCar)를 호출했다

첫 번째 단계에서는 Optional 내부의 Person에 Function을 적용한다. (getCar 메서드가 Function이다.)

- getCar 메서드는 Optional<Car>를 반환하므로 Optional 내부의 Person이 Optional<Car>로 변환되면서 중첩 Optional이 생성된다.
- flatMap 연산으로 Optional을 평준화한다.

        평준화 과정이란 이론적으로 두 Optional을 합치는 기능을 수행하면서 둘 중 하나라도 null이면 

        빈 Optional을 생성하는 연산이다.

두 번째 단계도 첫 번째 단계와 비슷하게 Optional<Car>를 Optional<Insurance>로 변환한다. 

세 번째 단계에서 Insurance.getName()은 String을 반환하므로 flatMap을 사용할 필요가 없다.

- 호출 체인 중 어떤 메서드가 빈 Optional을 반환한다면 전체 결과로 빈 Optional을 반환하고 아니면 관련 보험회사의 이름을 포함하는 Optional을 반환한다.
- 이제 반환된 Optional의 값을 어떻게 읽을 수 있을까?
- Optional은 기본값을 제공하거나 Optional을 언랩(unwrap)하는 다양한 메서드를 제공한다.

### 11.3.4 Optional 스트림 조작

자바 9에서는 Optional을 포함하는 스트림을 쉽게 처리할 수 있도록 Optional에 stream() 메서드를 추가했다. Optional 스트림을 값을 가진 스트림으로 변환할 때 이 기능을 유용하게 활용할 수 있다.

```java
public Set<String> getCarInsuranceNames(List<Person> persons) {
    return persons.stream()
                  .map(Person::getCar) // 사람 목록을 각 사람이 보유한 자동차의 Optional<Car> 스트림으로 변환
                  .map(optCar -> optCar.flatMap(Car::getInsurance)) // flatMap 연산을 이용해 Optional<Car>을 해당 Optional<Insurance>로 변환
                  .map(optIns -> optIns.map(Insurance::getName)) // Optional<Insurance>를 해당 이름의 Optional<String>으로 매핑
                  .flatMap(Optional::stream) // Stream<Optional<String>>을 현재 이름을 포함하는 Stream<String>으로 변환
                  .collect(toSet()); // 결과 문자열을 중복되지 않은 값을 갖도록 집합으로 수집
}
```

이 예제는 Optional 값이 감싸있으므로 이 과정이 조금 더 복잡해졌다. 

- map을 수행해서 Stream<Optional<Car>>를 얻음.
- 이어지는 두개의 map 연산을 이용해서  Optional<Car> → Optional<Insurance>로 변환.
- 또 각각을 Optional<String>으로 변환 .
- 마지막 반환 되는것은 Stream<Optional<String>>이다.

! 마지막 결과를 얻으려면 빈 Optional을 제거하고 언랩해야하것이 문제이다. 

```java
Stream<Optional<String>> stream = ...
Set<String> result = stream.filter(Optional::isPresent)
                           .map(Optional::get)
                           .collect(toSet());
```

- Optional 클래스의 Stream() 메서드를 이용하면 한 번의 연산으로 같은 결과를 얻을 수 있다.
- 이런 방법으로 스트림의 요소를 두 수준인 스트림의 스트림으로 변환하고 다시 한 수준인 평면 스트림으로 바꿀 수 있다.
- 이 메서드의 참조를 스트림의 한 요소에서 다른 스트림으로 적용하는 함수로 볼 수 있으며 이를 원래 스트림에 호출하는 flatMap 메서드로 전달할 수 있다.
- 각 Optional이 비어있는지 아닌지에 따라 Optional을 0개 이상의 항목을 포함하는 스트림으로 변환한다.

     (Optional을 언랩하고 비어있는 Optional은 건너뛸 수 있다.)

### 11.3.5 디폴트 액션과 Optional 언랩

Optional 인스턴스에 포함된 값을 읽는 다양한 방법을 제공한다.

- get()
    - 값을 읽는 가장 간단한 메서드이면서 동시에 가장 안전하지 않은 메서드다.
    - 값이 없으면 NoSuchElementException을 발생시킨다.
    - 값이 반드시 있다고 가정할 수 있는 상황에서만 사용한다.
- orElse(T other)
    - Optional이 값이 포함하지않을때 기본값을 제공한다.
    - 예제 11-5 참고
- orElseGet(Supplier<? extends T> other)
    - orElse 메서드에 대응하는 게으른 버전의 메서드
    - Optional에 값이 없을때만 Supplier가 실행됨.
    - 디폴트메서드를 만드는데 시간이 걸리는 경우 해당 메서드를 사용하는 것이 좋다.
- orElseThrow(Supplier<? extends X> exceptionSupplier)
    - Optional이 비어있을 때 예외를 발생시킨다는 점에서 get 메서드와 비슷하다.
    - 이 메서드는 발생시킬 예외의 종류를 선택할 수 있다
- ifPersent(Consumer<? super T> consumer)
    - 값이 존재할 때 인수로 넘겨준 동작을 실행할 수 있다.
    - 값이 없으면 아무 일도 일어나지 않는다.

자바 9에서는 다음의 인스턴스 메서드가 추가되었다.

- ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction)
    - Optional이 비었을 때 실행할 수 있는 Runnable을 인수로 받는다는 점만 ifPresent와 다르다.

### 11.3.6 두 Optional 합치기

Person과 Car 정보를 이용해서 가장 저렴한 보험료를 제공하는 보험회사를 찾는 외부 서비스가 있다고 가정하자.

```java
public Insurance findCheapestInsurance(Person person, Car car) {
    // 다양한 보험회사가 제공하는 서비스 조회
    // 모든 결과 데이터 비교
    return cheapestCompany;
}
```

이제 두 Optional을 인수로 받아서 Optional<Insurance>를 반환하는 null 안전 버전(nullsafe version)의 메서드를 구현해야 한다.

* Optional 클래스는 Optional이 값을 포함하는지 여부를 알려주는 isPresent라는 메서드를 활용

```java
public Optional<Insurance> nullSafeFindCheapestInsurance(Optional<Person> person, Optional<Car> car) {
    if (person.isPersent() && car.isPersent()) {
        return Optional.of(findCheapestInsurance(person.get(), car.get()));
    } else {
		    // 인수로 전달한 값 중 하나라도 비어있으면 빈 Optional<Insurance>를 반환
        return Optional.empty();
    }
}
```

안타깝게도 구현 코드는 null 확인 코드와 크게 다른 점이 없다.

 Optional 클래스에서 제공하는 기능을 이용해서 이 코드를 더 자연스럽게 개선할 수 없을까? 퀴즈 11-1을 살펴보면서 더 멋진 해결책을 찾아보자.

퀴즈 11-1. Optional 언랩하지 않고 두 Optional 합치기

map과 flatMap 메서드를 이용해서 기존의 nullSafeFindCheapestInsurance() 메서드를 한 줄의 코드로 재구현하시오.

```java
// 정답
public Optional<Insurance> nullSafeFindCheapestInsurance(Optional<Person> person, Optional<Car> car) {
        return person.flatMap(p -> car.map(c -> findCheapestInsurance(p, c)));
}
// flatMap 실행시 비어있으면 빈 Optional반환
// 첫번째 그렇지 않으면 flatMap메서드에 필요한 Optional<Insurance>를 반환하는 function으로 person을 사용한다. 
// 두번째 Optional에서 map을 호출할때 optional<car>가 포함되지 않으면 빈 Optional반환
// 마지막으로 person과 car가 모두 존재하므로 map으로 전달한 람다표현식이 실행되어서 호출가능.
```

### 11.3.7 필터로 특정값 거르기

종종 객체의 메서드를 호출해서 어떤 프로퍼티를 확인해야 할 때가 있다. 

예를 들어 보험회사 이름이 'CambridgeInsurance'인지 확인해야 한다고 가정하자. 

```java
Insurance insurance = ...;

//Insurance 객체가 null인지 여부를 확인한 다음에 getName 메서드를 호출해야 한다.
if(insurance != null && "CambridgeInsurance".equals(insurance.getName())) {
    System.out.println("ok");
}
```

Optional 객체에 filter 메서드를 이용해서 다음과 같이 코드를 재구현할 수 있다.

```java
Optional<Insurance> optInsurance = ...;
optInsurance.filter(insurance -> "CambridgeInsurance".equals(insurance.getName()))
            .ifPresent(x -> System.out.println("ok"));
```

filter 메서드는 프레디케이트를 인수로 받는다. Optional 객체가 값을 가지며 프레디케이트와 일치하면 filter 메서드는 그 값을 반환하고 그렇지 않으면 빈 Optional 객체를 반환한다.

퀴즈 11-2. Optional 필터링

우리의 Person/Car/Insurance 모델을 구현하는 Person 클래스에는 사람의 나이 정보를 가져오는 getAge라는 메서드도 있었다. 다음 시그니처를 이용해서 예제 11-5의 getCarInsuranceName 메서드를 고치시오.

```java
public String getCarInsuranceName(Optional<Person> person, int minAge)
```

즉, 인수 `person`이 `minAge` 이상의 나이일 때만 보험회사 이름을 반환한다.

```java
// 정답
public String getCarInsuranceName(Optional<Person> person, int minAge) {
    return person.filter(p -> p.getAge() >= minAge)
                 .flatMap(Person::getCar)
                 .flatMap(Car::getInsurance)
                 .map(Insurance::getName)
                 .orElse("Unknown");
}
```

### Optional 클래스의 메서드
| Method          | Desc                                                                                                                    |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| empty           | 빈 Optional 인스턴스 반환|
| filter          | 값이 존재하며 Predicate와 일치하면 값을 포함하는 Optional 반환. 값이 없거나 Predicate와 일치하지 않으면 빈 Optional반환 |
| flatMap         | 값이 존재하면 인수로 제공된 함수를 적용한 결과 Optional을 반환. 값이 없으면 빈 Optional반환|
| get             | 값이 존재하면 Optional이 감싸고 있는 값을 반환. 값이 없으면 NoSuchElementException 발생|
| ifPresent       | 값이 존재하면 지정된 Consumer을 실행. 값이 없으면 아무일도 일어나지않음|
| ifPresentOrElse | 값이 존재하면 지정된 Consumer실행. 값이 없으면 아무일도 일어나지않음|
| isPresent       | 값이 존재하면 true반환. 값이 없으면 false반환|
| map             | 값이 존재하면 제공된 매핑함수 적용|
| of              | 값이 존재하면 값을 감싸는 Optional을 반환. 값이 null이면 NullPointerException 발생|
| ofNullable      | 값이 존재하면 값을 감싸는 Optional을 반환. 값이 null이면 빈 Optional 반환|
| or              | 값이 존재하면 같은 Optional 반환. 값이 없으면 Supplier에서 만든 Optional 반환|
| orElse          | 값이 존재하면 값을 반환. 값이 없으면 기본값 반환|
| orElseGet       | 값이 존재하면 값을 반환. 값이 없으면 Supplier에서 제공하는 값을 반환|
| orElseThrow     | 값이 존재하면 값을 반환. 값이 없으면 Supplier에서 생성한 예외를 발생|
| stream          | 값이 존재하면 존재하는 값만 포함하는 스트림 반환. 값이없으면 빈 스트림 반환|

## 11.4 Optional을 사용한 실용예제

### 11.4.1 잠재적으로 null이 될 수 있는 대상을 Optional로 감싸기

살펴본것 처럼 null을 반환하는것보다 Optional을 반환하는것이 더 바람직하다.

Map<String, Object> 형식의 맵이 있는데 다음처럼 key로 접근한다고 가정한다.

```java
Object value = map.get("key");
```

- key에 해당하는 값이 없으면 null이 반환된다.
- map에서 반환되는 값을 Optional로 감싸서 개선할 수 있다

```java
Optional<Object> value = Optional.ofNullable(map.get("key"));
```

### 11.4.2 예외와 Optional 클래스

자바 API는 어떤 이유에서 값을 제공할 수 없을 때 null을 반환하는 대신 예외를 발생시킬 때도 있다. 

이것에 대한 전형적인 예가 문자열을 정수로 변환하는 정적 메서드 Integer.parseInt(String)다. 

이 메서드는 문자열을 정수로 바꾸지 못할 때 NumberFormatException을 발생시킨다. 

즉, 문자열이 숫자가 아니라는 사실을 예외로 알리는 것이다. 

기존에 값이 null일 수 있을때는 if문으로 null 여부를  확인했지만 예외를 발생시키는 메서드에서는 try/catch 블록을 사용해야 한다는 점이 다르다.

```java
public static Optional<Integer> stringToInt(String s) {
    try {
        return Optional.of(Integer.parseInt(s)); 
        // 문자열을 정수로 변환할 수 있으면 정수로 변환된 값을 포함하는 Optional을 반환한다.
    } catch (NumberFormatException e) {
        return Optional.empty(); // 그렇지 않으면 빈 Optional을 반환한다.
    }
}
```

위와 같은 메서드를 포함하는 유틸리티 클래스 OptionalUtility를 만들어서 필요할 때 OptionalUtility.stringToInt를 이용해서 문자열을 Optional<Integer>로 변환할 수 있다. 기존처럼 거추장스러운 try/catch 로직을 사용할 필요가 없다.

### 11.4.3 기본형 Optional을 사용하지 말아야 하는 이유

스트림처럼 Optional도 기본형으로 특화된 OptionalInt, OptionalLong, OptionalDouble 등의 클래스를 제공한다. 

- 예를 들어 예제 11-7에서 Optional<Integer> 대신 OptionalInt를 반환할 수 있다.
- 스트림과는 달리 Optional의 최대 요소 수는 한 개이므로 Optional에서는 기본형 특화 클래스로 성능을 개선할 수 없다.
- 기본형 특화 Optional은 Optional 클래스의 유용한 메서드 map, flatMap, filter 등을 지원하지 않음      (권장하지 않음)
- 게다가 스트림과 마찬가지로 기본형 특화 Optional로 생성한 결과는 다른 일반 Optional과 혼용할 수 없다.

      ex) 예제11-7이 OptionalInt를 반환한다면 이를 다른 Optional의 flatMap에 메서드 참조로 전달할 수 없다.

### 11.4.4 응용

Optional 클래스의 메서드를 실제 업무에서 어떻게 활용할 수 있는지 살펴보자. 

예를 들어 프로그램의 설정 인수로 Properties를 전달한다고 가정하자. 

```java
Properties props = new Properties();
props.setProperty("a", "5");
props.setProperty("b", "true");
props.setProperty("c", "-3");
```

이제 프로그램에서는 Properties를 읽어서 값을 초 단위의 지속 시간(duration)으로 해석한다. 

다음과 같은 메서드 시그니처로 지속 시간을 읽을 것이다.

```java
public int readDuration(Properties props, String name)
```

지속 시간은 양수여야 하므로 문자열이 양의 정수를 가리키면 해당 정수를 반환하지만 그 외에는 0을 반환한다. 이를 다음처럼 JUnit 어설션(assertion)으로 구현할 수 있다.

```java
assertEquals(5, readDuration(param, "a"));
assertEquals(0, readDuration(param, "b"));
assertEquals(0, readDuration(param, "c"));
assertEquals(0, readDuration(param, "d"));
```

이들 어설션은 다음과 같은 의미를 갖는다. 

프로퍼티 `a`는 양수로 변환할 수 있는 문자열을 포함하므로 `readDuration` 메서드는 5를 반환한다. 

프로퍼티 `b`는 숫자로 변환할 수 없는 문자열을 포함하므로 0을 반환한다. 

프로퍼티 `c`는 음수 문자열을 포함하므로 0을 반환한다. `d`라는 이름의 프로퍼티는 없으므로 0을 반환한다.

```java
public int readDuration(Properties props, String name) {
    String value = props.getProperty(name);

    if (value != null) { // 요청한 이름에 해당하는 프로퍼티가 존재하는지 확인한다.
        try {
						// 문자열 프로퍼티를 숫자로 변환하기 위해 시도한다.
            int i = Integer.parseInt(value); 
            if (i > 0) { // 결과 숫자가 양수인지 확인한다.
                return i;
            }
        } catch (NumberFormatException nfe) {

        }
    }
    return 0; // 하나의 조건이라도 실패하면 0을 반환한다.
}
```

예상대로 if문과 try/catch 블록이 중첩되면서 구현 코드가 복잡해졌고 가독성도 나빠졌다.

퀴즈 11-3. Optional로 프로퍼티에서 지속 시간 읽기

지금까지 배운 Optional 클래스의 기능과 예제 11-7의 유틸리티 메서드를 이용해서 예제 11-8의 명령형 코드를 하나의 유연한 코드로 재구현하시오.

다음은 간단하게 구현한 정답 코드다.

```java
public int readDuration(Properties props, String name) {
    return Optional.ofNullable(props.getProperty(name))
                   .flatMap(OptionalUtility::stringToInt)
                   .filter(i -> i > 0)
                   .orElse(0);
}
```

Optional과 스트림에서 사용한 방식은 여러 연산이 서로 연결되는 데이터베이스 질의문과 비슷한 형식을 갖는다.