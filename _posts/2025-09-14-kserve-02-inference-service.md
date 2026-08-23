---
layout: post
title: "[KServe] 02. Inference Service"
subtitle: "[KServe] 02. Inference Service"
categories: programming
tags: mlops
comments: true
---

> **KServe 시리즈**의 글입니다.

> KServe의 CRD중 하나로, 모델을 서빙하기 위해 띄우는 기본적인 리소스이다


### Installation

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: sklearn-iris
spec:
  predictor:
    model:
      modelFormat:
        name: sklearn
      storageUri: gs://kfserving-examples/models/sklearn/1.0/model
```

기본 모양은 위와 같다.
모델의 포맷과 해당 모델의 storage uri를 작성하면 알아서 서빙을 해주는 형식
저거 하나 배포하면, 아래와 같이 service, pod, replicaset 등이 다 뜬다

```bash
NAME                                                                  READY   STATUS    RESTARTS   AGE
pod/sklearn-iris-predictor-default-00001-deployment-7b74777f85l2ttg   0/2     Pending   0          2s

NAME                                                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                                              AGE
service/sklearn-iris-predictor-default-00001           ClusterIP   10.0.0.1   <none>        80/TCP,443/TCP                                       2s
service/sklearn-iris-predictor-default-00001-private   ClusterIP   10.0.0.1    <none>        80/TCP,443/TCP,9090/TCP,9091/TCP,8022/TCP,8012/TCP   2s

NAME                                                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/sklearn-iris-predictor-default-00001-deployment   0/1     1            0           2s

NAME                                                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/sklearn-iris-predictor-default-00001-deployment-7b74777f85   1         1         0       2s

NAME                                                                CONFIG NAME                      K8S SERVICE NAME   GENERATION   READY   REASON          ACTUAL REPLICAS   DESIRED REPLICAS
revision.serving.knative.dev/sklearn-iris-predictor-default-00001   sklearn-iris-predictor-default                      1            False   Unschedulable   0                 1

NAME                                                         URL                                                             LATESTCREATED                          LATESTREADY   READY   REASON
service.serving.knative.dev/sklearn-iris-predictor-default   http://sklearn-iris-predictor-default.kserve-test.example.com   sklearn-iris-predictor-default-00001                 False   RevisionMissing

NAME                                                       URL                                                             READY   REASON
route.serving.knative.dev/sklearn-iris-predictor-default   http://sklearn-iris-predictor-default.kserve-test.example.com   False   RevisionMissing

NAME                                                               LATESTCREATED                          LATESTREADY   READY   REASON
configuration.serving.knative.dev/sklearn-iris-predictor-default   sklearn-iris-predictor-default-00001                 False   RevisionFailed
```

;;;;;;;;

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: sklearn-iris
spec:
  predictor:
    model:
      args: ["--enable_docs_url=True"] # 요거
      modelFormat:
        name: sklearn
      storageUri: gs://kfserving-examples/models/sklearn/1.0/model
```

이런식으로 `enable_docs_url` 이라는 인자를 True로 켜주면 swagger도 자동으로 붙일수 있다함. (FastAPI 한번 래핑한거라서..)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/kserve-02-inference-service/01.png?raw=true)

### Inference

```bash
cat <<EOF > "./iris-input.json"
{
  "instances": [
    [6.8,  2.8,  4.8,  1.4],
    [6.0,  3.4,  4.5,  1.6]
  ]
}
EOF
```

```bash
curl -v http://sklearn-iris.kserve-test.${CUSTOM_DOMAIN}/v1/models/sklearn-iris:predict -d @./iris-input.json
```

요렇게 실제로 인퍼런스할수있다

```json
{"predictions": [1, 1]}
```

### Test

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  generateName: load-test
spec:
  backoffLimit: 6
  parallelism: 1
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: "false"
    spec:
      restartPolicy: OnFailure
      containers:
      - args:
        - vegeta -cpus=5 attack -duration=1m -rate=500/1s -targets=/var/vegeta/cfg
          | vegeta report -type=text
        command:
        - sh
        - -c
        image: peterevans/vegeta:latest
        imagePullPolicy: Always
        name: vegeta
        volumeMounts:
        - mountPath: /var/vegeta
          name: vegeta-cfg
      volumes:
      - configMap:
          defaultMode: 420
          name: vegeta-cfg
        name: vegeta-cfg
---
apiVersion: v1
data:
  cfg: |
    POST http://sklearn-iris.kserve-test.svc.cluster.local/v1/models/sklearn-iris:predict
    @/var/vegeta/payload
  payload: |
    {
      "instances": [
        [6.8,  2.8,  4.8,  1.4],
        [6.0,  3.4,  4.5,  1.6]
      ]
    }
kind: ConfigMap
metadata:
  annotations:
  name: vegeta-cfg
```

베지터라는거 이용해서 이런식으로 테스트도 하나봄..

```yaml
Requests      [total, rate, throughput]         30000, 500.02, 499.99
Duration      [total, attack, wait]             1m0s, 59.998s, 3.336ms
Latencies     [min, mean, 50, 90, 95, 99, max]  1.743ms, 2.748ms, 2.494ms, 3.363ms, 4.091ms, 7.749ms, 46.354ms
Bytes In      [total, mean]                     690000, 23.00
Bytes Out     [total, mean]                     2460000, 82.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:30000
Error Set:
```
