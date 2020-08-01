---
layout: post
title: '[Effective java] item47. 반환타입으로는 스트림보다 컬렉션이 낫다'
subtitle: '[Effective java] item47. 반환타입으로는 스트림보다 컬렉션이 낫다'
categories: programming
tags: java
comments: true
---

## 시퀀스 리턴시  최고의 리턴 타입은? 
원소 시퀀스를 반환하는 API를 개발할 일이 생겼다면? 어떤타입을 반환하는 방법이 최선일까?  
당연히 **컬렉션**으로 반환하는것이 최선이다. 왜냐면 스트림으로 처리하기를 원하는 사용자와 반복으로 처리하길 원하는 사용자 모두를 다 만족시킬수 있으니까.  
스트림은 iterable인터페이스가 정의한 추상메서드들을 전부 포함하지만 extend하고있지 않고있어서 반복문을 사용할수는 없음. (나중에 java가 수정되서 스트림이 iterable 메서드들 사용할수있게되면 그때 되서나 stream을 반환하라고 저자가 권유하고있음)  
단, 만약 사용자가 Stream만 사용하길 원한다면 Stream을, Iterable만 사용하길 원한다면 Iterable만 반환해도 괜찮다.    

## 굳이 스트림으로 반복문을 쓰고싶다면?
`Stream<E>` 를 `Iterable<E>` 로 중개해주는 어댑터를 만들면됨. 
```java
public static <E> Iterable<E> iterableOf(Stream<E> stream){
    return stream::iterable;
}
```
근데 굳이 이걸 쓰면 너무 난잡하고 직관성이 떨어지므로 쓰지마시오. 

## 굳이 Iterable로 스트림을 쓰고싶다면?
마찬가지로 `Iterable<E>` 를 `Stream<E>` 로 중개해주는 어댑터를 만들면됨. 
```java
public static Iterable<E> streamOf(Iterable<E> iterable){
    return StreamSupport.stream(iterable.spliterator(), false);
}
```
마찬가지로 굳이 이걸 쓰면 너무 난잡하고 직관성이 떨어지므로 쓰지마시오. 

## 전용 시퀀스 개발이 필요할때도 있다.
반환할 시퀀스의 크기가 메모리에 올리기 꺼려질만큼 크지만 표현을 간결하게 할 수 있다면 전용 컬렉션을 구현하여 반환하는게 좋은 방법일 수 있다.  
예를들면 어떤 집합의 멱집합을 반환하는 인터페이스를 구현한다고할때, 멱집합 전부를 다 콜렉션에 올려서 반환할것인가? 만약 그렇다면 원소가 20개인 집합이 입력으로 들어오면 2^20 개를 반환해야함.. 이런경우는 아래와 같이 인덱스를 이진수로 표현하는 `AbstractList`를 이용한 전용 컬렉션을 반환하는게 최선일수있음.  
```java
public class PowerSet{
    public static final <E> Collection<Set<E>> of(Set<E> s){
        List<E> src = new ArrayList<>(s);
        return new AbstractList<Set<E>>(){
            @Override
            public int size(){
                return 1 << src.size(); // 원본집합의 2의 원소수의 거듭제곱을 의미 
            }
            @Override
            public boolean contains(Object o){
                return o instanceof Set && src.containsAll((Set)o);
            }
            @Override
            public Set<E> get(int index){
                Set<E> result = new HashSet<>();
                for(int i = 0; index != 0; i++, index >>= 1){
                    if ((index&1)==1)
                        result.add(src.get(i));
                }
                return result; 
            }
        }
    }
}
```
책 예시가 딱 이해가가진않는데 대충 {a,b,c} 집합이 들어오면 인덱스는 0-7, 이진수는 000-111 이니까 인덱스를 이진수로나타내서 각 n번째자리값이 각 자리 원소를 포함하는지 알려주는방식으로 멱집합을 표현하는 전용컬렉션임. (ex. {a,b}면 110, {a,c} 면 101로 표현해서 멱집합을 나타내는 방식)  

이런 전용컬렉션을 구현할때 주의할점은 `contains`함수와 `size`함수를 반드시 구현해야함. 이 두개를 구현하는게 불가능한 상황에서는 스트림이나 Iterable을 반환하는게 낫다.   
어쨌든 이런 전용 컬렉션을 구현하면 스트림보다 1.4배 (저자 컴퓨터기준)정도는 빨랐다고함. 그리고 어댑터는 스트림보다 2.3배(저자컴퓨터기준)느리다고함.  

## 결론
- 기본적으로는 컬렉션반환
- 컬렉션으로 반환이 어려운상황이면 전용컬렉션 반환
- 컬렉션 반환이 불가능한상황이면? Stream이나 Iterable 중 더 상황에 맞는거 반환 
