---
layout: post
title: Spring batch 배치서비스 개발
subtitle: Spring batch 배치서비스 개발
categories: programming
tags: spring
comments: true
---

# Spring batch 배치서비스 개발
Spring batch로 배치서비스를 개발해보자

## Spring Batch란?
Enterprise System에서 개발 가능한 가볍고 종합적인 batch framework

## Spring Batch 구성
![spring batch](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/71.PNG)

## Job
### (1) Job
전체 Batch Process를 캡슐화한 Entity  
xml/java configuration을 통해 job 이름, step 정의, step 정렬, job restartable 등을 설정  
ex. The EndOfDay Job

### (2) Job Instance
논리적 job 실행 Entity  
복수개의 Job Execution을 가짐  
Job Instance는 특정 Job에 대응하고 Job parameter로 구분  
ex. The EndOfDay Job for 2019/08/11

### (3) Job Parameter 
Batch Job을 실행하는데 필요한 parameter set  
ex. The first attempt at EndOfDay Job for 2019/08/11

### (4) Job Execution
Job을 실행시키는 객체

### (5) JobRepository
JobLauncher, Job, Step 구현체에 대한 CRUD 수행을 제공.

### (6) JobLauncer 
Job + JobParameter 를 실행하는 구현 객체  
실행하는 Job과 Job repository에서 유효한 JobExecution을 가져옴


## Step
### (1) Step
batch job의 독립적이고 순차적인 단계를 캡슐화한 도메인   
모든 job은 하나 이상의 Step으로 구현   
Batch가 실제로 동작하기 위한 모든 정보를 갖고있음  

### (2) StepExecution
Step을 실행하기 위한 단일 시도, STep이 실행될 때 마다 실행됨  
Step은 Job Execution에 대응하는 StepExecution을 가지고있음

## ExecutionContext
StepExecution이나 JobExecution 실행 시 상태를 key/value형태로 저장  
Batch 수행동안 framework는 지속적으로 ExecutionContext 상태 보관

## Item
### (1) ItemReader
Step에 필요한 input을 찾아옴.

### (2) ItemWriter
Step의 Output 처리

### (3) Item Processor
Step input에 대한 비즈니스 처리
