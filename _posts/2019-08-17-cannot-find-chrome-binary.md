---
layout: post
title: cannot find Chrome binary
subtitle: cannot find Chrome binary
categories: programming
tags: tips
comments: true
---

selenium.common.exceptions.WebDriverException: Message: unknown error: cannot find Chrome binary 에러가 나는 경우

## 발생원인
chrome binary가 안깔려있어서 그렇다

## 해결방법
chromium을 깔아주면 된다.

```
yum install chromium
```