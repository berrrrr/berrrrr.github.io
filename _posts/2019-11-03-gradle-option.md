---
layout: post
title: gradle 의존성 옵션들
subtitle: gradle 의존성 옵션들
categories: programming
tags: spring
comments: true
---

gradle에는 다음과 같은 다양한 의존성 옵션들이 존재한다.
- implementation
- api
- compileOnly
- runtimeOnly
- annotationProcessor
각각 어떤 특성을 가지는지 알아보자.

## impelmentation
의존 라이브러리 수정시 본 모듈까지만 재빌드. 본 모듈을 의존하는 모듈은 해당 라이브러리의 api를 사용할수없다.  
A(implementation) <- B <- C 의 경우 C에서 A 를 접근할수없고 A수정시 B까지만 재빌드

## api
의존 라이브러리 수정시 본 모듈을 의존하는 모든 모듈 재빌드. 본 모듈을 의존하는 모듈들도 해당 라이브러리의 api를 사용할수있다.  
A(api) <- B <- C 의 경우 C에서 A 를 접근할수있고 A수정시 C까지 모두 재빌드

## compileOnly
compile시에만 빌드하고 빌드 결과물에는 포함하지 않음. runtime시 필요없는 라이브러리인경우 (ex. runtime환경에 이미 라이브러리가 제공된다던가..) 사용됨

## runtimeOnly
runtime시에만 필요한 라이브러리인 경우

## annotationProcessor
주석처리기. 소스에 주석을 달기만하면 코드를 생성. 