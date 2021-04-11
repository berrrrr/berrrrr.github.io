---
layout: post
title: "[k8s] kubernetes resource template - yaml 파일 작성법"
subtitle: "[k8s] kubernetes resource template - yaml 파일 작성법"
categories: programming
tags: infra
comments: true
---

우리가 k8s 환경에 배포할때 작성하는 kubernetes resource 템플릿파일.yaml 을 작성하는 방법에 대해 알아보자.

# Kubernetes 기본개념
yaml 파일을 이해하기 위해 필요한 Kubernetes(이하 k8s) 의 개본개념을 간단히 알아보자.

- namespace : cluster 내부를 논리적인 단위로 구분.
- pod : k8s 컨테이너가 실행되는 최소단위 
- controller : pod를 관리하는 역할
- service : pod에 고정된 주소로 접근할수 있게 하는 역할
- ingress : kubernetes 클러스터 외부에서 클러스터 내부 pod로 서비스 접근할때 사용

# Kubernetes Object
k8s object란 클러스터의 상태를 나타내는 객체이다. 다음과 같은 내용을 포함한다

어떤 컨테이너화된 어플리케이션이, 어디에서 동작중인지  
그 어플리케이션이 어떤 리소스를 사용하는지  
어플리케이션 동작에 대한 정책 (재구동, 업그레이드 정책 등등)  
우리가 기술하는 yaml 파일은 우리가 사용할 k8s object의 spec과 status를 기술하여 k8s에게 알려주는것이다.  

## Kubernetes API
생성이든, 수정이든, 또는 삭제든 쿠버네티스 오브젝트를 동작시키려면, [쿠버네티스 API](https://kubernetes.io/ko/docs/concepts/overview/kubernetes-api/를 이용해야 한다.  우리가 사용하는 kubectl CLI도 실제로는 쿠버네티스 API를 호출하여 동작한다.  
yaml 파일을 기술할때도 어떤 api를 사용할지 명시해주어야할것이다.  

## Kubernetes Object 기술하기
우리는 k8s 에게 우리가 어떤 k8s object를 사용할것인지 yaml 파일로 기술하여서 k8s에게 알려주고, k8s가 기술된 정의대로 object를 생성하도록 한다.  

예시)  
```yaml
apiVersion: apps/v1beta2
kind: Deployment
metadata:
  name: python-sample-deployment
  namespace: default
spec:
  selector:
    matchLabels:
      app: python-sample-app
  replicas: 1
  template:
    metadata:
      labels:
        app: python-sample-app
    spec:
      containers:
      - name: python-sample
        image: dockerimage주소:태그
        imagePullPolicy: IfNotPresent
        resources:
          requests:
            cpu: 500m
            memory: 200Mi
        ports:
        - containerPort: 8000
```
yaml 파일에 기술하는 옵션은 사용하고자하는 k8s object 종류마다 다르지만, 아래 4개 옵션은 모든 k8s 리소스 정의의 상위수준에 공통으로 존재한다.

**apiVersion**  
이 오브젝트를 생성하기 위해 사용할 쿠버네티스 API 버전을 명세. 특정 k8s object를 사용하기 위해 어떤 API를 사용해야하는지는 공식문서에 잘 나와있다.  

**kind**   
어떤 종류의 오브젝트를 생성하고자 하는지. 생성할 k8s object 타입. (ex. Deployment, Pod, Service ...)  

**metadata**  
오브젝트에 이름을 부여. 오브젝트를 유일하게 구분지어 줄 데이터  

- name : 동일한 namespace 상에서 유일한값
- labels : 특정 k8s object만 나열하거나 검색할때 유용하게 쓰이는 key-value쌍.
- spec : 생설할 오브젝트의 구체적인 내용을 정의하는 spec. spec에 대한 포맷은 k8s object 종류마다 다르다. 전체 object의 spec은 공식문서 참고.  
자주 사용되는 spec 항목들을 정리해보자.
  - containers : pod에는 1개 이상의 container 포함 가능. containers에 원하는만큼 container 정의해서 넣으면됨
  - image : pull 받아올 docker 이미지 주소
  - replicas : 원하는 pod 갯수 정의
  - selector : controller가 어떤 pod를 감시해야하는지.
  - template : 새 pod를 런칭하는데 사용할 템플릿. selectors의 값이 template의 labels과 일치해야 관리되는 파드를 제대로 선택.


## 자주 사용되는 Kubernetes Object
자주 사용되는 k8s object 종류와 yaml을 알아보자.

### Deployment
Deployment는 코드배포를 세밀하게 제어할수있는 오브젝트. pod 복제, 배포 일시중지, 재개 및 롤백 가능.  
아래와 같은 형식의 yaml로 생성된다.  
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: category-demo
  namespace: default
spec:
  selector:
    matchLabels:
      app: category-demo
  replicas: 2
  revisionHistoryLimit: 1
  template:
    metadata:
      labels:
        app: category-demo
    spec:
      containers:
        - name: category-demo
          image: dockerimage주소:태그
          imagePullPolicy: Always
          resources:
            requests:
              cpu: 500m
              memory: 200Mi
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: dev
```
참고문서 > [Deployment v1 app](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.17/#deployment-v1-apps)

### Service
k8s에 다양한 어플리케이션을 올리고 어플리케이션간 통신이 필요한 경우 Service로 오픈하여 외부에 오픈하거나 다른 어플리케이션 간 통신에 활용 할 수 있다.  
아래와 같은 형식의 yaml로 생성된다.  
```yaml
apiVersion: v1
kind: Service
metadata:
  name: category-demo-svc
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 8080
  selector:
    app: category-demo
```
참고문서 > [Service v1 core](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.17/#service-v1-core)



### Ingress
클러스터 내의 서비스에 대한 외부 접근을 관리하는 오브젝트이며, 일반적으로 HTTP를 관리함.   
아래와 같은 형식의 yaml로 생성된다.  
```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: category-demo-ingress
  namespace: default
  annotations:
    ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: 도메인주소
      http:
        paths:
          - path: /
            backend:
              serviceName: category-demo-svc
              servicePort: 80
```
참고문서 > [Ingress v1beta1 extensions](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.17/#ingress-v1beta1-extensions)

### Job
배치 오브젝트. 주기적으로 스케쥴링된 태스크를 수행할때 사용됨.  
아래와 같은 형식의 yaml로 생성된다.  
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  # Unique key of the Job instance
  name: example-job
spec:
  template:
    metadata:
      name: example-job
    spec:
      containers:
      - name: pi
        image: perl
        command: ["perl"]
        args: ["-Mbignum=bpi", "-wle", "print bpi(2000)"]
      # Do not restart containers after they exit
      restartPolicy: Never
```
참고문서 > [Job v1 batch](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.17/#job-v1-batch)