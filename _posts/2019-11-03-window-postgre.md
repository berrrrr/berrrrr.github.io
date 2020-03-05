---
layout: post
title: window에 PostgreSQL 과 PostGIS 설치해보기
subtitle: window에 PostgreSQL 과 PostGIS 설치해보기
categories: programming
tags: infra
comments: true
---

# window에 PostgreSQL 과 PostGIS 설치해보기
window에 PostgreSQL 과 PostGIS 설치해보자

## PostgreSQL 설치
[https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)  
여기서 자신의 버전에 맞는 PostgreSQL 을 다운받아 설치해준다.  
이때 설치 마지막에 Stack Builder 를 실행하냐는 창이 뜨는데 그 창을 종료하지말고 Stack Builder를 띄워준다. (PostGIS를 설치하기 위함이다)

## PostGIS 설치
PostgreSQL을 설치하면 자동으로 같이 깔리는 Stack Builder를 실행해준다.  
자신이 설치한 PostgreSQL 버전을 눌러서 선택해서 넘어가고  
Categories > Spatial Extensions > PostGIS 선택하여 넘어감. (버전은 자기컴퓨터버전에 맞게)  
혹은 아래와 같이 직접적으로 PostGIS 설치파일을 받아 설치하여도 된다.   
[PostGIS Download](http://postgis.net/install/)  
[PostGIS on Window Download](http://download.osgeo.org/postgis/windows/)  
내경우는 현재 Window에서 실행할 예정이고 가장최신버전을 받고싶었어서 위 링크에서 가장 최신버전으로 보이는 pg11의 bundle을 받아 설치하였다. 