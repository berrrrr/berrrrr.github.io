---
layout: post
title: MybatisTest 에서 bind 실패시 에러
subtitle: MybatisTest 에서 bind 실패시 에러
categories: programming
tags: spring
comments: true
---

# @MybatisTest 에서 bind 실패시
mybatis 테스트코드 작성시 @MybatisTest 어노테이션을 붙였는데도 org.apache.ibatis.binding.BindingException: Invalid bound statement (not found) 라고 뜨며 에러가 날때.

## 원인
mapper xml을 제대로 못읽어와서그렇다

## 해결방법
아래 어노테이션으로 강제로 내가 설정했던 configuration을 import해주면된다.  
```
@ImportAutoConfiguration(DatabaseConfiguration.class)
```
겁나 해멨는데 중국개발자 github.io에서 방법을 찾았다. ㅠㅠ


>참고 https://taccisum.github.io/instantiationexception_on_mybatistest.html