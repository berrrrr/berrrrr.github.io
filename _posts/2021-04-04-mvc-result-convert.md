---
layout: post
title: "MvcResult를 원하는 객체로 바꾸기"
subtitle: "MvcResult를 원하는 객체로 바꾸기"
categories: programming
tags: test
comments: true
---

MvcResult를 원하는 객체로 바꾸기

## Object 형식

```java
public static <T> T convert(MvcResult result, Class<T> clazz) throws Exception {
        return new ObjectMapper().readValue(result.getResponse().getContentAsString(), clazz);
    }
```

사용예시

```java
Integer resultCount = TestUtil.convert(result, Integer.class);
```

## List 형식

```java
public static <T> T convert(MvcResult result, TypeReference typeReference) throws Exception {
        return (T) new ObjectMapper().readValue(result.getResponse().getContentAsString(), typeReference);
    }
```

사용예시 

```java
List<Event> events = TestUtil.convert(result, new TypeReference<List<Event>>() {});
```

일케 유틸로 만들어놓으면 검증할때 위 메소드 써서 변형해주면 assert문으로 결과비교가 쉽다~