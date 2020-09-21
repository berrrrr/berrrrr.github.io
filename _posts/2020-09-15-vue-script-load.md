---
layout: post
title: vue에서 외부 라이브러리 import하기
subtitle: vue에서 외부 라이브러리 import하기
categories: programming
tags: frontend
comments: true
---

vue에서 외부 라이브러리 import하기


cdn으로 제공되는 외부라이브러리 import하기

## index.html 에서 로드하기 

그냥 index.html 에서 script import한다.
```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

## 외부 라이브러리 load해주는 플러그인 install 
그 외에 그냥 해당 컴포넌트에서만 라이브러리를 로드하고싶다면?   
뭐 여러 방법이 있는거같은데 나는 아래 플러그인설치하는 방식으로 함
```
npm install --save vue-plugin-load-script
```
https://www.npmjs.com/package/vue-plugin-load-script

요기서 확인 가능 

## 외부 라이브러리 로드
index.js  
```
  import LoadScript from 'vue-plugin-load-script';
 
  Vue.use(LoadScript);

```

```
// local files
// you have to put your scripts into the public folder. 
// that way webpack simply copy these files as it is.
Vue.loadScript("/js/jquery-2.2.4.min.js")

// cdn
Vue.loadScript("https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY")
```
이렇게해도되고

```
this.$loadScript("https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY")
    .then(() => {
      // Script is loaded, do something
    })
    .catch(() => {
      // Failed to fetch script
    });
```