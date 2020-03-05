---
layout: post
title: window서버에서 D드라이브가 갑자기 사라진 경우
subtitle: window서버에서 D드라이브가 갑자기 사라진 경우
categories: programming
tags: tips
comments: true
---

## window서버에서 D드라이브가 갑자기 사라진 경우

 window서버에서 D드라이브(혹은 원래 마운트되어있던 드라이브)가 갑자기 사라진 경우가 있다.  

 ## 원인

 가상화환경인 윈도우서버에서 특정조건을 만족하면 생기는 버그

 ## 해결방법
 
 `cmd+r` (실행) + diskmgmt.msc (디스크관리)  
 들어가면 오프라인인 디스크가 있음.  
 오른클릭하여 온라인으로 띄워주면 됨.   
 한번이라도 이런 현상이 일어나면, 다시 재연되지 않음.  