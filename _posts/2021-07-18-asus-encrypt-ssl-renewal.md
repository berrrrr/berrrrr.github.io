---
layout: post
title: "asus공유기 let's encrypt 인증서 수동갱신하기"
subtitle: "asus공유기 let's encrypt 인증서 수동갱신하기"
categories: etc
tags: etc
comments: true
---

asus 공유기를 사용하면서 let's encrypt 갱신서를 사용한다면 3개월마다 갱신을 해줘야한다

근데 포트포워딩등 80포트를 순정상태로 안두고 커스텀해두면 자동갱신이 안되기때문에 수동갱신을 해줘야한다

수동갱신은 asus 공유기 ssh로 접속한뒤 
```sh
ssh admin@공유기ip 
/sbin/le_acme  command
```

커맨드를 쳐주면 된다~ 
ssh접속은 윈도우에서는 putty로 접속하면됨~ 

> 출처 : https://www.clien.net/service/board/cm_nas/13652501  