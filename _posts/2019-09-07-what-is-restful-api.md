---
layout: post
title: Restful API란?
subtitle: Restful API란?
categories: programming
tags: spring
comments: true
---

# Restful API란?
Restful API에 대해 알아보자

## REST 란 ? 
REpresentational State Transfer 의 약자.  
잘 표현된 HTTP URI로 리소스를 정의하고 HTTP method(POST.GET.PUT.DELETE)로 리소스에 대한 행위를 정의한다.

## 리소스
서비스를 제공하는 시스템의 자원. URI로 정의됨. REST API는 리소스의 자원을 표현해야함.  

## REST API의 URI 설계
1. URI는 명사를 사용한다.  
ex) GET /members

2. / (슬래시)로 계층관계를 나타낸다.  
ex) GET /dogs/jindo

3. URI의 마지막에는 슬래시를 사용하지 않음  

4. URI는 소문자로만 작성한다.  

5. 가독성을 높이기 위해 하이픈(-)은 사용해도 언더라인(_)는 사용하지 않는다.

## HTTP method
### GET 
Read. 해당 리소스를 조회한다
### POST
Create. 리소스를 생성한다.
### PUT
Update. 해당 리소스를 수정한다
### DELETE
Delete. 해당 리소스를 삭제한다. 
