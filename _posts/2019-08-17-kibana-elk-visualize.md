---
layout: post
title: kibana로 elasticsearch 데이터 시각화하기
subtitle: kibana로 elasticsearch 데이터 시각화하기
categories: programming
tags: infra
comments: true
---


# kibana로 elasticsearch 데이터 시각화하기
kibana로 elasitcsearch에 import한 데이터 시각화하기

## create index pattern
elasticsearch에 생성된 index를 kibana에 불러온다.
좌측 아이콘중 가장 하단에 있는 manage에 들어가서 kibana > index pattern 을 누르면 elasticsearch에 있는 index를 불러올수있다. 

## create dashboard
왼쪽 아이콘 중 4번째 dashboard 아이콘을 클릭하여 new dashboard를 생성한다.

## create visualization
dashboard를 생성하면 왼쪽 상단에 Add가 있다. 거기서 기 생성한 visualization이 있으면 불러올수있고, 없으면 우측 하단의 create new visualization 버튼을 눌러서 새 visualization을 생성하자.
혹은 kibana 우측 메뉴중 3번째 visualization 버튼을 눌러서 추가할수있다.
원하는 모양을(Area, Line,, 등) 선택 후  생성한 index pattern중 내가 시각화하고자하는 index를 선택한다.  
x축(Buckets)과 y축(Metrics)을 설정하면 내가 원하는대로 visualization할수있다. 

## Modify dashboard
생성된 dashboard에 추가로 그래프를 넣고싶거나 수정하고싶으면 dashboard 상단의 Edit을 누른다. 수정모드로 바뀌어서 여러 설정값을 수정할 수 있고 `Add`버튼을 누르면 visualization을 dashboard에 추가할 수 있다. 
