---
layout: post
title: OAuth 1.0 과 OAuth 2.0 차이점
subtitle: OAuth 1.0 과 OAuth 2.0 차이점
categories: programming
tags: spring
comments: true
---

OAuth 1.0 과 OAuth 2.0 의 차이에 대해서 알아보자. 

## 1.간단해짐
JWT Bearer 토큰 인증방식을 사용하여 signature가 필요없어져서 간단해짐

## 2. 인증방법이 다양해짐
HMAC 암호화만 사용하던 1.0과는 다르게 여러가지 인증방시글 제공하여 시나리오, 브라우저별로 대응할수있다.

## 3. 대형서비스로의 확장성이 열려있다.
커다란 서비스를 하기 위해서는 인증서버 분리, 인증서버 다중화가 되어야한다. 2.0은 인증부분을 확실히 다른 부분으로 분리함으로써 인증서버가 다중화될수있게 되었다.
