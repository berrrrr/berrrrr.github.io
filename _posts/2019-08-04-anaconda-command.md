---
layout: post
title: ANACONDA 기본 명령어 모음
subtitle: ANACONDA 기본 명령어 모음
categories: programming
tags: python
comments: true
---

ANACONDA 기본 명령어 모음

### Anaconda 버전 확인
```
conda --version
```

### Anaconda 최신 버전으로 업데이트
```
conda update conda
```

### Anaconda meta package 업데이트
```
conda update anaconda
```

### 현재 설치된 Conda에 대한 상세 정보 출력
```
conda info
```
### 설치된 개발 환경 목록 출력
```
conda info --envs 또는 conda info -e
```

### 개발환경 만들기
```
conda create --name <개발환경 이름> <패키지리스트 이름>

ex) conda create --name Tensorflow python=3.7
ex) conda create --name imgpro scikit-image
```

### 개발환경 활성화 하기
```
activate <개발환경 이름> 
```


### 개발환경 비활성화 하기
```
conda deactivate
```

### 개발환경 제거
```
conda remove --name <개발환경 이름> --all
```

### 개발환경 구성을 위한 패키지 검색
https://docs.continuum.io/anaconda/packages/pkg-docs/


> https://agiantmind.tistory.com/172