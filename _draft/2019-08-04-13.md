---
title: Anaconda + Pycham으로 python 개발환경 구성하기
date: 2019-08-03 20:18:51
categories: 
 - Python
tags: 
 - python
 - pycharm
 - anaconda
sidebar:
 nav: "categories"
toc: true
toc_label: "List"
toc_icon: "list"
---
title : Anaconda + Pycharm 으로 python 개발환경 구성하기

## anaconda 설치

anaconda는 python / R data science platform인데  
필수적으로 수많은 모듈들을 추가로 설치해야하는 python의 개발환경에서  
conda는 필요한 모듈을 프로젝트별로 나눠서 환경을 구성할 수 있어서 무척 편리하다.

[https://www.anaconda.com/distribution/#download-section](https://www.anaconda.com/distribution/#download-section)

위 사이트에서 자신에게 맞는 anaconda 최신버전을 설치하면 된다.  
특별한 이유가 없으면 대세흐름인 python 3.대버전을 깐다.


## anaconda 명령어 모음

- Anaconda 버전 확인
conda --version

- Anaconda 최신 버전으로 업데이트
conda update conda

- Anaconda meta package 업데이트
conda update anaconda

- 현재 설치된 Conda에 대한 상세 정보 출력
conda info

- 설치된 개발 환경 목록 출력
conda info --envs 또는 conda info -e

- 개발환경 만들기
conda create --name <개발환경 이름> <패키지리스트 이름>

ex) conda create --name Tensorflow python=3.7
ex) conda create --name imgpro scikit-image

- 개발환경 활성화 하기
activate <개발환경 이름>

- 개발환경 비활성화 하기
conda deactivate

- 개발환경 제거
conda remove --name <개발환경 이름> --all

- 개발환경 구성을 위한 패키지 검색
[https://docs.continuum.io/anaconda/packages/pkg-docs/](https://docs.continuum.io/anaconda/packages/pkg-docs/)



---


## pycharm 설치

[https://www.jetbrains.com/pycharm/download/#section=windows](https://www.jetbrains.com/pycharm/download/#section=windows)

community 버전을 설치하면 된다.

## pycharm 명령어 모음

pycharm은 intellij계열이라 shortcut이 내가 주로 사용하는 eclipse 환경이랑 달라 매번 쓸때마다 까먹는다 ㅋ.   
자주쓰는거 생길때마다 추가해줘야지

`ctr + alt + l` : formatter   
`shift + F10` : Run  
`shift + F9` : Debug  
`F8` : Debug시 Step over  
`F7` : Debug시 Step into  
`Alt + drag` : coloumn select

## Pycharm에서 anaconda env 불러오기
`File > Settings` 눌러서
`Project > Project Interpreter` 에 들어간다.  
이제 프로젝트의 Python Interpreter를 Anaconda에서 설정한 환경의 Interpreter로 변경할것이다.
우측상단의 톱니바퀴 > Add 로 들어간다.  
여러 환경이 뜨는데 그중에 `Conda Environment` 를 들어간다.
`Existing Environment`를 누르고, Interpreter 경로를 `{내가설치한 anaconda 폴더경로}\envs\{내가 생성한 환경폴더}\python.exe` 를 잡아준다. 
그럼 Interpreter가 변경되면서 내가 ananconda에서 받은 python package들도 같이 로드된다. 