---
layout: post
title: '[Effective java] item12. toString을 항상 재정의하라'
subtitle: '[Effective java] item12. toString을 항상 재정의하라'
categories: programming
tags: java
comments: true
---

Object이 기본 toString 메서드는 보통 `클래스_이름@16진수 해시코드`  를 반환함. 그러나 toString 일반규약에 따르면 간결하면서도 사람이 읽기 쉬운 형태의 유익한 정보를 반환해야한다. 또한 **모든 하위 클래스에서 이 메서드를 재정의하라** 고 명시하고있다.  toString 메서드를 잘 재정의하면 println, assert, 디버거가 객체를 출력할 때 자동으로 불리므로 훨씬 사용하고 디버깅하기쉬워진다.  

실전에서 toString은 그 객체가 가진 주요정보를 모두 반환하는게 좋다. 포맷을 명시하고 의도를 같이 명시해주면 더 좋다.

```java

/**
    전화번호 문자열 표현을반환
    XXX-YYYY-ZZZZ 12글자로 구성
    XXX : 지역코드
    YYYY : prefix
    ZZZ : 가입자번호
*/
    @Override
    public String toString(){
        return String.format("%03d-%03d-%04d", areaCode, prefix, lineNum);
    }
```

포맷 명시 여부와 상관없이 toString이 반환한 값에 포함된 정보를 얻어올 수 있는 API를 제공하면 좋다. 

참고로 현업에서 제일 유용하게 쓰이는 toString 재정의방법은 객체를 JSON STYPE로 변환해서 리턴하는것같다.
```java
    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this, ToStringStyle.JSON_STYLE);
    }
```