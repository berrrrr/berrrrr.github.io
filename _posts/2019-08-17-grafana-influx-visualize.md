---
layout: post
title: grafana로 influxDB 데이터 시각화하기
subtitle: grafana로 influxDB 데이터 시각화하기
categories: programming
tags: infra
comments: true
---

grafana로 influxDB에 넣은 데이터들을 시각화할 수 있다. 

# create datasource
Home dashboard > create your first datasource 혹은
좌측 5번째 Configuration > Data sources 로 들어가서
`Add data source` 를 눌러서 나의 datasource type을 누르고 관련 정보를 넣어 연결한다. 
나의경우는 influx DB이므로 influx DB를 눌러서 url, database, user, password 정보 등을 넣었다. Save&Test를 눌러서 Success가 뜨면 잘 연결된거다. 

# create dashbouard
좌측 1번째 Create > Dashboard를 눌러서 새 대쉬보드를 생성한다.
기본적으로 New Dashboard라는 이름으로 생성되며 이 이름은 우측 상단에 톱니바퀴 모양을 눌러서 변경할 수 있다. 

# Add query
생성한 dashboard에 query(차트)를 추가한다. 
내가 아까 추가한 datasource를 선택하면 아래 쿼리만드는부분에 필드등이 불러와진다.
FROM 항목에서 내가 원하는 measurement를 선택하고 (주로 average, mideum 등..)  
SELECT 항목에서 원하는 filed를 선택한다. 
자동으로 데이터를 불러오며 차트를 형성한다. 
(이때 만약 차트가 눈에 보이지 않는다면 우측 상단에 있는 시간을 실제 데이터가 가지는 timestamp와 유사한 값으로 수정해야한다. 기본값이 last 6hours인데 내가 넣은데이터가 2016년 데이터라면 아래 custum range에서 2016년 부근으로 맞춰주면 차트에 데이터가 표기된다)
이때 panel의 title같은 속성은 query의 좌측에 보면 메뉴가 4가지 있는데 3번째 General 항목에 들어가서 원하는대로 수정 가능하다. 
차트의 모양(꺾은선인지 히스토그램인지 등)은 두번째 메뉴 visualization 항목에서 조절 가능하다. 