---
layout: post
title: Spring Annotation 모음
subtitle: Spring Annotation 모음
categories: programming
tags: spring
comments: true
---

# Spring Annotation 모음
Spring Annotation 설명 모음

## @Controller
해당 클래스가 스프링MVC의 Controller임을 나타냄. 클래스를 컨트롤러로 동작하게함

## @RequestMapping(value ="/주소")
"/주소"를 호출하면 스프링 디스패쳐가 `@RequestMapping` 어노테이션과 동일한값의 메서드를 찾아서 실행. 즉 클라이언트에서 호출한 주소와 그것을 수행할 method를 연결하는 역할을 함.   
비슷한 친구들로 `@GetMapping(value="/주소")`,  `@PostMapping(value="/주소")`,  `@PutMapping(value="/주소")`,  `@DeleteMapping(value="/주소")` 등등이 있다. 

## @Service
해당 클래스가 스프링MVC의 Service임을 나타냄.

## @Configuration
설정역할을하는 클래스. 이 어노테이션이 달려있는 클래스는 우선 로딩된다. 

## @RestController
@Controller와 @ResponseBody 어노테이션을 합친 어노테이션. 해당 API의 응답 결과를 Web Response body 형식을 이용하여 보내줌. 일반적인 서버와 클라이언트의 통신에 JSON형식을 사용. 

## @RequestBody
POST method에 주로 사용. method의 parameter가 반드시 http 패킷의 body에 담겨있어야함.

## @RequestParam
GET method에 주로 사용. method의 parameter가 요청주소에 담겨있음. 