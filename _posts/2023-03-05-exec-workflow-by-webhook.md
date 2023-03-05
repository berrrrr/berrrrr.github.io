---
layout: post
title: "[Argo Events] 이벤트소스에서 sqs메세지 가져오기"
subtitle: "[Argo Events] 이벤트소스에서 sqs메세지 가져오기"
categories: programming
tags: devops
comments: true
---

💡 aws sqs, kafka, aws sns, file, redis, webhook등 특정 이벤트소스로부터 이벤트가 발생했다면 거기서 메세지를 가져오고싶은게 인지상정. 이벤트소스가 aws sqs인 상황을 예시로, 어떤식으로 가져와서 활용하는지 알아보자


## 1.  event structure

먼저, 이벤트소스에서 어떤 형식으로 sensor에 데이터를 넘겨주는지 알아야한다. 이는 argo-events docs에 잘 나와있다. aws sqs 이벤트소스에서 보내주는 형식(=event structure)는 다음과 같다 

```json
{
    "context":
    {
        "type": "type_of_event_source",
        "specversion": "cloud_events_version",
        "source": "name_of_the_event_source",
        "id": "unique_event_id",
        "time": "event_time",
        "datacontenttype": "type_of_data",
        "subject": "name_of_the_configuration_within_event_source"
    },
    "data":
    {
        "messageId": "message id",
        "messageAttributes": "message attributes",
        "body": "Body is the message data"
    }
}
```

> [https://argoproj.github.io/argo-events/eventsources/setup/aws-sqs/](https://argoproj.github.io/argo-events/eventsources/setup/aws-sqs/)
> 

각 소스마다 조금씩 data 형태가 다르므로, 자신이 사용하는 이벤트소스의 event structure를 확인하고 trigger를 작성하는게 좋다. 

각 이벤트 소스별 event structure는 argo events docs > User Guide > EventSources > Setup 페이지에 나와있으니 참고하여 작성하자

## 2. parameterization

이제 내 이벤트소스가 보내는 형식을 알았다면 그걸 trigger에서 활용해야한다. 이를 docs에서는 trigger resource parameterization 이라고 칭하고있으므로 해당 페이지를 참고하자 

> [https://argoproj.github.io/argo-events/tutorials/02-parameterization/](https://argoproj.github.io/argo-events/tutorials/02-parameterization/)
> 

요약하자면, 아래와 같이 trigger > template > parameters 항목에서 event source로 부터 받은 데이터를 trigger가 실행하는 template에 넣어줄수있다. 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: sqs-sensor
spec:
  template:
    serviceAccountName: workflow-sensor
  dependencies:
    - name: message-polling
      eventSourceName: sqs-eventsource
      eventName: sqs-polling
  triggers:
    - template:
        name: sqs-workflow
        k8s:
          operation: create
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: aws-sqs-workflow-
              spec:
                entrypoint: whalesay
                arguments:
                  parameters:
                  - name: message
                    # 이부분은 아래 parameters에서 보낸 값으로 덮어써진다 
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
                dependencyName: message-polling
                dataKey: body
							# 템플릿의 spec > arguments > parameters > 0 > value에 이 값을 보내겠다
              dest: spec.arguments.parameters.0.value
```

템플릿의 하단을 보면 `triggers > template > parameters` 에서 `messege-polling` 이라는 이름으로 `sqs-eventsource` 이벤트소스에 의존성을 걸어서 이벤트소스로부터 받은 데이터를 가져오고있다

`dataKey` 라고 정의된부분이, 위 event structure의 data 항목을 받아오겠다는 뜻이다. 만약 context 항목을 받고자하면 `contextKey` 라고 정의해 준 뒤 받아오고자 하는 항목을 다시 정의해주면 된다 

걍 전체 다받고싶으면 dataKey나 contextKey 항목을 빼버리면 전체 데이터가 넘어온다. 

## 3. Json Format

sqs에서 body를 받아오게 시키면 자꾸 base64 인코딩된 값이 들어있어서 [이슈](https://github.com/argoproj/argo-events/issues/520)를 좀 뒤져보니 기본적으로는 그게 맞다고한다.. (kafka나 다른 이벤트소스들도 마찬가지)

반드시 이벤트소스에서 jsonBody 옵션을 true로 켜줘야.. 정상적으로 json형식으로 받으니 이부분 유의하자

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: sqs-sensor
spec:
  template:
    serviceAccountName: sqs-sensor-sa
  sqs:
    dunamuml-sqs-polling:
      region: "ap-northeast-2"
      queue: "queue-name"
      waitTimeSeconds: 20
      jsonBody: true # 이거 켜줘야함 
```

그리고 위 옵션 킨 상태에서 json 형식으로 메세지 보내지 않으면 애초에 이벤트소스가 감지하지 않는다. 

## 4. Filter

특정 이벤트만 받고자한다면 이런식으로 필터를 걸 수 있다 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: kafka
spec:
  kafka:
    example:
      url: kafka.argo-events:9092
      topic: topic-2
      jsonBody: true
      partition: "1"
      filter: # filter field 
        expression: "(body.id == 4) && (body.name != 'Joe')" #expression to be evaluated
      connectionBackoff:
        duration: 10s
        steps: 5
        factor: 2
        jitter: 0.2
```

> [https://argoproj.github.io/argo-events/eventsources/filtering/#fields](https://argoproj.github.io/argo-events/eventsources/filtering/#fields)
>