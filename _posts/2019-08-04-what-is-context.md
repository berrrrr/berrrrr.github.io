---
layout: post
title: context란 무엇인가
subtitle: context란 무엇인가
categories: programming
tags: spring
comments: true
---
context란 무엇인가


## context 란?
- 어떤 객체를 핸들링하기 위한 접근 수단  
예 ) print를 하기 위해서는 printContext를 사용해야하고 Servlet을 수행하기 위해서는 Servlet Context를 사용해야함. 

## web.xml
web.xml에서 ContextLoaderListener (root-context) 와 DispatcherServlet(servlet-context) 생성.

## Root Application Context 
- 전체 계층구조에서 최상단에 위치한 컨텍스트
- 서로 다른 서블릿 컨텍스트에서 공유해야하는 Bean들을 등록해놓고 사용할 수 있다.  
- 이 context에 등록되는 모든 bean은 모든 context에서 사용 가능
- 웹 어플리케이션 전체에 적용해야하는 기능 ex)DB 연결, 로깅기능 등에 이용
- Servlet Context에 등록된 Bean 이용 불가능!
- Servlet Context와 동일한 Bean이 있을 경우 Servlet Context Bean이 우선된다.
- 하나의 컨텍스트에 정의된 AOP 설정은 다른 컨텍스트의 빈에는 영향을 미치지 않는다.
```
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath*:spring/context-*.xml</param-value>
    </context-param>
```

## Servlet Context
- 서블릿에서만 이용되는 컨텍스트
- 이 context에 등록되는 bean들은 servlet context에서만 사용 가능
- 타 서블릿과 공유하기 위한 Bean들은 루트 웹 어플리케이션 컨텍스트에 등록해놓고 사용해야 한다
- DispatcherServlet은 자신만의 컨텍스트를 생성,초기화하고 동시에 루트 어플리케이션 컨텍스트를 찾아서 자신의 부모 컨텍스트로 사용

```
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>listings</param-name>
            <param-value>false</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
```