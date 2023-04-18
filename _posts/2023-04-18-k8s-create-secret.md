---
layout: post
title: "[k8s] secret을 생성하는 여러가지 방법"
subtitle: "[k8s] secret을 생성하는 여러가지 방법"
categories: programming
tags: devops
comments: true
---

k8s에서 db비밀번호 등 감춰야할 환경변수를 사용해야하는경우에는 secret을 생성하여 import하여 쓰게된다  
이러한 secret을 생성하는 방법에는 여러가지가 있는데 하나씩 살펴보자

## yaml파일로 생성

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  USER_NAME: YWRtaW4=
  PASSWORD: MWYyZDFlMmU2N2Rm
```

## literal로 생성하고싶다면?

```bash
kubectl create secret generic test-db-secret --from-literal=username=testuser --from-literal=password=iluvtests
# 특수문자 들어가게하려면 ' (single quote)로 감싸서 
kubectl create secret generic dev-db-secret --from-literal=username=devuser --from-literal=password='S!B\*d$zDsb='
```

→ 이러면 os.env로 username, password를 가져와서 쓸수있다 

## json 파일로 생성하고싶다면?

```bash
kubectl create secret generic secret-from-json --from-file=./json-for-secret.json
```

### volume mount로 secret key 가져다쓰기

파일로 키생성

```bash
kubectl create secret generic sa-json-secret --from-file=./sa_credentials.json
```

volume mount

```yaml
[...]
spec:
  containers:
  - name: my-container
    volumeMounts:
    - name: service-account-credentials-volume
      mountPath: /etc/gcp
      readOnly: true
[...]
  volumes:
  - name: sa-credentials-volume
    secret:
      secretName: sa-json-secret
      items:
      - key: sa_json
        path: sa_credentials.json
```

환경변수 설정

```yaml
[...]
spec:
  containers:
  - name: my-container
    env:
    - name: GOOGLE_APPLICATION_CREDENTIALS
      value: /etc/gcp/sa_credentials.json
```

> [https://kubernetes.io/docs/concepts/configuration/secret/](https://kubernetes.io/docs/concepts/configuration/secret/)
[https://stackoverflow.com/questions/47021469/how-to-set-google-application-credentials-on-gke-running-through-kubernetes](https://stackoverflow.com/questions/47021469/how-to-set-google-application-credentials-on-gke-running-through-kubernetes)
>