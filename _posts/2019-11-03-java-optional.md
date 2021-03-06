---
layout: post
title: JAVA의 Optional Class
subtitle: JAVA의 Optional Class
categories: programming
tags: java
comments: true
---

Optional 은 존재할수도 있지만 안할수도있는 객체. 즉 null이 될 수도 있는 객체를 감싸는 Wrapper class이다. 기존 nullable 객체들의 경우 런타임에 NPE(NullPointerException) 예외를 발생시키거나 NPE 방어를 위해 들어간 null 체크 로직때문에 코드 가독성과 유지보수성이 떨어졌다. 이런 nullable 객체를 다루기 위해 등장한것이 Optional이다. 

## Optional 효과
- NPE를 유발할수있는 null을 직접 다루지 않아도 된다
- 수고롭게 null을 직접 체크하지 않아도 된다
- 명시적으로 해당 변수가 null일수있다는 가능성을 표현할수있다. (불필요한 방어로직을 줄일 수 있다)

## Optional 사용법
```
Optional<Member> optMember;
```
제네릭을 제공하므로 변수선언시 명기한 타입 파라미터에 따라 감쌀수있는 객체의 타입이 결정된다. 

### Optional 객체 생성
#### Optional.empty()
null을 담고있는, 한마디로 비어있는 Optional 객체를 가져온다

#### Optional.of(value)
null이 아닌 객체를 담는 Optional 객체를 생성. value에 null이 들어올경우 NPE를 던진다

#### Optional.ofNullable(value)
null인지 아닌지 확신할수없는 객체를 담는 Optional 객체를 생성.

### Optional 객체 접근
#### get()
비어있는 Optional객체에대해 NoSuchElementException을 던짐
#### orElse(T other)
비어있는 Optional객체에 대해 넘어온 인자를 반환
#### orElseGet(Supplier<? extends T> other)
비어있는 Optional 객체에 대해서, 넘어온 함수형 인자를 통해 생성된 객체를 반환
#### orElseThrow(Supplier<? extends X> exceptionSupplier)
비어있는 Optional 객체에 대해서, 넘어온 함수형 인자를 통해 생성된 예외를 반환


> 출처 http://www.daleseo.com/java8-optional-after/