---
layout: post
title: Kafka 란?
subtitle: Kafka 란?
categories: programming
tags: infra
comments: true
---
## kafka란? 
linkedin에서 개발된 분산 메세징 시스템. 

## kafka 구성
pub-sub 모델. producer, consumer, broker로 구성된다.

## kafka 동작
kafka의 broker는 topic을 기준으로 메세지를 관리. producer가 특정 topic의 메세지를 생성한 뒤 broker에 전달. broker는 메세지를 topic별로 분류하여 쌓아놓고 해당 topic을 구독하는 consumer들이 메세지를 가져가서 처리하게된다. 

> 출처 https://epicdevs.com/17