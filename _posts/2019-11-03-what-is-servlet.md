---
layout: post
title: Servlet이란?
subtitle: Servlet이란?
categories: programming
tags: spring
comments: true
---

Servlet은 JVM기반에서 웹 개발을 하기 위한 명세이자 API 이다. 자바를 실행하려면 JRE(Java Runtime Environment)가 필요한 것 처럼 서블릿을 실행하려면 web application container(WAS)가 필요하다.  
서블릿은 JAVA EE(Enterprise Edition)에 포함된 스펙 중 하나로 자바에서 http 요청과 응답을 처리하기 위한 내용들을 담고있다.

## Servlet 내부 동작 
서블릿은 자신만의 life cycle을 가지고 있고 WAS에서 context가 초기화되면 life cycle이 시작된다.  
Servlet Life Cycle은 초기화(initialize), 서비스(service), 소멸(destroy) 3단계로 구성되어있다.
### initialize
로드한 Servlet의 instance를 생성하고 resource를 로드하는 등 class 생성자의 초기하 작업과 동일한 역할을 수행한다. 

### service
client의 요청에 따라 호출할 method를 결정한다. 

### destroy
servlet이 unload된다. unload는 runtime exception이 발생하거나 servlet container가 종료되었을때 발생하는데 이때 serblet이 unload되어 servlet의 method 호출 결과가 정상적으로 표출되지 않는다.  

## Servlet 활용
HttpServlet class를 상속받아서 다음과 같은 Servlet 특성들을 활용할수있다.
### GET 요청 처리
Servlet에서는 doGet 메서드를 이용해 GET 메서드 방식의 요청을 응답받을 수 있다. 
### POST요청 처리
doPost 메서드를 사용해 POST 메서드 방식의 요청을 응답받을 수 있다. 
### Multipart
Multipart는 바이너리 데이터 전송을 위해 사용한다. 보통 파일 업로드/다운로드 기능을 위해 사용된다.
### filter 
요청에 대한 전처리 작업이 필요한경우 Filter를 사용한다. DOfILTER 메서드를 사용하면 필터가 서블릿보다 먼저 동작한다.
### Cookie
Coke는 사용자가 사이트를 방문했을 때 사용자의 컴퓨터에 저장되는 정보로 이름, 값, 유효시간, 도메인, 경로로 구성된다. 
### Session
session은 서버와 클라이언트의 유효한 커넥션을 식별하는 정보다. 서버는 클라이언트가 요청을 보내면 요청을 식별할수있는 ID를 부여하는데 이것이 session ID 이다. JSESSIONID라는 이름으로 쿠키로 저장되고 클라이언트가 재접속할때 쿠키를 이용해 세션ID값을 서버에 전달한다. javax.servlet.http패키지의 HttpSession 인터페이스로 정의되어있다.               