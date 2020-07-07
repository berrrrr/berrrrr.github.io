---
layout: post
title: Parcel + Vue + Springboot 개발환경 구축하기 
subtitle: Parcel + Vue + Springboot 개발환경 구축하기 
categories: programming
tags: frontend
comments: true
---
Parcel + Vue + Springboot 세팅 관련 내용들을 정리해보자 


# 1. 세팅하기

## 1) 설치

### 1-1) node/npm설치

```bash
brew install node
```

node를 설치하면 npm도 함께 설치된다.

```bash
node -v
npm -v
```

위 명령어로 버전이 뜬다면 제대로 설치된것

### 1-2) package.json 설정

```bash
npm init -y
```

npm 이 잘 깔렸다면 이제 frontent 소스코드를 담을 폴더에 들어가서 위 명령어를 쳐서  package.json 파일을 만든다. 이 가이드에서는 `webapp` 폴더를 frontend소스코드 폴더라고 가정하겠다. 

### 1-3) parcel 설치

```bash
npm install -g parcel-bundler
```

 `webapp`폴더 안에서 위 명령어로 parcel을 설치한다. 

(parcel 관련 자세한 가이드는 [https://ko.parceljs.org/getting_started.html](https://ko.parceljs.org/getting_started.html) 페이지를 참고한다) 

npm으로 설치하다가 `gyp: No Xcode or CLT version detected!`  에러가 난다면? 아래 방법으로 해결하자. 

1. xcode 설치 경로 확인

    ```bash
    xcode-select --print-path

    ```

    아마 /Library/Developer/CommandLineTools 로 나타날것이다. 

2. xcode 제거

    ```bash
    sudo rm -r -f /Library/Developer/CommandLineTools
    ```

3. xcode 재설치 

    ```bash
    xcode-select --install
    ```

### 1-4) vue 설치

```bash
npm install --save vue
```

`webapp`폴더 안에서 위 명령어로 vue를 설치한다. 

## 2) 환경 설정

## 2-1) 진입페이지 생성

Parcel 은 어떤 유형의 파일이라도 진입점으로 취할 수 있지만 HTML 이나 JavaScript 파일이 제일 좋다. `webapp`폴더에 `index.html` 파일과 `index.js` 파일을 생성해준다. 

webapp/index.html

```html
<html>
<body>
  <script src="./index.js"></script>
</body>
</html>
```

webapp/src/js/index.js

```jsx
console.log('hello world')
```

## 2-2) build 설정

`package.json` 에서 빌드 스크립트를 변경할 수 있다. scripts 부분을 아래와 같이 변경하자. 

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "parcel index.html",
    "watch": "parcel watch index.html --no-source-maps --out-dir ../main/resources/static/ --public-url ./ --out-file index.html",
    "deploy": "parcel build index.html --no-source-maps --out-dir ../main/resources/static/ --public-url ./ --out-file index.html"
  }
```

scripts 에 설정한 명령어들은 `webapp` 폴더에서 아래와 같이 실행할 수 있다.

```bash
npm run test
npm run start
npm run watch
npm run deploy
```

- `watch`, `deploy` 명령어의 경우, parcel이 보고있는 index.html 파일의 빌드 결과를  `../main/resources/static` 밑에 `index.html` 파일로 떨구겠다는 뜻이므로 이를 참고해서 개발에 활용한다.
- `watch` 명령어는 parcel이 static 밑에 빌드한 파일을 계속 바라보면서 변경사항이 생기면 스스로 빌드해서 반영한다. 새로 빌드하지않아도 페이지에 바로바로 변경사항이 반영되는것을 확인할수있다.
- `deploy` 명령어는 지정한 위치에 빌드된 html, js파일을 떨군다. (실행할때마다 새 css와 js 파일을 떨굼.)

# 2. 개발하기

## 1) 메인앱

index.html 에 올라가게되는 기본 메인앱을 우선 만든다.

webapp/src/App.vue

```html
<template>
    <div id="app">
        <HelloWorld />
    </div>
</template>

<script>
    import HelloWorld from './components/HelloWorld';
    export default {
        name: "App",
        components: {
            HelloWorld
        }
    }
</script>

<style scoped>

</style>
```

## 2) 메인앱에 부착할 컴포넌트

vue의 장점은 여러 컴포넌트 조각을 import형식으로 끼워맞추며 개발할 수 있는것이다. (Single File Component)

App.vue에 작성한대로 HelloWorld.vue 컴포넌트를 만들어보자.

\webapp\src\components\Helloworld.vue

```html
<template>
    <div class="hello-world">
        <h1>Hello World!</h1>
    </div>
</template>

<script>
    export default {
        name: "helloworld"
    }
</script>

<style scoped>

</style>
```

## 3) 메인앱 부착

메인 html 에 메인앱(App.vue)를 부착한다.

\webapp\js\index.js

```jsx
import Vue from 'vue';

import App from '../App.vue';

new Vue({
    render: h => h(App)
}).$mount('#app')
```

## 4) 빌드

```bash
npm run start 
```

\webapp 폴더에서 위 명령어를 실행하면 빌드가되면서 [`http://localhost:1234`](http://localhost:1234/) 에서 개발한 뷰페이지를 확인할 수 있다.

```bash
npm run watch
npm run deploy
```

이 명령어는 위에서 설정한대로 `../main/resources/static` 위치에 빌드된 html과 js를 배포한다. 실제 웹앱에 해당하는 경로로 들어가서 뷰페이지를 확인할 수 있다. 

기본 패턴을 소개한거고 실제 개발은 위 패턴들을 응용해서 개발하면됨! 

# 3. 추천기능

vue에서 쓸만한 애들만 간략하게 소개해봄. 

## 1) axios

vue의 ajax라고 보면됨. 

[https://github.com/axios/axios](https://github.com/axios/axios)

```bash
npm install --save axios
```

tbd

## 2) VueRouter

새로고침없이 페이지 왔다리갔다리 가능하게해줌. 

[https://router.vuejs.org/kr/](https://router.vuejs.org/kr/)

```bash
npm install --save vue-router
```

tbd

## 3) VueBootstrap

Vue에 있는 Bootstrap. 디자인도 훌륭하고 기본적인 기능들이 다 미리 만들어져있음. (ex. 테이블에 odering, filtering 기능 다 옵션으로 구현되어있음) 

[https://bootstrap-vue.org/docs](https://bootstrap-vue.org/docs)

```bash
npm install  --save bootstrap-vue bootstrap bootstrap-icons
```

tbd