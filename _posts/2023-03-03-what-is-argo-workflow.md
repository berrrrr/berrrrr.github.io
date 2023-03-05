---
layout: post
title: "[Argo Workflow] Argo Workflow란?"
subtitle: "[Argo Workflow] Argo Workflow란?"
categories: programming
tags: devops
comments: true
---

💡 Argo Workflow에대해 araboza

## 1. Argo Workflow란?

Kubernetes 환경에서 병렬로 실행되는 여러 Job 을 통합 관리하기 위해 만들어진 워크플로우 엔진

- Workflow의 각 Step은 컨테이너로 정의됨
- DAG(Directed Acyclic Graph) 를 사용하여 task 시퀀스 (또는 task dependency) 를 multi-step Workflow 로 모델링
- Kubernetes 환경에서 Job 을 쉽게 실행할 수 있음
- 쿠버네티스환경에서 CI/CD 파이프라인을 복잡한 설정 없이 실행할수있음

## 2. 로컬환경에서 실행해보기

### k8s 환경 구성

우선 로컬에 k8s환경을 구성한다.
docker-desktop의 kubernetes 기능을 활성화하여 사용하거나, `minikube` 등을 로컬에 설치하여 구성할 수 있다.

### argo workflow 설치

```bash
kubectl create namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.3.9/install.yaml
```

나는 지금시점에 3.3.9가 최신이라 그 버전으로 깔았는데 [여기서](https://github.com/argoproj/argo-workflows/releases/latest) 최신버전 확인해서 그걸로 깔면된다 

### argo CLI 설치

```bash
# Download the binary
curl -sLO https://github.com/argoproj/argo-workflows/releases/download/v3.3.9/argo-darwin-amd64.gz

# Unzip
gunzip argo-darwin-amd64.gz

# Make binary executable
chmod +x argo-darwin-amd64

# Move binary to path
sudo mv ./argo-darwin-amd64 /usr/local/bin/argo

# Test installation
argo version
```

```bash
argo: v3.3.9
  BuildDate: 2022-08-10T00:52:18Z
  GitCommit: 5db53aa0ca54e51ca69053e1d3272e37064559d7
  GitTreeState: clean
  GitTag: v3.3.9
  GoVersion: go1.17.13
  Compiler: gc
  Platform: darwin/amd64
```

### 인증우회

원래 아르고 ui들어가려면 클라이언트인증필요한데 아래설정 넣어주면 우회가능하다고함

```bash
kubectl patch deployment \
  argo-server \
  --namespace argo \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": [
  "server",
  "--auth-mode=server"
]}]'
```

### UI 포트포워딩

```bash
kubectl -n argo port-forward deployment/argo-server 2746:2746
# 혹은
argo server
```

이제 [https://localhost:2746](https://localhost:2746/) 여기로 들어가서 argo workflow ui를 구경할수있다 

## 3. workflow  등록해보기

argo workflow 는 템플릿 기반으로 실행되는데 이 템플릿은 `yaml` 형식으로 작성하면 됨 

아래와같이 argo workflow 공식 repo에 올라와있는 예제파일을 submit해보자

```bash
argo submit -n argo --watch https://raw.githubusercontent.com/argoproj/argo-workflows/master/examples/hello-world.yaml
```

실행하면 이런 현황판을 띄워준다 

```bash
Name:                hello-world-d5j49
Namespace:           argo
ServiceAccount:      unset (will run with the default ServiceAccount)
Status:              Succeeded
Conditions:
 PodRunning          False
 Completed           True
Created:             Tue Sep 06 14:18:57 +0900 (1 minute ago)
Started:             Tue Sep 06 14:18:57 +0900 (1 minute ago)
Finished:            Tue Sep 06 14:20:09 +0900 (now)
Duration:            1 minute 12 seconds
Progress:            1/1
ResourcesDuration:   28s*(1 cpu),28s*(100Mi memory)

STEP                  TEMPLATE  PODNAME            DURATION  MESSAGE
 ✔ hello-world-d5j49  whalesay  hello-world-d5j49  1m

This workflow does not have security context set. You can run your workflow pods more securely by setting it.
Learn more at https://argoproj.github.io/argo-workflows/workflow-pod-security-context/
```

```bash
argo list -n argo
# 조회하면 현재 workflow 상태도 볼수있다
NAME                STATUS    AGE   DURATION   PRIORITY
hello-world-d5j49   Running   25s   25s        0
NAME                STATUS      AGE   DURATION   PRIORITY
hello-world-d5j49   Succeeded   2m    1m         0
```

다양한 workflow 템플릿은 여기서 확인 가능

[argo-workflows/examples at master · argoproj/argo-workflows](https://github.com/argoproj/argo-workflows/tree/master/examples)

## 4. argo-cli 명령어 모음

```bash
# 가장 최근에 실행된 workflow 상세정보
argo get -n argo @latest

# argo log tailing
argo logs -f {workflowName}
```
