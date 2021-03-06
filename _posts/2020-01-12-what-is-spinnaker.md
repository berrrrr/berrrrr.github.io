---
layout: post
title: spinnaker 란?
subtitle: spinnaker 란?
categories: programming
tags: infra
comments: true
---

# spinnaker 란?
넷플릭스에서 개발하여 오픈 소스화한 멀티 클라우드를 지원하는 CD(Continuous Delivery) Platform.  
구글 클라우드, 아마존, 마이크로소프트등 대부분의 메이져 클라우드 지원  
Kubernetes 나, OpenStack 과 같은 오픈소스 기반의 클라우드 또는 컨테이너 플랫폼 지원  

# Spinnaker 구조
## Application Management Concept
![165_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_1.png?raw=true)  V
서버 그룹, 클러스터가 정확히 뭘 의미하는지 애매할수있어서 k8s 와 비교해 정리하면 다음과 같다. 

|spinnaker|k8s|desc|
|:---:|:---:|---|
|Server Group|Workloads|k8s의 Pod 하나를 의미한다고 볼 수 있음|
|Clusters|Cluster(Logical Server Group)|논리적 그룹이라고하는데.. 실제 DKOSv3의 cluster 단위와 동일|
|Load Balancer|Services|-|
|Firewall|NetworkPolicies|보안정책  




## Spinnaker Architecture
![165_4](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_4.png?raw=true)  

|ame|Functionality|Port|
|:---:|:---|:---|
|Deck |User interface. (UI)|9000|
|Gate|Api gateway. All external requests to Spinnaker are directed through Gate.|8084|
|Orca|Orchestration engine of pipelines and ad hoc operations.|8083|
|Clouddrive|Interacts with and mutates infrastructure on underlying cloud providers. |7002|
|Rosco|Machine image bakery. |8087|
|Front50|Interface to persistent storage, such as Amazon S3 or Google Cloud Storage.|8080|
|Igor|Interface to Jenkins. .|8088|
|Echo|Event bus for notifications and triggers. |8089|
|Fiat|Fiat is the authorization server for the Spinnaker system.|7003|
|Rush|General purpose scripting engine. (Deprecated) | x |
|Halyard|A tool for configuring, installing, and updating Spinnaker.|8064|
|Keyenta|Automated Canary Analysis platform	|8090|

msa 구조라고한다.. spinnaker 하나 띄우면 위에 애들이 다뜬다  

대략적인 flow는 아래와 같다.  
1. 개발자는 코드를 커밋하고 이는 Jenkins 의 빌드의 시작과 연결
2. Jenkins 는 빌드를 완료하고 애플리케이션 배포 아티팩트를 만듦
3. Igor 는 빌드의 완료를 확인하고 해당 빌드 이벤트를 Echo 에 보냄
4. Echo 는 이벤트를 Orca 로 전달하고 이는 딜리버리 파이프라인 인스턴스를 시작하며 Cloud Driver 로 배포 요청
5. Cloud Driver 는 아티팩트를 Jenkins 로 부터 가져와서 cloud에 배포를 수행
6. Cloud Driver 가 서버 그룹이 cloud 에서 활성화 되어 동작하는 상태를 검출하면 Orca 파이프라인 완료

# Spinnaker 설치
## 공식 helm chart Spinnaker
```
helm install --name my-release stable/spinnaker
```
https://github.com/helm/charts/tree/master/stable/spinnaker

## 공식문서 setup 가이드
spinnaker.io/setup/



# Spinnaker Deployment
## Deployment pipeline
![165_2](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_2.png?raw=true)  
사실 spinnaker 안에서 pipeline은 마음대로 만들 수 있지만..  
일반적인 케이스로, jenkins로 CI 한 뒤 spinnaker로 CD 한다고 생각하면 아래와 같은 보통 위와 같은 pipeline이 나올거같다. 



## Deployment Policy
![165_3](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_3.png?raw=true)  
### Red/Black (=Blue/Green)
테스트해보고 트래픽을 한번에 전환함. 롤백이 빠르다는 장점.  

1. 동일한 양의 instance로 이루어진 새로운 Server Group을 생성한다  
2. 신규 Server Group이 정상상태가 되면 LB는 신규 Server Group에 트래픽을 분산한다.  

cf. Blue/Green 배포방식 : blue구역은 실제 운영서버. green구역에서 신규버전 테스트를 하고, 문제가 없으면 blue구역에 향하던 request를 green구역으로 향하게함.  
이제green 구역이 실 운영서버가 되고(green → blue) , blue 구역은 테스트서버가 됨. (blue→ green) (구역swap)   

### Rolling red/black
red/black과 기본적으로는 동일. 단 인스턴스별 또는 그룹별로 rolling

### Canary
트래픽을 분산시켜 전환함.   

1. 가장 작은 개수의 인스턴스를 교체시키고  
2. 새로운 버전으로 트래픽을 분산시킨다 (1~5프로)  
3. 새로운 버전에 이슈가 없을때까지 테스트를 진행하고  
4. 특정시간까지 이슈가 없으면 배포를 늘려간다.  


# Spinnaker 사용
## Clusters
![165_5](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_cluster.png?raw=true)  
spinnaker를 띄우면 위와 같이 배포된 cluster 환경을 한눈에 볼 수 있음.    
(초록색 칸 하나가 pod 한개 라고 보면됨)  

## Pipelines
![165_6](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_pipeline.png?raw=true)  
위와 같이 배포 pipeline을 구성하고, ui로 편리하게 볼 수 있음  
처음 구성해서 잘 모르더라도 pipeline template이 있어서 그걸 이용해서 만들수있다!! 


![165_6](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/165_pipelinehistory.png?raw=true)  
pipeline을 누르면 위와 같이 여태까지의 배포 history를 볼 수 있음. 

자세한 pipeline manage 방법은 [공식문서](https://www.spinnaker.io/guides/user/pipeline/managing-pipelines/#create-a-pipeline) 참고



# Spinnaker의 장단점

## 장점
- Multi-Cloud용 Continuous Delivery/Deployment Platform 
- 다양한 pipeline 형태로 배포가 가능하고 Rollback이 쉬움
- 빠른 배포가 가능
- 여러번 배포가 용이
- 유연한 pipeline management system을 가지고 있음
- 다양한 배포전략 (Blue-Green, Rolling Red/Black, Canary)
- community 활동 활발 (github, slack)
- VM과 Container 동시에 통합관리 가능
- CI통합 용이(Jenkins)
- CLI를 통한 설치 및 관리(halyard)
- VM, Helm Packaging 가능
- RBAC(역할기반접근통제) 지원
- Notification - Email, Slack, Hipchat등
- Safe Deployment - Judgement (승인기능)

## 단점
- 러닝커브가 좀 있음. 
- 다소 무거움 
- 작은 규모 서비스에는 적합하지 X