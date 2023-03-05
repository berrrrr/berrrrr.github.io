---
layout: post
title: "[Argo Events] Argo Events란?"
subtitle: "[Argo Events] Argo Events란?"
categories: programming
tags: devops
comments: true
---

💡 Argo events에 대한 개략적인 내용을 알아보자

## 1. Argo Events란?

webhook, s3, sqs 등 다양한 소스의 이벤트에서  k8s, workflows, 워크로드 등을 트리거하는 쿠버네티스용 이벤트기반 워크플로 자동화 프레임워크.

- 20개 이상의 event source 지원
- 사용자 지정 로직 설정 가능
- 단순한 선형 이벤트부터 복잡한 다중소스 이벤트까지 관리 가능
- k8s objects, argo workflow, aws lambda등을 트리거할수있음.
- [Cloud Events](https://cloudevents.io/) 지원
- 외부 event → event source (k8s용 이벤트) → eventbus, sensor (k8s용 event의 subscriber) → trigger → workflow 순서로 실행됨

## 2. 설치방법

1. argo-events 네임스페이스 생성
    
    ```bash
    kubectl create namespace argo-events
    ```
    
2. Argo Events SA, ClusterRoles, and Controller for Sensor, EventBus, and EventSource 배포
    
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install.yaml
    # Install with a validating admission controller
    kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install-validating-webhook.yaml
    ```
    

## 3. 컨셉 소개

![argo-events](https://argoproj.github.io/argo-events/assets/argo-events-architecture.png)

### 1) Event Source

외부 소스(ex. aws sqs, aws sns, gcp pubsub, webhook)같은 외부 소스의 이벤트를 소비하기위해 요구되는 configuration을 정의하는놈. 

한마디로 이벤트를 쓰는놈 (Write Events) 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: calendar
spec:
  calendar:
    example-with-interval:
      # 10초마다 이벤트를 생성하게됨 
      interval: 10s
```

제일 간단한놈으로만 예시를 가져왔는데, 위에서 언급한 다양한 이벤트소스 예제는 [여길](https://github.com/argoproj/argo-events/tree/master/examples/event-sources) 참조. 

### 2) Sensor

이벤트의 input(dependency)과 output(trigger)를 정의하는 놈. 

한마디로 이벤트를 읽는놈 (Read Events)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: calendar
spec:
  template:
    serviceAccountName: operate-workflow-sa
 # calendar 이벤트소스의 example-with-interval 이벤트를 구독하겠다 
 # 즉 이녀석은 10초에 한번씩 실행하게됨 
  dependencies:
    - name: test-dep
      eventSourceName: calendar
      eventName: example-with-interval
  triggers:
    - template:
        name: calendar-workflow-trigger
        k8s:
          operation: create
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: calendar-workflow-
              spec:
                entrypoint: whalesay
                arguments:
                  parameters:
                  - name: message
                    # value will get overridden by the event payload
                    value: hello world
                templates:
                - name: whalesay
                  inputs:
                    parameters:
                    - name: message
                  container:
                    image: docker/whalesay:latest
                    command: [cowsay]
                    args: ["{{inputs.parameters.message}}"]
          parameters:
            - src:
                dependencyName: test-dep
                dataKey: eventTime
              dest: spec.arguments.parameters.0.value
      retryStrategy:
        steps: 3
```

다양한 센서 예시는 [여기](https://github.com/argoproj/argo-events/tree/master/examples/sensors)를 참조. 

### 3) Event Bus

이벤트 소스와 센서를 연결하는 녀석임. NATS Jetstream으로 구성되어있다고함. (위 아키텍쳐 그림에는 NATS streaming 으로 써있는 이유는 옛날에는 그걸 썻따고함. 지금은 deprecated되고 jetstream으로 실행된다고함)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventBus
metadata:
  name: default
spec:
  nats:
    native:
      # 가능하면 3개 이상의 replica를 띄우라고함 
      replicas: 3
      # 인증 없거나 (none) 토큰으로 인증하거나 (token) 
      auth: token
```

그냥 jetstrem 띄우는녀석이라그런지 별 설정이 없다. 위 몇 줄로 된 놈을 띄워주면 된다. 

이벤트버스는 하나만 띄워주면, 이후에 내가 원하는 이벤트 소스와 센서를 마구 추가하며 놀면 된다. 

> [https://argoproj.github.io/argo-events/installation/](https://argoproj.github.io/argo-events/installation/)
[https://argoproj.github.io/argo-events/concepts/architecture/](https://argoproj.github.io/argo-events/concepts/architecture/)
>