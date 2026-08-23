---
layout: post
title: "[Frontend] .env로 환경별 빌드 설정 나누기"
subtitle: "[Frontend] .env로 환경별 빌드 설정 나누기"
categories: programming
tags: frontend
comments: true
---

[https://cli.vuejs.org/guide/mode-and-env.html#modes](https://cli.vuejs.org/guide/mode-and-env.html#modes)
기본적으로 이녀석을 참고.

설정파일들과 동일한 수준에 `env.local`, `env.development`, `env.production` 을 추가
이런식으로 설정파일에 각각 사용하고자하는 환경변수를 설정

```docker
VUE_APP_ENV = dev

# just a flag
ENV = 'development'

# base api
VUE_APP_BASE_API = 'https://test.example.com'

```


`package.json` 에서 환경별 build script 작성

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  // --mode {env} 변수를 넣어서 실행스크립트 작성
  "scripts": {
    "serve": "vue-cli-service serve --mode local",
    "build:dev": "vue-cli-service build --mode development --openssl-legacy-provider ",
    "build:prod": "vue-cli-service build --mode production --openssl-legacy-provider "
  },
  "dependencies": {
    "axios": "^1.6.8",
    "core-js": "^3.6.5",
    "vue": "^2.6.11",
    "vue-audio-recorder": "^3.0.1"
  },
  "devDependencies": {
    "@vue/cli-plugin-babel": "~4.5.9",
    "@vue/cli-plugin-eslint": "~4.5.9",
    "@vue/cli-service": "~4.5.9",
    "babel-eslint": "^10.1.0",
    "eslint": "^6.7.2",
    "eslint-plugin-vue": "^6.2.2",
    "vue-template-compiler": "^2.6.11"
  },
  "eslintConfig": {
    "root": true,
    "env": {
      "node": true
    },
    "extends": [
      "plugin:vue/essential",
      "eslint:recommended"
    ],
    "parserOptions": {
      "parser": "babel-eslint"
    },
    "rules": {}
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}

```


docker file에서 빌드를 다음과같이 환경변수별로 분리해줌

```docker
FROM registry.example.com/base/node:18 as build-stage

WORKDIR /app
COPY ./web ./web
WORKDIR /app/web
RUN npm install

ARG BUILD_ENV
RUN if [ "$BUILD_ENV" = "production" ] ; then npm run build:prod ; else npm run build:dev ; fi


FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/web/dist /usr/share/nginx/html
COPY ./web/nginx.conf /etc/nginx/
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

```


도커빌드할때 환경에따라 도커환경변수로  BUILD_ENV를 넣어주면되는데, github action을 사용한다면 다음과 같이 넣어줄수있다.

```yaml

      - name: Set Develop Env
        if: github.ref == 'refs/heads/develop' || github.base_ref == 'develop'
        run: |
          echo "BUILD_ENV=development" >> $GITHUB_ENV

      - name: Set Production Env
        if: github.ref == 'refs/heads/main' || github.base_ref == 'main'
        run: |
          echo "BUILD_ENV=production" >> $GITHUB_ENV

```
