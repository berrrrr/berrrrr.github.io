---
layout: post
title: github pages에 google analytics 추가하기
subtitle: github pages에 google analytics 추가하기
categories: etc
tags: blog
comments: true
---

github pages (github io)에 google analytics 추가하기

## config 수정
github에서 _config.yml 에서 analytics에 google 추가한다.

```
# Analytics
analytics:
  provider               : "google" 
  google:
    tracking_id          : "UA-141727711-2"
    anonymize_ip         : false 
```

## tracking id
tracking id는 https://analytics.google.com/ 에서 왼쪽 하단의 톱니바퀴모양을 클릭하여 `속성`을 추가했다면
해당 속성의 `속성정보`에 들어가면 tracking id(추적 id)를 확인할 수 있다.