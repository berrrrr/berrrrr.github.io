---
layout: post
title: "[Argo Workflow] 다른 template을 참조하기"
subtitle: "[Argo Workflow] 다른 template을 참조하기"
categories: programming
tags: devops
comments: true
---

argo workflow 에서는 `workflowtemplate` 이라는 개념이 있어서, 워크플로우상 공통되는부분은 템플릿화하여 공용으로 가져다 쓰게 구성할 수 있다. 
이걸 활용하는 방법을 자세히 알아보자 

## 1. WorkflowTemplate

workflowtemplate타입은 다른 workflow를 만들때 참조할수있다

(주의할점은, 이녀석은 namespace scope 이다!! 
cluster scope 템플릿은 아래에서 소개할 ClusterWorkflowTemplate 을 이용할수있다) 

가령 아래와 같이 `whalesay-template` 이라는 놈을 만들었다하자 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: workflow-template-submittable
spec:
  arguments:
    parameters:
      - name: message
        value: hello world
  templates:
    - name: whalesay-template
      inputs:
        parameters:
          - name: message
      container:
        image: docker/whalesay
        command: [cowsay]
        args: ["{{inputs.parameters.message}}"]
```

serial step에서 참조 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: workflow-template-hello-world-
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    steps:                              
      - - name: call-whalesay-template
          templateRef:                  
            name: workflow-template-1   
            template: whalesay-template 
          arguments:                    
            parameters:
            - name: message
              value: "hello world"
```

dag 에서 참조

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: workflow-template-hello-world-
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    dag:
      tasks:
        - name: call-whalesay-template
          templateRef:
            name: workflow-template-1
            template: whalesay-template
          arguments:
            parameters:
            - name: message
              value: "hello world"
```

이렇게 워크플로우 템플릿을 재활용할수있당.

이렇게 우리는 각종 task들을 미리 템플릿으로 정의해놓고,  템플릿을 퍼즐맞추듯 재활용 및 재구성해서 마음껏 사용할 수 있다. 

## 2. Cluster Workflow Template

이녀석은 cluster 단위 workflow template이다.

기본적인 workflow template은 namespace단위에서 사용가능한데,

cluster 단위(즉, 여러 네임스페이스)에서 template을 사용하고싶다면 cluster workflow template을 만들면된다. 

단, cluster admin권한이 있어야 만들 수 있다. 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ClusterWorkflowTemplate
metadata:
  name: cluster-workflow-template-submittable
spec:
  entryPoint: whalesay-template
  arguments:
    parameters:
      - name: message
        value: hello world
  templates:
    - name: whalesay-template
      inputs:
        parameters:
          - name: message
      container:
        image: docker/whalesay
        command: [cowsay]
        args: ["{{inputs.parameters.message}}"]
```

참고할때, 아래와 같이 `clusterScope: true` 값을 넣어줘야한다 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: cluster-workflow-template-hello-world-
spec:
  workflowTemplateRef:
    name: cluster-workflow-template-submittable
    clusterScope: true
```

> [https://argoproj.github.io/argo-workflows/workflow-templates/#referencing-other-workflowtemplates](https://argoproj.github.io/argo-workflows/workflow-templates/#referencing-other-workflowtemplates)
>