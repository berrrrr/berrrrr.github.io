---
layout: post
title: "Springboot swagger2 사용시 nginx proxy 환경에서도 정상동작하게 하는 방법"
subtitle: "Springboot swagger2 사용시 nginx proxy 환경에서도 정상동작하게 하는 방법"
categories: programming
tags: spring
comments: true
---

아래와 같이 nginx에 특정 /path으로 인입되면 localhost:{특정포트} 로 proxy 되도록하는 설정을 많이 사용하게된다. 그런데 이 설정을 사용했더니 swagger 가 정상적으로 뜨지 않는 현상이 발생 ㅠㅠ

삽질하다가 보니까 swagger가 사용하는 다양한 path들 전부 proxy 되도록 설정해줘야 swagger가 정상적으로 동작할수있다는 사실을 발견했다

아래와 같이 nginx conf의 location proxy 설정에 swagger가 사용하는 path를 전부 걸어주면된다.

```sh
location ~ ^/(swagger|webjars|configuration|swagger-resources|v2|csrf) {
               proxy_pass http://localhost:8081;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
}
```
