---
layout: post
title: Very Deep Convolutional Networks for Text Classification
subtitle: Very Deep Convolutional Networks for Text Classification
categories: datascience
tags: paper
comments: true
---

# Very Deep Convolutional Networks for Text Classification

## Abstract
많은 NLP과제에서 RNN, 특히 LSTM과 CNN이 사용되어왔다. 그러나 NLP에서 사용되는 모델들은 이는 컴퓨터 비전과 비교하면 다소 얕다. 따라서 이 논문에서는 텍스트 처리를 위해 29개 layer를 가지고 있는 VDCNN을 제시하면서 layer가 깊어질수록 성능이 증가함을 보여줄 것이다. 이는 텍스트처리에 깊은 CNN을 사용한 첫번째 사례이다. 

## 1. Introduction
최근 자연어처리(NLP)에서의 NN 사용은 큰 관심을 받고 있으며 점점 더 많은 과제에 적용되고 있다. 이는 좋은 결과를 이끌어 냈지만 아직 첨단 기술을 크게 능가하는 수준에 이르지 못하고 있다.
CNN은 컴퓨터 비전 분야에서 매우 성공적으로 적용되었고 수년관 많은 층의 CNN 모델을 사용함으로써 수년간 개선되고 있다. 저자들은 텍스트는 컴퓨터 비전과 유사한 속성을 가지고 있으므로 NLP 과제 역시 보다 많은 층을 가진 깊은 CNN 모델을 통해 개선될 수 있을 것이라 보고, 이 논문에서 29 layer로 구성된 CNN을 설계하였다. 이는 이전의 CNN 보다 훨씬 더 나은 결과를 보여준다. 

## 2. Related work
sentence classification에 대한 많은 연구들을 보면, 초기에는 bag-of-words, n-gram과 그에 대한 TF-IDF 등 특징을 추출한 뒤 분류하는 방식으로 접근했다. 다른 방식으로는 RNN을 사용하여 분류하였다. 이후 convolution layer와 pooling layer를 사용한 shallow neural net이 제안되었다. 이후 k-max pooling layer의 도입과 함께 6개 convolution layer를 사용한 모델이 제안되었다. 
그러나 저자들은 컴퓨터 비전분야에서 연구된 VGG나 ResNet 같은 아키텍처처럼 6개보다 더 깊은 convolution layer를 사용하는 모델이 없음을 지적한다. 이 논문에서는 29개의 convolution layer를 사용하여 깊이가 증가함에 따라 성능이 향상될 수 있음을 보여줄 것이다.



## 3. VDCNN Architecture
저자들의 network 구조는 아래와 같고, 2가지 규칙을 다른다.

![v1](https://www.moongchi.dev/wp-content/images/v1.png)

1) 동일한 output의 temporal resolution에 대해, layer들은 동일한 수의 feature maps를 가지고 있다.

2) temporal resolution이 절반으로 감소하면, feature maps의 수는 두 배가 된다
이전 NLP에 CNN을 적용했던 사례에서는 다양한 크기의 convolution layer를 섞어서 사용하였으나 이 모델에서는 size 3의 convolution layer 를 여러 개 쌓아 구성하였고 이는 3-gram feature를 가장 잘 학습할 수 있다. VGG의 일부를 적용하였으며 ResNet shortcut과 동일한 연결을 사용하였다. 
분류작업은 convolution blocks의 output에 k-max pooling을 적용하여 k개의 가장 중요한 feature를 추출한 뒤, 512 x k 로 나온 결과를 단일 벡터로 변환하여 이후 나오는 fully connected classifier에 입력하여 이루어진다. 

### Convolutional Block
각 convolutional block은 아래와 같이 각 2개의 convolutional layer, temporal BatchNorm, ReLU 로 구성된다. 
![v2](https://www.moongchi.dev/wp-content/images/v2.png)

## 4. Experimental evaluation

### 4.1 Tasks and data

Zhang 외 2015년 논문에 소개된 자유롭게 이용 가능한 8개 대규모 데이터 세트를 사용하였고, 결과를 보면 Zhang 외 2015년 논문에 나온 CNN을 능가한다. 

### 4.2 Common model settings

1) "abcdefigijklmnopqrstuvwxyz0123456 789-,.!?:'"/| #$%%* ̃'+=<>[]{}"과 special padding, space, unknown token으로 구성된 dictionary 사용
2) input text는 1014 로 고정된 사이즈 (이보다 큰 텍스트는 자른다)
3) 크기 16의 character embedding 사용
4) 128사이즈의 mini-batch, 학습률 0.01, momentum 0.9 SGD 사용
5) drop-out 없이 temporal batch normalization 사용
4.3 Experimental results
1) 이 논문의 모델은 big data set사용시 얕은 깊이에서도 잘 동작한다
2) 깊이가 깊어질수록 성능이 향상된다. (이전 최고모델보다 정확도 3.43% 증가)
3) Max-pooling은 다른 pooling 유형보다 성능이 우수하다
4) 이 논문의 모델은 최첨단 CNN을 능가한다
5) 깊이가 너무 깊어지면 정확성이 떨어진다. Shortcut connection이 성능저하를 막는데 도움이 된다.

## 5. Conclusion
이 논문의 모델은 8개의 대규모 데이터 세트로 평가되었으며, 29개의 convolutional layer까지 깊이를 증가시키면 성능이 지속적으로 향상된다는 것을 증명할 수 있었다. NLP에서 CNN으로 깊이의 이점을 보여준 첫 논문이다. 앞으로는 미래 연구에서도 텍스트 처리 모델을 더 깊게 만드는데 투자해야 할 것이다.

---



## 1. 논문의 장점
이 논문을 읽기 전에는 이미지와 텍스트가 유사하다고 생각하지 못했는데, 저자들은 둘의 유사점을 착안하고 바로 컴퓨터 비전 쪽에서 사용되는 방식을 적용하여 text classification에서 한단계 진보를 이룬 점이 인상깊다. 또한 비전에서 사용된 모델을 활용하였기에 아키텍처에 대한 쉽고 빠른 이해가 가능하였다. 

## 2. 논문의 단점
이 논문의 모델은 비전에서 사용된 모델을 매우 유사하게 가져왔고 기존에 선행된 NLP 분류 방식에서 convolution layer를 더한 것에 그쳤다. 또한 비전분야에서 획기적으로 오차율을 감소시켰던 데에 비해 6에서 29로 layer수가 상당수 증가했음에도 오류확률이 40.43% 에서 37%로 3.43% 증가는 (물론 커다란 감소이기는 하지만) 비교적 적은 수치로 보일 수 있다. 

## 3. 느낀 점
저자들은 이미지와 텍스트를 유사하다고 보고 다른 분야에서 사용되고 있는 아키텍처를 적용하여 NLP에서의 한단계 진보를 이루었다. 문제를 해결할 때, 이전에 한 번도 사용한 적 없는 방법을 찾을 수 있다면 좋겠지만 이는 무척이나 어려운 일이다. 그러나 다른 분야를 돌아보고, 그 분야에서 유사점을 찾고, 그 분야에서 이미 선행된 방식을 활용한다면 보다 쉽게 내가 직면한 문제를 해결할 실마리를 얻을 수 있음을 깨닫았다. 차후 내가 진행할 연구에서도 새로운 해결방식을 찾기 이전, 다른 유사한 분야를 찾고 그 분야에서 선행된 해결 방식을 내가 직면한 문제 분야에 적용하는 것을 우선적으로 고려해야함을 깨달았다

