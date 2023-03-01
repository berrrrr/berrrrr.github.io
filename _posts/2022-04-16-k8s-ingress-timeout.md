---
layout: post
title: "[k8s] ingress timeout 설정"
subtitle: "[k8s] ingress timeout 설정"
categories: programming
tags: devops
comments: true
---

💡 ingress에서 connection timeout 설정을 어떻게할지알아보자


metadata > annotations에 아래옵션을 넣어주면된다

```bash
    ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/send-timeout: "600"
```

예시yaml

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name:  demo-ingress
  namespace: default
  annotations:
    ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/send-timeout: "600"
spec:
  rules:
    - host: demo.page.com
      http:
        paths:
          - path: /
            backend:
              serviceName: demo-svc
              servicePort: 80
    - host: demo.page.com
      http:
        paths:
          - path: /
            backend:
              serviceName: demo-svc
              servicePort: 80
```

근데 찾아보면, 요청하는쪽일때. 즉 보내는(send)쪽일때의 타임아웃을 관장한다. 

요청받는쪽의 타임아웃은 보통 tomcat이나 server timeout을 설정해줘야한다.

server/tomcat timeout설정 참고