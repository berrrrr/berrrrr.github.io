---
layout: post
title: jupyternotebook 설치 후 Command 'jupyternotebook' not found
subtitle: subtitle:Enter subtitle
categories: programming
tags: python
comments: true
---

```
pip install jupyter
```
pip으로 jupyternotebook 정상 설치 후 
```
$ jupyternotebook
```
실행했는데 

```
Command 'jupyternotebook' not found
```
이와같은 에러메세지가 나온다면...


```
 ~/.local/bin/jupyter-notebook
 ```
 이렇게 실행하면된다. 