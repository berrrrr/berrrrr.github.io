---
layout: post
title: springboot build 속도 향상시키는법 
subtitle: springboot build 속도 향상시키는법 
categories: programming
tags: spring
comments: true
---

springboot build 속도 향상시키는법  

host파일에 127.0.0.1 , ::1 등 로컬호스트의 alias에 자신의 hostname을추가해준다

ex) 내 hostname이  localhost MacBookPro.local 면

```
127.0.0.1       localhost MacBookPro.local
255.255.255.255 broadcasthost
::1             localhost MacBookPro.local
```

로 변경해준다.

참고로 hostname은 terminal에 `hostname` 치면 나옴.  