---
layout: post
title: "@Pathvariable 보안/특수문자"
subtitle: "@Pathvariable 보안/특수문자"
categories: programming
tags: spring
comments: true
---

## @PathVariable 보안 / 특수문자
@PathVariable에 특수문자를 포함해야하는경우와, @PathVariable로 XSS 시도를 막을수있는 방법에 대해 알아보자

## @PathVariable에 특수문자 넣기
```
@RequestMapping("/{path:.+}")
```
request mapping annotation을 쓸때 위와같이 정규식 형식으로 넣고 `:.+`를 넣어주면 특수문자까지 다 받을 수 있다. 

## @PathVariable 보안
보통 xss 필터를 쓴다.   
`web.xml`에 다음과 같이 XSS 필터 설정을 적용하면 URL을 통한 XSS 시도를 막을 수 있다. 
```
<filter> 
  <filter-name>XSSFilter</filter-name> 
  <filter-class>com.cj.xss.XSSFilter</filter-class> 
</filter>
```
```
<filter-mapping> 
  <filter-name>XSSFilter</filter-name> 
  <url-pattern>/*</url-pattern> 
</filter-mapping>
```