---
layout: post
title: DispatcherServlet이란?
subtitle: DispatcherServlet이란?
categories: programming
tags: spring
comments: true
---

# DispatcherServlet 란?
서버로 들어오는 모든 요청을 제일 앞에서 처리하는 Front Controller 역할. 
브라우저로부터 요청이 들어오면 가장 먼저 가로채서 handler mapping, hanlder adapter를 수행하는 Dispatcher Servlet에 대해 알아보자.

## WEB-INF
WEB-INF 폴더는 중요한 설정파일이 들어가는 폴더. 외부로부터 직접 접근 불가능. view 를 WEB-INF 아래에 두고 다른 방법으로 VIEW에 접근. dispatcher-servlet.xml 설정파일도 이 폴더 안에 들어감. 

## web.xml
client의 요청을 가장 먼저 처리하는곳. filter, contextConfigLocation (설정파일) 설정, dispatcher servlet 설정 등이 여기에 들어감. (servlet mapping이됨). 요청이 controller로 넘어가기 전에 dispatcherservlet이 요청을 가로채 핸들링하고 매핑하게됨. 

## dispatcher-servlet.xml
브라우저의 요청으로부터 그 요청을 처리할 controller를 이어줌. handler mapping, handler adapter 작업 수행.  
component-scan은 @Controller, @Repository, @Service, @Component 어노테이션이 붙은 class들을 scan하여 Bean으로 등록.

### Handler mapping(annotation-driven)
annotation-driven 설정으로 URL 매핑이 일어남. @RequestMapping을 사용할 수 있게되고 @RequestMapping이 지정된 URL 브라우저의 요청url이 매핑된다. 

### Handler Adapter
url 매핑되어 controller를 찾은 요청은 Handler Adapter에 의해 해당하는 method를 수행하게됨. Service를 수행한 Controller는 view를 반환함. 이는 다시 DispatcherServlet으로 넘어와 브라우저로 전달되어 view를 볼 수 있게됨.