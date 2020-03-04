---
layout: post
title: Predicting Evacuation Decisions using Representations of Individuals’ Pre-DisasterWeb Search Behavior
subtitle: Predicting Evacuation Decisions using Representations of Individuals’ Pre-DisasterWeb Search Behavior
categories: datascience
tags: paper
comments: true
---

## Predicting Evacuation Decisions using Representations of Individuals’ Pre-DisasterWeb Search Behavior
개인의 Pre-DisasterWeb 검색 행동패턴을 통해 대피 결정 예측하기

저자 - Takahiro Yabe
Lyles School of Civil Engineering
Purdue University, USA
tyabe@purdue.edu

Kota Tsubouchi
Yahoo Japan Corporation
Tokyo, Japan
ktsubouc@yahoo-corp.jp

Toru Shimizu
Yahoo Japan Corporation
Tokyo, Japan
toshimiz@yahoo-corp.jp

## Abstract
Predicting the evacuation decisions of individuals before the disaster strikes is crucial for planning first response strategies. In addition to the studies on post-disaster analysis of evacuation behavior, there are various works that attempt to predict the evacuation decisions beforehand. Most of these predictive methods, however, require real time location data for calibration, which are becoming much harder to obtain due to the rising privacy concerns. Meanwhile, web search queries of anonymous users have been collected by web companies. Although such data raise less privacy concerns, they have been under-utilized for various applications. In this study, we investigate whether web search data observed prior to the disaster can be used to predict the evacuation decisions. More specifically, we utilize a session-based query encoder that learns the representations of each user’s web search behavior prior to evacuation. Our proposed approach is empirically tested using web search data collected from users affected by a major flood in Japan. Results are validated using location data collected from mobile phones of the same set of users as ground truth. We show that evacuation decisions can be accurately predicted (84%) using only the users’ pre-disaster web search data as input. This study proposes an alternative method for evacuation prediction that does not require highly sensitive location data, which can assist local governments to prepare effective first response strategies.  
재해 발생 전에 개인의 대피 결정을 예측하는 것은 첫 번째 대응 전략을 계획하는 데 매우 중요하다. 대피행위에 대한 재해 후의 분석에 관한 연구 외에도, 피난 결정을 미리 예측하려는 다양한 작품들이 있다. 그러나 이러한 예측 방법의 대부분은 교정을 위해 실시간 위치 데이터를 필요로 하는데, 이는 증가하는 사생활 문제로 인해 점점 더 얻기 어려워지고 있다. 한편, 익명의 사용자들에 대한 웹 검색 쿼리는 웹 회사에 의해 수집되었다. 그러한 데이터는 프라이버시 우려를 덜 불러일으키지만, 다양한 애플리케이션에서 충분히 활용되지 못하고 있다. 본 연구에서는 재해 이전에 관측된 웹 검색 데이터를 피난 결정을 예측하는 데 사용할 수 있는지 조사한다. 구체적으로는, 대피하기 전에 각 사용자의 웹 검색 동작의 표현을 학습하는 세션 기반 쿼리 인코더를 이용한다. 우리가 제안하는 접근방식은 일본에서 큰 홍수에 의해 영향을 받는 사용자들로부터 수집된 웹 검색 데이터를 사용하여 경험적으로 시험된다. 결과는 지상 진리와 동일한 사용자 세트의 이동전화에서 수집한 위치 데이터를 사용하여 검증된다. 우리는 대피 결정을 사용자의 재해 발생 전 웹 검색 데이터만 입력으로 사용하여 정확하게 예측할 수 있음을 보여준다(84%) 본 연구는 지자체가 효과적인 첫 번째 대응 전략을 마련하는데 도움을 줄 수 있는 매우 민감한 위치 데이터가 필요하지 않은 대피 예측을 위한 대체 방법을 제안한다.

## 정리
(1) Train Query encoder model usin web search data
web query data(pre-disaster - yahoo japan, japan soccer etc..)------> train(학습)------> session-based quuery encoder (SQE)

(2) Obtain user representations using web queries and SQE 
ex) user 가 'road closed', 'safe roads' 등의 검색어 입력 (-> user presentation :x)
-> classifier y=f(x) -> predict evacuation decision y^

(3) user location data와 (2)에서 얻은 y^ (predict evacuation decision) 로 actual evac decision y 도출

## dataset
yahoo japan app 에서 disaster 관련 검색 쿼리와 위치정보 수집. (위치정보의 경우 개인정보 문제때문에 검증단계에서만 사용하고 대피 예측에는 사용하지 않음)

## method 
한 사용자가 한 세션에서 검색한 쿼리에는 SQE(Session-based Query Encoding)이라는 RNN이 도입되어 재해 발생시 집에서 대피소나 다른 장소로 대피할지 여부를 결정.  
3계층 LSTM RNN으로 쿼리를 인코딩. query 쌍의 cosine similarity as a cost function 으로 유사성을 비교함. 

수집한 위치정보 데이터를 사용하여 각 사용자의 공간 확률 밀도(spatial probability density) 추정. 비정상적인 관찰점수를 찾고 특정 점수보다 점수가 높으면 이는 개인이 재난중에 불규칙하게 움직인것을 의미.(대피)

# 결론 
사용자들이 상황이 더 나빠지고 대피 타이밍에 가까워질수록 대피와 관련된것들을 더 검색함. 
