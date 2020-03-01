---
title: Linux Profile 설정하기
date: 2019-08-03 20:47:36
categories: 
 - Infra
tags: 
 - Linux
 - Profile
sidebar:
 nav: "categories"
toc: true
toc_label: "List"
toc_icon: "list"
---

# linux profile 설정하기
linux user가 사용하는 환경변수 및 단축키 등을 profile을 수정하여 적용할 수 있다.

## profile 수정
```
vim ~/.profile
vim ~/.bashrc
```
수정 파일은 linux 종류에 따라 다르다.
profile 혹은 bash profile을 vim으로 편집한다.
(centOS는 bashrc)

## profile 적용
```
source ~/.profile
source ~/.bashrc
```
수정 후 source 명령어를 적용해줘야 profile이 완벽하게 적용된다.