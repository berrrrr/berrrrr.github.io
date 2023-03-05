---
layout: post
title: "[Argo Events] webhook으로 각종 workflow실행하기"
subtitle: "[Argo Events] webhook으로 각종 workflow실행하기"
categories: programming
tags: devops
comments: true
---

아무래도 이벤트 소스로 가장 많이 사용될 녀석이 webhook 이지 않을까 싶다

웹훅을 걸어놓으면 어디서든 http request한번 날리면 쉽게 workflow를 실행할수있으므로.. 

## 1. webhook eventsource

우선 웹훅 이벤트소스를 만들어야한다. 기본적인 뼈대는 아래와 같다. 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
spec:
  service:
    ports:
      - port: 12000
        targetPort: 12000
  webhook:
    # event-source can run multiple HTTP servers. Simply define a unique port to start a new HTTP server
    example:
      # port to run HTTP server on
      port: "12000"
      # endpoint to listen to
      endpoint: /example
      # HTTP request method to allow. In this case, only POST requests are accepted
      method: POST
```

또한, 웹훅 이벤트 소스가 센서로 전달하는 데이터의 모양은 다음과 같다.

data부분을 보면, header와 body로 나눠서 데이터를 보내고 있으니 이를 활용하기 위해서는 반드시 참고할것. 

```yaml
{
        "context": {
          "type": "type_of_event_source",
          "specversion": "cloud_events_version",
          "source": "name_of_the_event_source",
          "id": "unique_event_id",
          "time": "event_time",
          "datacontenttype": "type_of_data",
          "subject": "name_of_the_configuration_within_event_source"
        },
        "data": {
          "header": {/* the headers from the request received by the event-source from the external entity */},
          "body": { /* the payload of the request received by the event-source from the external entity */},
        }
    }
```

## 2. webhook sensor

이제 엔드포인트웹훅(=이벤트소스)은 생성되었으니 그 웹훅이 어떤것을 실행할지에 대한 트리거와 센서를 만들어보자

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: webhook
spec:
  template:
    serviceAccountName: operate-workflow-sa
  dependencies:
    - name: test-dep
      eventSourceName: webhook
      eventName: example
  triggers:
    - template:
        name: webhook-workflow-trigger
        k8s:
          operation: create
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: webhook-
              spec:
                entrypoint: whalesay
                arguments:
                  parameters:
                  - name: message
                    # the value will get overridden by event payload from test-dep
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
                dataKey: body
              dest: spec.arguments.parameters.0.value
```

인제 요로코롬 api를 호출해주면 `whalesay` workflow가 트리거된다.

```json
curl -d '{"message":"this is my first webhook"}' -H "Content-Type: application/json" -X POST http://localhost:12000/example
```

### json body parsing

그런데 이때, body로 들어오는 값이 json이고 json의 특정 컬럼만 보내고싶다면? 

가령, 아래와같은 json을 웹훅의 body에 넣어서 전달한다고하자. 

```json
{"message1":"this is my first webhook", "message2":"test"}
```

여기서 message1에 들어있는 메세지만 전달하고싶다면?

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: webhook
spec:
  template:
    serviceAccountName: operate-workflow-sa
  dependencies:
    - name: test-dep
      eventSourceName: webhook
      eventName: example
  triggers:
    - template:
        name: webhook-workflow-trigger
        k8s:
          operation: create
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: webhook-
              spec:
                entrypoint: whalesay
                arguments:
                  parameters:
                    - name: message
                      # the value will get overridden by event payload from test-dep
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
                dataKey: body.message1
              dest: spec.arguments.parameters.0.value
```

요렇게하면 message1의 값만 전달이 된다. 

> [https://argoproj.github.io/argo-events/eventsources/setup/webhook/](https://argoproj.github.io/argo-events/eventsources/setup/webhook/)
>