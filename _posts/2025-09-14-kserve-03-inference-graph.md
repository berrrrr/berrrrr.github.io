---
layout: post
title: "[KServe] 03. Inference Graph"
subtitle: "[KServe] 03. Inference Graph"
categories: programming
tags: mlops
comments: true
---

> **KServe 시리즈**의 글입니다.

> 모델 서빙이 다단계로 이루어지는 경우도 많음. KServe에서는 요런식으로 추론 그래프(=추론 파이프라인)을 구성하여 배포할 수 있도록 지원함


### Inference Graph

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/kserve-03-inference-graph/01.png?raw=true)

여러 Inference Service를 엮어서 복잡한 파이프라인을 만들 수 있다

#### Sequenece

순서대로 실행하는 파이프라인 제공

#### Switch

조건에 따라 분기할 수 있는 파이프라인 제공

#### Ensamble

앙상블(여러모델을 합쳐서 추론) 기능 제공

#### Splitter

input 을 일정 비율로 나눠서 추론하는 기능 제공

### DAG

아래와 같은 방식으로 DAG(Directed Acyclic Graph)를 작성할 수 있다

```yaml
apiVersion: "serving.kserve.io/v1beta1"
kind: "InferenceService"
metadata:
  name: "cat-dog-classifier"
spec:
  predictor:
    pytorch:
      resources:
        requests:
          cpu: 100m
      storageUri: gs://kfserving-examples/models/torchserve/cat_dog_classification
---
apiVersion: "serving.kserve.io/v1beta1"
kind: "InferenceService"
metadata:
  name: "dog-breed-classifier"
spec:
  predictor:
    pytorch:
      resources:
        requests:
          cpu: 100m
      storageUri: gs://kfserving-examples/models/torchserve/dog_breed_classification
---
apiVersion: "serving.kserve.io/v1alpha1"
kind: "InferenceGraph"
metadata:
  name: "dog-breed-pipeline"
spec:
  nodes:
    root:
      routerType: Sequence
      steps:
      - serviceName: cat-dog-classifier
        name: cat_dog_classifier # step name
      - serviceName: dog-breed-classifier
        name: dog_breed_classifier
        data: $request
        condition: "[@this].#(predictions.0==\"dog\")"
```
