---
layout: post
title: "[KServe] 01. Serving Runtime"
subtitle: "[KServe] 01. Serving Runtime"
categories: programming
tags: mlops
comments: true
---

{% raw %}

> **KServe 시리즈**의 글입니다.

> KServe에서 제공하는 서빙 환경을 제어하기 위해 띄우는 CRD 이다.


### Serving Runtime이란?

KServe에서는 Serving Runtime이라는 serving 환경을 제어하기위한 k8s CRD(Custom Resource Definition)로 ServingRuntime(namespace 범위), ClusterServingRuntimes(클러스터 범위) 두 가지를 제공함

```yaml
apiVersion: serving.kserve.io/v1alpha1
kind: ServingRuntime
metadata:
  name: example-runtime
spec:
  supportedModelFormats:
    - name: example-format
      version: "1"
      autoSelect: true
  containers:
    - name: kserve-container
      image: examplemodelserver:latest
      args:
        - --model_name={{.Name}}
        - --model_dir=/mnt/models
        - --http_port=8080
      env:
        - name: PREDICT_PROBA
          value: "True"
      resources:
          requests:
            cpu: 2
            memory: 4Gi
          limits:
            cpu: 4
            memory: 8Gi
```

요런 모양으로 생겼으며, 보기와 같이 env, request등 컨테이너에  필요한 펙 설정을 할 수 있다.

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: example-sklearn-isvc
spec:
  predictor:
    model:
      modelFormat:
        name: sklearn
      storageUri: s3://bucket/sklearn/model.joblib
      runtime: example-runtime # 생성한 Serving Runtime 이름을 입력
```

이런식으로 InferenceService를 띄울때 특정 ServingRuntime을 물고 띄울 수 있다.

### Spec Attribute

기본적으로 걍 k8s pod spec에 붙이는거  지원하는듯하다
거기에 더해서 model format에대한 새로운 attribute만 익히면 될듯함.
<table>
<colgroup>
<col width="250">
<col width="378">
</colgroup>
<tr>
<td>**Attribute**</td>
<td>**Description**</td>
</tr>
<tr>
<td>`multiModel`</td>
<td>Whether this ServingRuntime is ModelMesh-compatible and intended for multi-model usage (as opposed to KServe single-model serving). Defaults to false</td>
</tr>
<tr>
<td>`disabled`</td>
<td>Disables this runtime</td>
</tr>
<tr>
<td>`containers`</td>
<td>List of containers associated with the runtime</td>
</tr>
<tr>
<td>`containers[ ].image`</td>
<td>The container image for the current container</td>
</tr>
<tr>
<td>`containers[ ].command`</td>
<td>Executable command found in the provided image</td>
</tr>
<tr>
<td>`containers[ ].args`</td>
<td>List of command line arguments as strings</td>
</tr>
<tr>
<td>`containers[ ].resources`</td>
<td>Kubernetes [limits or requests](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits)</td>
</tr>
<tr>
<td>`containers[ ].env`</td>
<td>List of environment variables to pass to the container</td>
</tr>
<tr>
<td>`containers[ ].imagePullPolicy`</td>
<td>The container image pull policy</td>
</tr>
<tr>
<td>`containers[ ].workingDir`</td>
<td>The working directory for current container</td>
</tr>
<tr>
<td>`containers[ ].livenessProbe`</td>
<td>Probe for checking container liveness</td>
</tr>
<tr>
<td>`containers[ ].readinessProbe`</td>
<td>Probe for checking container readiness</td>
</tr>
<tr>
<td>`supportedModelFormats`</td>
<td>List of model types supported by the current runtime</td>
</tr>
<tr>
<td>`supportedModelFormats[ ].name`</td>
<td>Name of the model format</td>
</tr>
<tr>
<td>`supportedModelFormats[ ].version`</td>
<td>Version of the model format. Used in validating that a predictor is supported by a runtime. It is recommended to include only the major version here, for example "1" rather than "1.15.4"</td>
</tr>
<tr>
<td>`storageHelper.disabled`</td>
<td>Disables the storage helper</td>
</tr>
<tr>
<td>`nodeSelector`</td>
<td>Influence Kubernetes scheduling to [assign pods to nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)</td>
</tr>
<tr>
<td>`affinity`</td>
<td>Influence Kubernetes scheduling to [assign pods to nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)</td>
</tr>
<tr>
<td>`tolerations`</td>
<td>Allow pods to be scheduled onto nodes [with matching taints](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration)</td>
</tr>
</table>

{% endraw %}
