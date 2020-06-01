---
layout: post
title: '[Effective java] item49. 매개변수가 유효한지 검사하라'
subtitle: '[Effective java] item49. 매개변수가 유효한지 검사하라'
categories: programming
tags: java
comments: true
---

메서드와 생성자 대부분은 입력 매개변수의 값이 특정 조건을 만족하길 바람. (ex. 인덱스값은 음수여서는 안됨. 객체 참조는 null이 아니어야함. 등 )  
이러한 제약은 반드시 **문서화**해야하며 **메서드 몸체가 시작되기 전에 검사**해야함.  그래야 즉각적으로 깔끔하게 예외를 던질 수 있다.  

## public, protected method
public, protected method는 매개변수 값이 잘못 됐을 때 던지는 예외를 문서화해야함. (`@throws` 자바독 태그 사용)  
API 사용자가 제약을 지킬 가능성을 크게 높일 수 있음.  
자바7의 `java.util.Objects.requireNonNull` 메서드 사용하면 쉽게 null 검사 수행 가능. 
```
this.strategy = Objects.requireNonNull(strategy, "전략");
```

혹은 자바9의 `checkFromIndexSize`, `checkFromToIndex`, `checkIndex` 등도 null 검사에 쓸 수 있음.

## private method
공개되지않은 메서드면 개발자가 메서드 호출 상황 통제 가능.  
단언문 `assert` 를 사용해 매개변수 유효성을 검사할 수 있다. 

```
private static void sort(long a[]. int offset, int length){
    assert a != null;
    assert offset >= 0 && offset <= a.length;
    assert length >= 0 && length <= a.length - offset;
    ... // 계산 수행
}
```
assert문은 자신이 단언한 조건을 무조건 참이라고 선언.  
실패하면 AssertionError를 던진다.  
런타임에 아무런 효과, 성능저하도 없음.  

## 예외 케이스
메서드 몸체 실행 전에 꼭 유효성을 검사해야하는것은 아님. 
1. 유효성 검사 비용이 지나치게 높거나 실용적이지 않을때  
2. 계산 과정에서 암묵적으로 검사가 수행될때. (ex. Colloection.ssort(list) 메서드는 정렬수행하면서 객체타입을 검사함)  
이런 예외적인 상황에서는 안해도됨. 

## 예외번역
계산 과정에서 필요한 유효성검사가 이뤄지지만 실패했을때 잘못된 예외를 던질 수 있음.  
이럴땐 예외번역(exception translate) 관용구를 사용하여 API문서에 기재된 예외로 번역해줘야함. 


이번 아이템을 보고 "매개변수에 제약을 두는게 좋다"고 해석하면 안됨. 그 반대로, 메서드는 최대한 범용적으로 설계해야함. 제대로 돌아간다면 매개변수 제약은 적을수록 좋음.