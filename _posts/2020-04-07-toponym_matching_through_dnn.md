---
layout: post
title: Toponym matching through deep neural networks
subtitle: Toponym matching through deep neural networks
categories: datascience
tags: paper
comments: true
---

## Toponym matching through deep neural networks
International Journal of Geographical Information Science 2017  게재된 논문.   

## Abstract
Toponym matching : 실제 위치에 그 위치를 나타내는 문자열을 매칭시키는것.  (ex, Bahliz 와 Paris 는 둘 다 프랑스 수도의 '파리'를 의미하므로 매칭O)
기존 방법들은 toponym matching을 위해 string similarity(문자열 유사도) 등 여러 metric을 종합하여 사용해왔지만 이 방법들은 toponym의 변화 (번역, 문화나 언어의 변화, 문자 대체  등)를 제대로 반영하지 못한다고 지적하고있다. 그래서 저자는 dnn을 사용하는 새로운 toponym matching법을 제안한다. DNN을 이용하여 toponym pair를 매칭이냐/비매칭이냐로 구분하는 방식인데,GRU를 사용하여 매칭될 문자열에 해당하는 byte sequence(= 결국 vector아닌가?)를 얻어 classifier를 진행할것이라고한다.  
결과적으로 기존에 여러 속성들을 결합한 머신러닝방식 및 string similarity 를 크게 능가하는 정확도를 얻었다고한다.  

## Introduction
기존 연구들은 거의 string similarity 방법을 사용했는데 전통적으로는  character-based, vector-space based, and hybrid approaches 3가지로 나눌수있다.  
1. character-based : edit distance같이 operation횟수로 문자열간 거리측정하는것
2. vector-space based : 문자열을 vector로 변환하여 유사성 계산
3. hybrid approaches : 여러 토큰으로 구성된 이름을 일치시킬때 두가지 아이디어를 결합하는방법 (ex.머신러닝)

저자의 의도는 기존 모델(character-based, vector-space based, and hybrid approaches )들이 toponym의 변화 (번역, 문화나 언어의 변화, 문자 대체  등)를 제대로 반영하지 못하고있던 부분을 DNN을 써서 극복하겠다는것이다. 

![img1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/toponym_matching_through_dnn_3.png?raw=true)


## Result

![img2](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/toponym_matching_through_dnn_1.png?raw=true)

![img3](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/toponym_matching_through_dnn_2.png?raw=true)
