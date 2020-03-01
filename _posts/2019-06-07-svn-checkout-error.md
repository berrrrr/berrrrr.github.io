---
layout: post
title: svn CHECKOUT can only be performed on a version resource 에러
subtitle: svn CHECKOUT can only be performed on a version resource 에러
categories: programming
tags: infra
comments: true
---

## svn commit 에러
Svn commit 시도 시 아래와 같은 에러 메시지가 뜸  
svn: E200007: CHECKOUT can only be performed on a version resource  

## 발생원인 
Svn과 Eclipse 간 connection bug

## 해결방법
Eclipse > project > Team > clean up 을 시도한다  
안되면 아래와 같이 해당 workspace에 가서 tortoise svn > clean up 을 해준다
