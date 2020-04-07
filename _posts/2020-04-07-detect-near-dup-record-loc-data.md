---
layout: post
title: Detecting Nearly Duplicated Records in Location Datasets
subtitle: Detecting Nearly Duplicated Records in Location Datasets
categories: datascience
tags: paper
comments: true
---

## Detecting Nearly Duplicated Records in Location Datasets
지리 데이터셋에서 중복레코드 검출하기  
ACM 2010에 게재됨  

## Author
Yu Zheng, Xixuan Fen, Xing Xie Microsoft Research Asia,  
Shuang Peng, James Fu Search Technology Center, Microsoft  

Microsoft에서 낸 논문이다.  

## Abstract
중복레코드를 탐지하기 위해 1. 후보선정 2. 특징 추출 및 훈련 3. 추론 세단계로 구성된 Machine Learning 접근법을 제안. 

## Methods
Key feature로는 name similarity, address similarity, category similiarity를 사용.   
Name similarity – 장소명의 같은부분과 다른부분을 벡터화하여 feature로 사용. 이때 불용어 처리를 위해 idf를 사용하여 계산.  
Address similarity – 주소를 계층적 구조로 나눈 뒤 몇 단계 계층까지 일치하는지로 유사도를 표현. 낮은 단계에서 일치할수록 유사도가 높은것.  
Category similarity – (주소와동일) category를 계층적 구조로 나눈 뒤 몇 단계 계층까지 일치하는지로 유사도를 표현.  

Classifier로는 Decision Tree를 사용.   

## Result
Baseline:  
 1) rule based(두 장소의 edit distance가 thresh hold보다 낮고 geo-distanc가 thresh hold보다 낮으면 중복으로 판단)  
 2) excat match(두 장소의 이름과 주소가 동일하면 중복으로 판단. 그외는 비중복으로 판단)   
 
![img1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/detect-near-dup-record-loc-data_1.png?raw=true)
