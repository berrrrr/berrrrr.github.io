---
layout: post
title: "[k8s] nginx reload"
subtitle: "[k8s] nginx reload"
categories: programming
tags: infra
comments: true
---

💡 k8s내의 nginx를 reload하는방법을 알아보자

## nginx reload

1. `kubectl get all -n ingress-nginx` 로 nginx 파드 확인 
2. 인그레스에 bash shell 진입
    - `kubectl exec -it '인그레스 pod명' -n ingress-nginx bash`
3. nginx 버전 확인 `nginx -v`
4. nginx reload `nignx -s reload`

## ingress restart

아예 ingress controller 데몬셋을 재시작하면 nginx도 자동으로 리로드되므로.. 문제가없다면 아래와 같이 해도된다.

```bash
kubectl rollout restart ds ingress-nginx-controller -n ingress-nginx
```