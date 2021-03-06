---
layout: post
title: "[ML] Introduction"
subtitle: "[ML] Introduction"
categories: datascience
tags: ml
comments: true
---

## Information Processing System
정보처리시스템. 한마디로 컴퓨터.

[input] --> [Processor (H/W, S/W)] --> [output]

- input : raw data. 가공되지않은 날것의 데이터
- Processor : Program의 제어 하에 있음. 적절한 알고리즘 필요
- output : 우리에게 의미있는 정보

## Human Information Processing System
인간이 information Processing System은 biological brain으로 구성되어있음.
- neuron 으로 구성됨. (뇌에 100~1000억개 존재)
- 1ms 정도의 처리속도.

## ANNs (Artificial Neural Networks)
인간의 Neural Network를 본따 인공 Neural Network를 만드는 시도들.. 

### Interconnection schemes
#### 1) Recurrent connection
data가 loop 돌며 동일 processing element에 재연결
#### 2) Feedforward connection
한방향으로만 data가 흐름.

### supervised and unsupervised learning
#### 1) supervised learning
label(정답)을 주는것. 즉 input, output pattern 쌍을 주는것
#### 2) unsupervised learning
label 없이 input pattern만 주는것. 

## Machine Learning
컴퓨터가 algorithm을 찾는 대신 학습을 하는것
### definition of learning
학습이란? Task T와 Performance P에 관해서 experience E (데이터. 경험)로부터 학습하는것. P에 의해 측정된 T의 성능이 E (data)로부터  향상되는 경우에 그러하다.

ex) learning to recognize spoken word
T : 단어인식
P : 인식비율
E : 대화 데이터

ex) learning to play checker
T : 체커 
P : 이긴비율
E : 게임 연습

## Some disciplines related to machine learning
artificial intelligence (AI),  
computational learning theory (COLT),  
information theory, probability theory, statistics,  
differential equations, function analysis, psychology and neurobiology, philosophy, etc.  

## Design procedure of machine learning system
Step 0. Data 구하기  
Step 1. training experience 정하기  
Step 2. Target function 정하기  
Step 3. Representation for the target function (functional form of targets) 정하기  
Step 4. Learning algorithm 정하기
Step 5. 퍼포먼스 측정 및 Learning System 업데이트

## Issues in Machine Learning
- What algorithms can approximate functions well? 어떤 알고리즘이 가장 적합할까?
- How does training examples influence accuracy? 얼마나 많은 학습 샘플이 필요할까?
- What is the upper bounds of general errors for a learning system? 학습체계의 일반적인 에러의 상한은 어디까지일까?
- How does noisy data influence accuracy? noise가 들어갔을때 정확도에 얼마나 영향을 줄까?
- What is the optimal structure of learning models? 최적화 모델은 어떤것일까?
- How can prior knowledge of learner help? 학습에 도움이 될 가정은 무엇일까? 
- What clues can we get from biological learning system? 자연 학습 시스템으로부터 정보를 얻어보자

## Performance Improvement of machine learning models
### MSE (Mean Square Error)
MSE(Model) = Variance(Model) + Bias(Model)^2 
### committee machines 
모델을 여러개 만들어 병합. 모델의 variance를 낮춤.
### deep learning models
layer를 증가시켜서 model의 bias를 낮춤. 하지만 잘못하면 모델의 Variance를 높힐수있으니 주의.

