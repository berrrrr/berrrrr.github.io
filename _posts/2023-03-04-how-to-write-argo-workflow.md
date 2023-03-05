---
layout: post
title: "[Argo Workflow] Workflow 작성하기"
subtitle: "[Argo Workflow] Workflow 작성하기"
categories: programming
tags: devops
comments: true
---

💡 Argo Workflow에서 다양한 형태의 workflow를 작성하는 방법을 알아보자

## 1. Single Job

```yaml
# single-job.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-
  namespace: default
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    container:
      image: docker/whalesay
      command: [cowsay]
      args: ["hello world"]
      resources:
        limits:
          memory: 32Mi
          cpu: 100m
```

### 파라미터전달

```yaml
# param.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-parameters-
  namespace: default
spec:
  entrypoint: whalesay
  arguments:
    parameters: ###### job에 아래 args를 넘길게요
    - name: message
      value: hello world through param

  templates:
  ###############
  # entrypoint
  ###############
  - name: whalesay
    inputs:
      parameters: ###### 나는 이런 녀석들을 파라미터로 받아요
      - name: message 
    container:
      image: docker/whalesay
      command: [cowsay]
      args: ["{{inputs.parameters.message}}"] ###### message라는 파라미터를 사용할게요
```

## 2. Serial Step

간단한 **순차**실행은 step 으로, double dash `- -` 를 사용해 나타낸다. 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: serial-step-
  namespace: default
spec:
  entrypoint: hello-step
  templates:

  ###############
  # template job 템플릿
  ###############
  - name: whalesay
    inputs:
      parameters:
      - name: message
    container:
      image: docker/whalesay
      command: [cowsay]
      args: ["{{inputs.parameters.message}}"]

  ###############
  # entrypoint 엔트리포인트 
  ###############
  - name: hello-step
    # 순차 실행
    steps:  ##### step 으로 구분해요 
    - - name: hello1
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello1"
    - - name: hello2
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello2"
    - - name: hello3
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello3"
```

이렇게 정의하면 

hello1 → hello2 → hello3 

위 순서로 순차실행한다

## 3. Parallel Step

병렬실행은 single dash `-` 를 사용해 나타낸다 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: parallel-steps-
  namespace: default
spec:
  entrypoint: hello-step
  templates:

  ###############
  # template job
  ###############
  - name: whalesay
    inputs:
      parameters:
      - name: message
    container:
      image: docker/whalesay
      command: [cowsay]
      args: ["{{inputs.parameters.message}}"]

  ###############
  # entrypoint
  ###############
  - name: hello-step
    # 병렬 실행
    steps:  ##### step 으로 구분해요 
    - - name: hello1
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello1"
    - - name: hello2
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello2"
      - name: hello3        # 기존 double dash에서 single dash로 변경
        template: whalesay
        arguments:
          parameters:
          - name: message
            value: "hello3"
```

hello1 → hello2, hello3 

hello 1 → hello2 는 더블대쉬로 순차실행 

hello2, hello3 은 싱글대쉬로 병렬실행 

## 4. DAG

좀더 복잡한 순서는 DAG(Directed asyclic graph : 방향성 비순환 그래프)를 통해 나타낸다

간단한녀석들은 step으로 나타냈지만, 좀더 복잡한 (ex. 다이아몬드) workflow는 dag로 나타낸다 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: dag-diamond-
  namespace: default
spec:
  entrypoint: diamond
  templates:
  
  ###############
  # template job
  ###############
  - name: echo
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [echo, "{{inputs.parameters.message}}"]

  ###############
  # entrypoint
  ###############
  - name: diamond
    # DAG 구성
    dag:  ##### dag로 구분해요 
      tasks:
      - name: A
        template: echo
        arguments:
          parameters: [{name: message, value: A}]
      - name: B
	        dependencies: [A]  ##### dependency 를 나타내요 
        template: echo
        arguments:
          parameters: [{name: message, value: B}]
      - name: C
        dependencies: [A]
        template: echo
        arguments:
          parameters: [{name: message, value: C}]
      - name: D
        dependencies: [B, C]
        template: echo
        arguments:
          parameters: [{name: message, value: D}]
```

선행조건을 `dependencies` 에 표기한다. 디펜던시가 걸린 녀석들은 선행조건이 만족되고 나서야 실행된다

A → (B, C) → D (다이아몬드모양..;) workflow로 진행된다 

## 6. Exit Handling

종료시점에 특정작업을 수행하도록 종료작업 핸들링이 가능하다

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: error-handlers-
  namespace: default
spec:
  entrypoint: intentional-fail
  # 에러 핸들러 작업 지정
  onExit: error-handler ##### entrypoint 작업이 끝나면 자연히 이녀석이 실행돼요 

  templates:
  
  ###############
  # template job
  ###############
  - name: send-email
    container:
      image: alpine:latest
      command: [sh, -c]
      args: ["echo send e-mail: {{workflow.name}} {{workflow.status}}"]
  
  ###############
  # 종료 핸들러
  ###############
  - name: error-handler
    steps:
    - - name: notify
        template: send-email

  ###############
  # entrypoint
  ###############
  - name: intentional-fail
    container:
      image: alpine:latest
      command: [sh, -c]
      args: ["echo intentional failure; exit 1"]
```

## 7. Cron Workflow

workflow와 기본적으로는 동일한데, 스케쥴정보를 넣어 cron job을 돌릴수있다 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: CronWorkflow
metadata:
  name: test-cron-wf
spec:
  schedule: "* * * * *" #### 원하는 스케쥴(cron)을 작성
  concurrencyPolicy: "Replace"
  startingDeadlineSeconds: 0
  workflowSpec:
    entrypoint: whalesay
    templates:
    - name: whalesay
      container:
        image: alpine:3.6
        command: [sh, -c]
        args: ["date; sleep 90"]
```

cronWorkflow 전용 옵션은 다음과같이 있다 

| option name | default value | desc |
| --- | --- | --- |
| schedule | none | Schedule at which the Workflow will be run. E.g. 5 4 * * * |
| timezone | Machine timezone | Timezone during which the Workflow will be run from the IANA timezone standard, e.g. America/Los_Angeles, Asia/Seoul |
| suspend | false | if true Workflow scheduling will not occur. Can be set from the CLI, GitOps, or directly |
| concurrencyPolicy | Allow | Policy that determines what to do if multiple Workflow are scheduled at the same time. Available options: Allow, Replace, Forbid |
| startingDeadlineSeconds | 0 | Number of seconds after the last successful run during which a missed Workflowwill be run |
| successfulJobsHistoryLimit | 3 | Number of successful Workflows that will be persisted at a time |
| failedJobsHistoryLimit | 1 | Number of failed Workflow that will be persisted at a time |

> [https://github.com/bjpublic/core_kubernetes/tree/master/chapters/17](https://github.com/bjpublic/core_kubernetes/tree/master/chapters/17)
핵심만 콕! 쿠버네티스 
[https://argoproj.github.io/argo-workflows/cron-workflows/](https://argoproj.github.io/argo-workflows/cron-workflows/)
>