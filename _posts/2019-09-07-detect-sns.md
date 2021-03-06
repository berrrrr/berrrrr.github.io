---
layout: post
title: Real-time Event Detection on Social Data Streams (2019.07)
subtitle: Real-time Event Detection on Social Data Streams (2019.07)
categories: datascience
tags: paper
comments: true
---

## Real-time Event Detection on Social Data Streams (2019.07)
Social data stream에서 실시간으로 이벤트 감지하기

## Author
Mateusz Fedoryszak?  
Twitter  
London, UK  
mfedoryszak@twitter.com  

Brent Frederick?  
Twitter  
New York, USA  
brentf@twitter.com  

Vijay Rajaram?  
Twitter  
New York, USA  
vrajaram@twitter.com  

Changtao Zhong?  
Twitter  
London, UK  
czhong@twitter.com  

---

## Abstract
Social networks are quickly becoming the primary medium for discussing what is happening around real-world events. The information that is generated on social platforms like Twitter can produce rich data streams for immediate insights into ongoing matters and the conversations around them. To tackle the problem of event detection, we model events as a list of clusters of trending entities over time. We describe a real-time system for discovering events that is modular in design and novel in scale and speed: it applies clustering on a large stream with millions of entities per minute and produces a dynamically updated set of events. In order to assess clustering methodologies, we build an evaluation dataset derived from a snapshot of the full Twitter Firehose and propose novel metrics for measuring clustering quality. Through experiments and system profiling, we highlight key results from the offline and online pipelines. Finally, we visualize a high profile event on Twitter to show the importance of modeling the evolution of events, especially those detected from social data streams.  
소셜 네트워크는 빠르게 현실 세계의 사건들을 중심으로 무슨 일이 일어나고 있는지 토론하는 주요한 매개체가 되고 있다. 트위터와 같은 소셜 플랫폼에서 생성되는 정보는 진행 중인 문제와 그 주변의 대화에 대한 즉각적인 통찰력을 위해 풍부한 데이터 스트림을 생성할 수 있다. 이벤트 감지 문제를 해결하기 위해 이벤트를 시간에 따른 추세적 엔티티 클러스터 목록으로 모델링한다. 우리는 설계와 소설에서 모듈화된 사건들을 규모와 속도로 발견하기 위한 실시간 시스템을 설명한다. 그것은 분당 수백만 개의 실체를 가진 대규모 스트림에 클러스터링을 적용하고 동적으로 업데이트된 일련의 사건들을 생산한다. 클러스터링 방법론을 평가하기 위해 전체 Twitter Firehose의 스냅샷에서 도출한 평가 데이터 세트를 작성하고 클러스터링 품질 측정을 위한 새로운 메트릭스를 제안한다. 실험과 시스템 프로파일링을 통해 오프라인과 온라인 파이프라인의 핵심 결과를 강조한다. 마지막으로, 우리는 특히 소셜 데이터 스트림에서 감지된 사건들의 진화 모델링의 중요성을 보여주기 위해 트위터에서 하이 프로파일 이벤트를 시각화한다

## Keywords
event detection; cluster analysis; burst detection; Twitter; microblog
analysis; social networks; data stream mining

## Introduction
audience와 journalist의 실시간 conversation은 사건에 대한 통찰을 가능케한다. 많이 언급되는것은 중대한 어떤 사건이 벌어지는것. 시간에 따른 trending entity로 event를 감지할 수 있다. 이 논문에서는 twitter datastream으로 event를 탐지한다. 

## Methodology
### 1) Trend Detection
Twitter Trends 같은 시스템으로 trend를 탐지하고 군집화한다. entity(주제), domain(위치) 쌍을 기준으로 점수를 매기고 순위를 매긴다. 

### 2) Entity Extraction
tweet에서 name, hashtag, location 정보를 추출한다

### 3) Entity Filtering
non-trending entity를 필터링한다.

### 4) Compute Similarites
필터링된 entity를 sliding window방식으로 entity간 빈도수와 발생수를 통해 유사성을 계산한다. (코사인유사도 사용)

### 5) Similarity Filtering
minimum threshold 이하의 noisy connection 제거.

### 6) Entity Clustering
edge weight로 유사한 entity끼리 구성된 graph를 만든다. 유사성을 일단 한번 계산하면 다양한 clustering 알고리즘 활용 가능

### 7) Cluster Linking
시간순서대로 연결하되 edge의 weight는 코사인 유사성을 의미

### 8) Cluserter Ranking
entity의 popularity에 따라 ranking을 매김 (여러방법이 사용될수있음)

### 9) Storage
연결되고 랭킹매긴 cluster 리스트를 저장

### 10) Parameter Tuning
Minimum similarity threshold S, Louvain clustering resloution R, Time window W 세가지 파라미터를 조정한다. (S,R -> 품질과 출력에 영향, W -> 메모리 감소에 영향)
