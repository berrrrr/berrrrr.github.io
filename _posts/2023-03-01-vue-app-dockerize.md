---
layout: post
title: "[Vue] DOM에 이름달기"
subtitle: "[Vue] DOM에 이름달기"
categories: programming
tags: frontend
comments: true
---

💡 프론트에 vue app 만 단독으로 띄울경우 nginx를 사용해 띄워줘야함

아래와 같이 도커파일을 작성하면 된다

```bash
# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

[https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html](https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html)