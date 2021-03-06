---
layout: post
title: Apache airflow란?
subtitle: Apache airflow란?
categories: programming
tags: infra
comments: true
---

에어비앤비에서 개발한 워크플로우 스케줄링, 모니터링 플랫폼  
현재 아파치의 탑레벨 프로젝트

# Airflow 특징
- Dynamic : 에어플로우 파이프라인(동작순서, 방식)을 파이썬 코드를 이용하여 구성하기 때문에 동적인 구성이 가능
- Extensible : python 이용하여 Operator, executor를 사용하여 사용자의 환경에 맞게 확장하여 구성하는 것이 가능함
- Elegant : 에어플로우 파이프라인은 간결하고 명시적이며, 진자 템플릿(jinja template)을 이용하여 파라미터화 된 데이터를 전달하고 자동으로 파이프라인을 생성하는 것이 가능
- Scalable : 분산구조와 메시지큐를 이용하여 많은 수의 워커간의 협업을 지원하고, 스케일 아웃이 가능함


# Airflow 구성
## 아키텍쳐
![164_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/164_4.png?raw=true)  
**Scheduler**  
- 실행 주기가 되면 작업을 생성
- 의존하는 작업이 모두 성공하면 Broker에 넘김

**Worker**  
- 실제 작업을 실행하는 주체

**Broker**  
- 실행가능한 작업들이 들어가는 공간

**Meta DB**
- DAG, Task 등이 정의되어있음
- DAG run, Task Instance 관리

## UI  
![164_2](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/164_3.png?raw=true)  

# Airflow 시작하기
## local에 띄우기
로컬에 띄우기는엄청 쉬움...

1. python 설치 

```
pip install apache airflow 
```
설치끝

2. airflow start하기  

```
export AIRFLOW_HOME=~/airflow
pip install apache-airflow
airflow initdb
airflow webserver -p 8080
airflow scheduler
```

공식문서 [Quick Start](https://airflow.apache.org/docs/stable/start.html)


# Airflow 사용방법
## DAG  
![164_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/164_2.png?raw=true)  
airflow에서는 한 작업을 DAG(Directed Acyclic Graph : 방향성 비순환 그래프) 로 표현한다. (비순환인 이유는 루프를 허용하지는 않겠다는것)  
실제로 airflow에 한 workflow (DAG) 구성하면 저런식으로 시각화해서 보여줌.  
작업들의 전후/병렬관계를 쉽게 표시할수있음.  
DAG 관련하여 아래 예시가 이해하기 찰떡같아서 갖고왔다.  
(출처:https://jwon.org/airflow-concepts/)  

ex.) 요리 workflow는 나무가지를 모아서(collect_wood) 불을 지피고(start_fire) 물고기를 잡아와(fish) 굽는(cook) 네 가지 작업을 필요.  
이때 이 4가지 작업들 사이에는 다음과 같은 전후/병렬 관계가 존재한다고하자  
1. 나무가지를 모으기 전에는 불을 지필 수 없다.
2. 물고기 잡이는 나무가지를 모으거나 불을 지피는 작업과 동시에 수행할 수 있다.
3. 불과 물고기가 준비되면 구이를 만들어 먹을 수 있다. 

이 작업 흐름은 다음과 같은 DAG로 표현될 수 있다.    
![164_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/164_1.png?raw=true)  
이 DAG를 오전10시, 오후4시 배치로 돌리고자한다.  
이 내용은 아래와 같이 python 코드로 구성하면된다.  
```python
from datetime import datetime
 
from airflow import DAG
from airflow.operators.bash_operator import BashOperator
 
 
dag = DAG(
    'cookflow',  # DAG id
    start_date=datetime(2018, 6, 26),  # 언제부터 DAG이 시작되는가
    schedule_interval='0 10,16 * * *',  # 10시와 16시에 하루 두 번 실행
    catchup=False)
 
t1 = BashOperator(task_id='collect_wood', bash_command='echo collect wood', dag=dag)
t2 = BashOperator(task_id='start_fire', bash_command='echo start fire', dag=dag)
t3 = BashOperator(task_id='fish', bash_command='echo fish', dag=dag)
t4 = BashOperator(task_id='cook', bash_command='echo cook', dag=dag)
 
t1 >> t2 >> t4  # t1이 완료되면 t2 수행 가능; t2가 완료되면 t4 수행 가능
t3 >> t4  # t3가 완료되면 t4 수행 가능
```

task간 전후관계, 병렬관계가 아래처럼 단 두줄로 정의가능 
```python
t1 >> t2 >> t4  # t1이 완료되면 t2 수행 가능; t2가 완료되면 t4 수행 가능
t3 >> t4  # t3가 완료되면 t4 수행 가능
```

## Operator
Operator는 각 작업(task)을 정의하는데 사용된다. 각 작업은 db작업일수도있고, bash작업일수도있고, k8s Pod 작업일수도있다.  

때문에 airflow에서 제공하는 각종 operator 가 존재한다. 그걸 가져다 쓰면 다양한 작업을 하나의 workflow로 연계 가능.  

- KubernetesPodOperator : k8s pod 실행. 적용시 이걸 주로 사용하게될듯? ( > k8s 공식문서) 
- BashOperator: Bash 명령 실행
- PythonOperator: Python 함수 실행
- EmailOperator: 이메일 전송
- HTTPOperator: HTTP 요청 전송
- MySqlOperator, SqliteOperator, PostgresOperator, MsSqlOperator, OracleOperator, JdbcOperator: SQL 명령 실행
- Sensor: 특정조건이 채워지기를 기다리는 Operator. 시간, 파일, DB 레코드, S3 키 등을 기다림
더 많은 Operator들이 있지만 생략.. 자세한 Operator는 공식문서



# 적용시 고민할점
## 그래서 crontab보다 뭐가 나은데??
- DAG와 각각의 작업을 동적으로 간편하게 변경 가능.  
- 제공하는 Operator (+ 사용자 정의 Operator)로 다양한 task 정의
- 각 작업들에 타임아웃, 재시도 횟수, 우선도 등을 정의 가능
- 작업들이 약하게 결합됨
- 작업 실행 worker pool을 따로 정의 가능
- 웹 GUI를 통해 DAG를 편리하게 관리/모니터링
- tree, graph, gantt chart 등 다양한 뷰 제공

## 단점?
- python 환경.. (python에 익숙치 않으면 별로일수도.. 하지만 문법 자체가 어렵지는 않음)
- 보안문제등으로 worker 분리해야하면 queue 별도로 적용..
- scheduler 기본 이중화 기능이 X.. 

## 로그 저장
로그를 어디에 저장할것인지.?? 
- 걍 local에 저장
- minio → nfs
- ElasticSearch 
공식문서 [Writing Logs](https://airflow.apache.org/docs/stable/howto/write-logs.html?highlight=log) 참고 

