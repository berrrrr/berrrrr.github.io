---
layout: post
title: "[GitHub Actions] 파일을 수정하고 커밋·푸시하기"
subtitle: "[GitHub Actions] 파일을 수정하고 커밋·푸시하기"
categories: programming
tags: devops
comments: true
---

{% raw %}

> ArgoCD의 trigger가, git repo 내에 자신이 바라보고있는 k8s manifest 의 수정이다. 따라서 빌드가 완료되면 자동으로 git repo에 저장된 k8s manifest를 수정해야하는데 이를 github actions로 할수 있다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: flaskdemo
  name: flaskdemo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flaskdemo
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: flaskdemo
    spec:
      containers:
      - image: tanmay238/images:app-7 # 이부분이 바껴야함
        name: flaskdemo
        resources: {}
status: {}
---
apiVersion: v1
kind: Service
metadata:
  name: flask-service
  labels:
    app: flask-service
spec:
  type: NodePort
  ports:
  - nodePort: 30001
    port: 80
    targetPort: 5000
  selector:
    app: flaskdemo
```

요런 manifest를가지고있다고하자
우리는 위에서 docker image tag만을 싸악 바꿔주면 된다.

```yaml
name: Python application

on:
  push:
    branches: [ "main" ]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python 3.10
      uses: actions/setup-python@v3
      with:
        python-version: "3.10"
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
  docker:
        needs: build
        runs-on: ubuntu-latest
        steps:
          -
            name: Checkout
            uses: actions/checkout@v3
          -
            name: Set up QEMU
            uses: docker/setup-qemu-action@v2
          -
            name: Set up Docker Buildx
            uses: docker/setup-buildx-action@v2
          -
            name: Login to Docker Hub
            uses: docker/login-action@v2
            with:
              username: ${{ secrets.DOCKERHUB_USERNAME }}
              password: ${{ secrets.DOCKERHUB_TOKEN }}
          -
            name: Build and push
            uses: docker/build-push-action@v4
            with:
              context: .
              push: true
              tags: tanmay238/images:app-${{ github.run_number }}
  modifygit:
    needs: docker
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        name: changing the deployment of git repo
        with:
          repository: 'tanmaybhandge/App-Manifest-'
          token: ${{ secrets.GIT_PASSWORD }}
      - name: modify the image
        run: |
          git config user.email github-actions@github.com
          git config user.name github-actions
          pwd
          cat deployment.yaml
          pwd
          sed -i "s+tanmay238/images.*+tanmay238/images:app-$RUN_NUMBER+g" deployment.yaml
          cat deployment.yaml
          git add .
          git commit -m 'Done  by Github Actions   Job changemanifest: ${{ github.run_number }}'
          git push origin main
        env:
          GIT_USERNAME: ${{ secrets.GIT_USERNAME }}
          GIT_PASSWORD: ${{ secrets.GIT_PASSWORD }}
          RUN_NUMBER: ${{ github.run_number }}
```

위와같이 해주면 tag명이 싸악 바뀌면서 CD를 할수잇게된다.

{% endraw %}
