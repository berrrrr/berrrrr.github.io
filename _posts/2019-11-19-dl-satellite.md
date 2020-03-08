---
layout: post
title: Applications of Deep Learning Neural Networks to Satellite Telemetry Monitoring
subtitle: Applications of Deep Learning Neural Networks to Satellite Telemetry Monitoring
categories: datascience
tags: paper
comments: true
---

## Applications of Deep Learning Neural Networks to Satellite Telemetry Monitoring
위성 원격측정 모니터링을 위한 심층학습 신경망 적용  
Corey O’Meara, Leonard Schlag, Martin Wickler   
Deutsches Zentrum für Luft- und Raumfahrt e. V.,  
German Aerospace Center Münchener Straße 20, 82234 Weßling, Germany  

독일 에어로스페이스에서 낸 논문이다. 

## Abstract 
이 논문은 GSOC 에서 개발된 자동 위성 헬스 모니터링 시스템(이하 ATHMoS)에 헬스모니터링시스템에 ANN을 적용하여 개발한것에 대한 내용이다.  
모듈은 3가지로 나뉜다. 
1. Automatic feature extraction (자동 특징추출기)
2. Anomaly detection (이상감지)
3. Telemetry Prediction (위성 예측)

## Introduction
이 논문은 space operation을 위한 telemetry analysis에 대한 deep learning을 사용한 새로운 접근을 보여준다. ATHMoS에 대한 신기술의 적용과 future work 역시 다룬다.

## ATHMoS
ATHMoS는 독립된 여러 모듈로 나뉘는 multi-mission distributed software application이다.   
ATHMoS의 infra는 3가지로 구성된다.    
1. ATHMoS Service Cluster : Docker 컨테이너로 배포됨.   
2. Telemetry Database Cluster : 2-node Cassand DB. 모든 telemetry data와 mined information을 저장.  
3. Spark Cluster : 16core 5-node ㅇserver cluster  

ATHMoS Service는 아래 7가지 서비스로 구성된다. 
1. Filewatrcher Service  : telemetry packet을 받고 offline processing. csvfileparser에 파일 전달
2. CSVFileParser Service : 데이터 읽고 spark에서 사용할수있게 변환
3. TelemetryDB Writer Service : telemetry DB에 데이터 저장
4. ATHMoS Core Service : core task 수행 (deep learning으로 anomaly detection..)
5. ATHMoS Orchestrator Service : start job (start core service)
6. ViDA Web Frontend HTTP server : engineear monitoring site
7. Deep Learning Module (experimental)

### ATHMoS Core Algorithm
1. Feature Vector Creation : determine numeric value
2. Automatic Nominal Telemetry Filtering : outlier filtering
3. Anamaly Detection : 새 데이터와 과거데이터를 비교해 anomaly detection

## Automation Feature Vector Extraciton
autoencoder는 inputdata의 노이즈를 없앨때 사용되는 특별한 타입의 DNN이다. DATA의 core attribute와 feature를 학습한다. 
1. extraction of automatically learned feature
2. directly running anomaly detection

feature를 얻는데 핵심 포인트는 우선 autoencoder NN을 먼저 학습시키는것이다. 여기서 얻은 feature들을 ATHMoS에서 사용한다. 그리고 사람 엔지니어가 추출한 feature와 혼합해서 새로운 feature를 만들어낸다. 완벽한 feature vector를 찾을때까지 반복한다. NN에서 학습한 feature를 결합하여 진행한 anomaly detection이 더 정확한 결과가 나온다. 

## Anomaly Detection
RMS-error(root-mean-squared error)를 사용하여 학습하며, inputdata의 error 표준편차가 6시그마 이상일때 anomaly인것으로 판단한다. 5분간격으로 sub sampling하면 약 90% 이상의 정확도가 나온다. 

## Telemetry and Anomaly Prediction
이런 기술이 space operation에 적용할수있다는것을 증명하기위해 가장 최근의 orbit telemetry data(90분)에 기초해 향후 4.5시간 동안의 orbit telemetry의 일반적인 추세를 예측할 수 있는 간단한 예측 시스템을 얻었다.   
horizon사이즈에 따라 네트워크 아키텍쳐가 크게 달라질수있으며 이에대한 핵심결론은 다음과 같다.
1. larger look-back horizon periond 를 input으로 쓰면 layer와 node가 더 많이 필요하다.
2. a larger forcast horizon은 large look-back horizon을 필요로한다.
3. 너무 미세한 horizon은 지나치게 복잡한 network 구조를 요구한다.

 예측된 원격 측정을 기존의 ATHMoS 시스템에 공급하여 이상 현상이 발생할지 여부를 분석할 수 있다. NN이 예측한 잠재적 anomaly를 표시하고 이 파라미터에 향후 6시간 동안 간격 플래그를 설정한다. 실제 새로운 데이터가 downlink될 때, 우리는 새로운 데이터에 대해 일반적인 ATHMoS anomaly detection를 실행하고, 검출된 anomaly에 우선순위를 더 높게 부여한다. 