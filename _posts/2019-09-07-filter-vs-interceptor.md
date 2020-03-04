---
layout: post
title: filter 와 interceptor의 차이
subtitle: filter 와 interceptor의 차이
categories: programming
tags: spring
comments: true
---

서블릿의 filter와 spring의 interceptor는 어떠한 URI를 호출했을 때 해당 요청의 컨트롤러가 처리 되기 전 또는 후에 작업을 하기 위해 사용된다. 
![spring mvc execution flow2](https://justforchangesake.files.wordpress.com/2014/05/spring-request-lifecycle.jpg)
그러나 Spring mvc lifecycle 구조를 보면 알겠지만 둘은 차이점이 있다.

## Filter
필터는 dispatcherServlet 앞단에서 동작한다.  
J2EE표준 스펙에 있는 서블릿 기능의 일부이다.  
따라서 spring bean을 사용할 수 없다.  
문자열 인코딩과 같은 웹 전반에서 사용되는 기능이 보통 필터로 구현된다.

## Interceptor
Intercpetor는 dispatcherServlet 에서 Handler(Controller)로 가기 전에 동작한다.  
Spring framework에서 제공되는 기능이다.  
spring bean을 사용할 수 있다.   
클라이언트 요청과 관련이 있는 처리(로그인, 인증, 권한 등)가 보통 인터셉터로 구현된다.