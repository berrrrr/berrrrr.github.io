---
layout: post
title: '[Effective java] item11. equals를 재정의하면 hashCode도 재정의해라'
subtitle: '[Effective java] item11. equals를 재정의하면 hashCode도 재정의해라'
categories: programming
tags: java
comments: true
---

equals를 재정의한 클래스 모두에서 hashCode도 재정의해야함. 그렇지않으면 hashCode 일반규약을 어기게되어 HashMap이나 HashSet 의 원소로 사용할때 문제가될수있음. 

## Object 내 hashcode 관련 규약
- 애플리케이션이 실행되는 동안 그 객체의 hashCode는 항상 일관되게 같은값을 반환해야함
- equals가 두 객체를 같다고 판단했다면 두 객체의 hashCode는 같아야함
- equals가 두 객체를 다르다고 판단했다면 다른값이어야 해시테이블의 성능이 좋아짐. (hashcode한계때문에 항상 다를순없음. 해쉬값이 같으면 linked list 뒤져서 찾아야해서 성능이 떨어짐. )

## 올바른 hashCode 예시
areaCode, prefix, lineNum을 핵심필드로 가지는 PhoneNumber 객체의 hashCode 생성 코드를 짜보자.

```java

public Class PhoneNumber(){
    int areaCode;
    int prefix;
    int lineNum;

    @Override
    public int hashCode(){
        int result = Short.hashCode(areaCode);
        result = 31 * result + Short.hashCode(prefix);
        result = 31 * result + Short.hashCode(lineNum);
        return result;
    }
}

```

이렇게하면 같은 phone number를 가지는 인스턴스는 같은 hashcode를 리턴하는 올바른 hashCode 메소드가 완성됨.  

더 쉬운 방법으로는 Object 클래스에서 임의의 개수만큼 객체를 받아 해시코드를 계산해주는 `hash` 메소드를 사용하는것

```java

public Class PhoneNumber(){
    int areaCode;
    int prefix;
    int lineNum;

    @Override
    public int hashCode(){
        return Objects.hash(lineNum, prefix, areaCode);
    }
}

```
대신 속도는 더 느리다. 

## 주의사항
- 성능을 높인답시고 해시코드를 계산할때 핵심필드를 생략해서는 안됨. 해시 품질이 나빠져서 해시테이블 성능이 떨어질수있음.
- hashCode가 반환하는 값의 생성규칙을 API 사용자에게 자세히 공표하면 안됨. 그래야 클라이언트가 이 값에 의지하지않고 자유롭게 계산방식을 바꿀수있음. 