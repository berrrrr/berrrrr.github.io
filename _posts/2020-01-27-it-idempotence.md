---
layout: post
title: IT에서 의미하는 멱등성이란?
subtitle: IT에서 의미하는 멱등성이란?
categories: programming
tags: tips
comments: true
---

# IT에서 의미하는 멱등성이란?
수학이나 전산학에서 연산을 여러 번 적용하더라도 결과가 달라지지 않는 성질을 의미한다.  
그렇다면 IT업계에서 이야기하는 멱등은 구체적으로 어떤것이 있을까?  
가장  대표적인 예로 HTTP 메소드가 있다.  
GET, PUT, DELETE는 같은 경로로 여러번 사용해도 결과가 같다.  
하지만 POST같은 경우는 새로운 데이터가 생성되는 것이기 때문에 멱등이아니다.  