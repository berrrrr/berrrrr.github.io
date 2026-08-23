---
layout: post
title: "[GitHub Actions] 환경별 variables와 secrets 사용하기"
subtitle: "[GitHub Actions] 환경별 variables와 secrets 사용하기"
categories: programming
tags: devops
comments: true
---

{% raw %}

> 예전엔 없던기능인데 얼마전에 action secret 보니까 environment(환경)별로 env랑 secret을 사용할 수 있도록 추가되었다!


### secrets and variables

github repo \> Settings \> Security \> Secrets and variables \>  Actions 항목을 들어간다

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/github-actions-vars-secrets/01.png?raw=true)

- Environment secrets : 오늘 사용해볼, 환경에 따라 분기쳐서 사용할 수 있는 환경변수
- Repository secrets : repo단위로 사용할수있는 secrets
- Organization secrets : organization 단위로 사용할 수 있는 secrets

### Manage environments

environment secrets항목의 manage environments를 누르면 환경을 관리할수있다

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/github-actions-vars-secrets/02.png?raw=true)

나는 dev, prod를 추가해줬다

### Environments secrets

이제 생성한 환겨을 누르고 가면 해당환경의 secrets과 variables를 생성할수있다
다들 알겠지만 둘다 환경변수인건 동일하지만 secrets은 암호화되며 로그등에서 값이 노출되지않는다
용도에 따라 추가해주자

### using environment secrets in Actions

```yaml
name: Test Secrets

on: workflow_dispatch

jobs:
  testing:
    environment: dev
    runs-on: ubuntu-latest

  steps:
    - name: Get Secrets
      run: echo "secret: ${{ secrets.DB_PWD }} "
```

이렇게 action yaml에서 environment를 명시해주고, 기존 secret 사용하듯이 \{\{secrets.변수명\}\} 문법으로 사용하면된다.

> [https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

{% endraw %}
