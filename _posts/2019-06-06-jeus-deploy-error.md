---
layout: post
title: Jeus 배포시 deploy application failed에러
subtitle: Jeus 배포시 deploy application failed에러
categories: programming
tags: infra
comments: true
---

### Jeus 배포시 에러

## 문제점 및 에러 메세지

Jeus에 war파일 upload 시도시 에러 

deploy the application for the application [app명] failed. : Failed to distribute the application [app명] in some target servers.  
{서버명} : Distributing failed; java.lang.ClassNotFoundException: org.springframework.beans.factory.BeanCreationException.

## 발생원인 

War가 잘못 말아진 경우

## 해결방법

1. War로 압축할 프로젝트의 dependency 를 다시 확인하고 해당하는 프로젝트들을 maven clean > maven install 재시도
2. 최종 프로젝트에서 target > WEB_INF > classes 와 lib 안에 정상적으로 mapper 및 의존 프로젝트들이 같이 말렸는지 확인 
