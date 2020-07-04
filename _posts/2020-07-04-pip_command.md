---
layout: post
title: 자주쓰는 pip 명령어 모음
subtitle: 자주쓰는 pip 명령어 모음
categories: programming
tags: python
comments: true
---

```
pip install {패키지명}
```
해당 패키지 다운

---

```
pip list
```
설치된 패키지 목록+버전 출력

---

```
pip freeze > requirements.txt
```
설치된 패키지 목록+버전 requirements.txt로 뽑음

---

```
pip install -r requirements.txt
```
requirements.txt 에 있는 패키지 전부 다운

---

```
pip freeze | grep Jinja2
Jinja2==2.7.3
```
특정 패키지 버전만 출력

---

```
pip list --outdated | grep Jinja2
Jinja2 (Current: 2.6 Latest: 2.8)
```
특정 패키지 버전만 출력

---


```
pip install 'stevedore>=1.3.0,<1.4.0' --force-reinstall
```
강제로 특정 버전의 패키지 설치  
`--force-reinstall` 옵션은 강제로 reinstall할때만 넣음 

---




 


