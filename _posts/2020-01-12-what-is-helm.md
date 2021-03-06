---
layout: post
title: Helm 이란?
subtitle: Helm 이란?
categories: programming
tags: infra
comments: true
---

## Helm 이란?
- Kubernetes 의 Package Managing Tool
- Python의 pip, Node.js 의 npm 과 비슷한 역할
- 어플리케이션을 패키징하여 Kubernetes Cluster 에 배포할 수 있도록 도와줌.
- chart라는 Packaging Format 을 사용Helm 구조
[공식문서](https://helm.sh/docs/)

## Helm 구조
기본적으로 클라이언트(cli) -  서버(Tiller) 구성이다.  
![163_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/163_1.png?raw=true)

- helm client : 사용자를 위한 CLI client
- tiller : helm server. 보통 kubernetes위에 pod 형태로 위치함
- chart : 어플리케이션을 구성하는 kubernetes 객체 정의 및 설정 묶음
- release : chart를 kubernetes 위에 배포하는 과정

## Helm Repository
chart가 저장되는 Helm Repository는 3가지 repo로 나뉜다.  

- local : Helm client가 설치된 local repository. local에 생성한 패키지가 존재한다.  
- stable :  안정 버전에 이른 차트가 존재하는 리포지토리다. 안정된 보안 수준과 기본 설정값을 포함하는 등 일정한 요건을 만족하는 차트만 제공될 수 있다.  
- incubator : stable 요건을 만족하지 못하는 차트가 제공되는 리포지토리다. stable로 넘어갈 예정인 차트가 제공된다.  

## Helm 설치
helm으로 패키지를 설치하기 전에 k8s cluster 구성과 kubernetes cli (kubectl)설치가 완료되어있어야함.   

### homebrew로 helm 설치  
```
brew install helm
helm init --tiller-namespace=kube-system --upgrade --service-account=tiller
```

### 설치 확인
```
helm version
Client: &version.Version{SemVer:"v2.14.0", GitCommit:"05811b84a3f93603dd6c2fcfe57944dfa7ab7fd0", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.14.0", GitCommit:"05811b84a3f93603dd6c2fcfe57944dfa7ab7fd0", GitTreeState:"clean"}
```

# Chart 란?
helm에서 사용하는 package format. 쿠버네티스 리소스를 describe 하는 파일들의 집합.

## Chart 구조
k8s 에 올라갈 애플리케션을 구성하는 k8s 객체정보인 manifest template 파일과 설정값 정보로 구성.  
간단하게 말해서, 우리가 k8s에 배포할때 작성하는 yaml파일의 집합이라고 보면 된다.  
예시) wordpress 라는 application의 chart의 경우, 아래와 같이 구성할수있다  
```
wordpress/            # directory 이름은 곧 chart의 이름
  Chart.yaml          # Chart에 대한 정보를 적어놓는 YAML 파일 (필수)
  LICENSE             # 라이센스에 대한 내용을 적어 놓는 텍스트 파일 (옵션)
  README.md           # 사용자가 읽을 수 있는 README 파일 (옵션)
  requirements.yaml   # Chart간 의존성이 있을 경우 이를 리스트 형태로 정의하는 파일 (옵션)
  values.yaml         # Chart 내에서 어플리케이션에 필요한 설정값들이 모여 있는 파일 (필수)
  charts/             # Chart가 다른 Chart에 의존성이 있을 경우 다른 의존하는 Chart들이 위치하는 디렉토리 (옵션)
  templates/          # kubernetes 객체를 정의하는 manifest template 파일들이 위치하는 디렉토리 (필수)
                      # gotpl로 구현된 template들이어야 하며 values.yaml의 값들과 합해져서 manifest 파일을 rendering함
  templates/NOTES.txt # chart 사용 방법을 설명해 놓은 텍스트 파일 (옵션)
```
더 자세한 정보는 [Chart 공식문서](https://helm.sh/docs/topics/charts/)

## Chart 설치하기
Helm Repository에 있는 chart들을 손쉽게 설치할 수 있다.  
helm search로 helm repository에 어떤 chart들이 등록되어있는지 확인할 수 있다  
```
> helm search
NAME                                    CHART VERSION   APP VERSION             DESCRIPTION
stable/acs-engine-autoscaler            2.2.2           2.1.1                   DEPRECATED Scales worker nodes within agent pools
stable/aerospike                        0.3.2           v4.5.0.5                A Helm chart for Aerospike in Kubernetes
stable/airflow                          5.2.4           1.10.4                  Airflow is a platform to programmatically author, schedul...
stable/ambassador                       5.3.0           0.86.1                  A Helm chart for Datawire Ambassador
stable/anchore-engine                   1.4.0           0.6.0                   Anchore container analysis and policy evaluation engine s...
...
...
```

```
helm install 다운받을 패키지명
```

위 명령어로 reop에 있는 원하는 chart를 다운받을 수 있다.  
예) stable/mariadb 다운  
```
helm install stable/mariadb
```

## Chart 배포하기
stable은 공식 저장소이니 제외하고, 내가 만든 chart를 개인repo 등에 저장할 수 있다. (이때 개인 repo는 git이 될수도 있고, 웹서버가 될 수도 있다.) 아래와 같은 flow로 배포할 수 있다.  
내 개인 repo를 추가한다.
```
helm repo add [repo명] [repo주소]
```
chart 파일을 만든다

```
helm create [chart명]
```

나만의 chart를 만든다.  
그리고 chart 파일을 패키징한다. (tgz 파일로 압축)

```
helm package [chart디렉토리]
```
개인 repo에 push 한다.

```
helm plugin install https://github.com/chartmuseum/helm-push
helm push [chart디렉토리] [repo서버명]
```
자세한 배포과정은 https://bcho.tistory.com/1341 참고

# Hooks
Kubernetes 환경에서 helm 차트로 설치, 업그레이드,삭제 그리고 롤백과 같은 애플리케이션 생명주기의 개입할 수 있는 기능을 Hook을 통하여 제공  
ex1) mySQL을 chart로 설치한 후에, mySQL에 테이블을 생성하고 데이타를 로딩할수있음  
ex2) chart로 Pod를 설치하기전에 Configmap이나 Secret 의 값을 세팅할수있음   



hook으로 다음과 같은 일들이 가능하다  

|cmd|desc|
|:---:|:---|
|pre-install|Executes after templates are rendered, but before any resources are created in Kubernetes |
|post-install|Executes after all resources are loaded into Kubernetes |
|pre-delete|Executes on a deletion request before any resources are deleted from Kubernetes|
|post-delete|Executes on a deletion request after all of the release’s resources have been deleted|
|pre-upgrade|Executes on an upgrade request after templates are rendered, but before any resources are updated|
|post-upgrade|Executes on an upgrade after all resources have been upgraded|
|pre-rollback|Executes on a rollback request after templates are rendered, but before any resources are rolled back|
|post-rollback|Executes on a rollback request after all resources have been modified|
|test|Executes when the Helm test subcommand is invoked (view test docs)|

자세한 사용방법은 [공식문서](https://helm.sh/docs/topics/charts_hooks)


