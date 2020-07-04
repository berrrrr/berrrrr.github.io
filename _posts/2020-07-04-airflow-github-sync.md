---
layout: post
title: airflow dag를 github저장소와 연결하여 sync맞추기 (k8s)
subtitle: airflow dag를 github저장소와 연결하여 sync맞추기 (k8s)
categories: programming
tags: infra
comments: true
---

!! 주의) kubernetes 환경에서 helm chart로 airflow 깔았을때 설정입니다. 

airflow를 사용할 때 dag를 매번 로컬폴더에 들어가서 수정해주면 버전관리도 잘 안되고 귀찮을수있다!  
이럴때는 airflow dag를 github저장소와 연결하여 sync맞춰서 사용하면된다.  
나는 k8s에서 helm chart로 깐 airflow를 사용하고있으므로.. helm chart로 설치시 환경설정값을 넣어주는 `values.yaml`파일을 어떻게 수정하면되는지 기록해놓는다.  
참고로 공식 airflow helmchart의 default 설정파일은 [여기서](https://github.com/apache/airflow/blob/master/chart/values.yaml) 확인가능.  
(근데 내가 안쓰고있는사이에 airflow 버전도 올라가고 내가 적용했던 설정값이 다 빠져있네?;; 아래 설정이 지금은 안될수도있을거같음. 그래도 일단 기록해놈) 

## github access token 생성하기 
github 로그인설정하는방법은 여러가지가있는거같은데 (helm configuration?같은 설정도있었는데..암튼패스)   
제일 쉬운 access token을 통해 접근하는방법을 사용해보겠다.  
우선 github access token을 아래 절차에 따라 발급받는다. 
1. github > user profile누르면 나오는 settings 에 들어간다.
2. 좌측 메뉴 맨 아래에 Developer settings 에 들어간다. 
3. 좌측 메뉴 맨 아래에 Personal access tokens 들어간다.
4. Generate new token 눌러서 access token 생성하고 복사해놓는다. (권한은 repo 권한만 주면됨)

생성하고 다른페이지가면 바로 감춰지니까 미리미리 잘 복사해놓자. 

## helm 설정파일 수정하기 
이제 helm chart 설정파일의 git sync 부분을 수정해준다. 
url 부분이 핵심이고, 아래 양식으로 써주면된다.   
`http://{내 githubid} : {내 access token} @ github.com / {내 githubid} / {github repository명}` 

```yaml
## Configure Git repository to fetch DAGs
  git:
    ## berrrrr는 제 id입니다. (각자 자기 github id로 변경하세요)
    ## url to clone the git repository (access token은 가립니다). 
    ## airflow-test repository에 DAG를 넣는다고 가정합니다. 
    url: https://berrrrr:accesstoken넣으세요@github.com/berrrrr/airflow-test
    ##
    ## branch name, tag or sha1 to reset to
    ref: master
    ## pre-created secret with key, key.pub and known_hosts file for private repos
    secret: 
    ## The host of the repo so for example if a github repo put github.com (Only need if using ssh not https git sync)
    repoHost:
    ## The name of the private key in your git sync secret (Only need if using ssh not https git sync)
    privateKeyName:
    gitSync:
      ## Turns on the side car container
      enabled: true
      ## Image for the side car container
      image:
        ## docker-airflow image (공식 docker이미지입니다. 아래 주소 그대로 써주세요)
        repository: k8s.gcr.io/git-sync
        ## image tag (버전은 이게 최신은아닐거같지만..ㅋ)
        tag: v3.1.1
        ## Image pull policy
        ## values: Always or IfNotPresent
        pullPolicy: IfNotPresent
      ## The amount of time in seconds to git pull dags (sync 맞출 간격입니다. 저는 1분간격으로 땡겨오게했습니다)
      refreshTime: 60 
  initContainer:
    ## Fetch the source code when the pods starts
    enabled: true
    ## Image for the init container (any image with git will do)
    image:
      ## docker-airflow image
      repository: k8s.gcr.io/git-sync 
      ## image tag
      tag: v3.1.1
      ## Image pull policy
      ## values: Always or IfNotPresent
      pullPolicy: IfNotPresent
    ## install requirements.txt dependencies automatically
    installRequirements: true

```

일케해서 배포하면 git-sync용 컨테이너가 따로생겨서 계속 github에 있는 dag파일들을 땡겨온다. 