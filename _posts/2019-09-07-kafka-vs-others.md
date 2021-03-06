---
layout: post
title: kafka 와 기존 메세징 시스템과의 차이점
subtitle: kafka 와 기존 메세징 시스템과의 차이점
categories: programming
tags: infra
comments: true
---

## kafka 와 기존 메세징 시스템과의 차이점
- 대용량의 실시간 로그처리에 특화되어 기존 범용 메세징 시스템 대비 TPS 우수.
- 단, 범용 메세징 시스템에서 제공하는 다양한 기능 X
- AMQP 프로토콜, JMS API를 사용하지 않고 TCP기반 프로토콜을 사용하여 프로토콜에 의한 오버헤드 감소.
- producer가 broker에게 다수의 메세지를 전송할때 batch형태로 한번에 전달할 수 있다. 
- 메세지를 메모리저장하는 기존 메세지큐와 달리 메시지를 파일 시스템에 저장한다. 이때문에 메세지를 많이 쌓아두어도 성능이크게 감소하지 않는다. 때문에 실시간 처리뿐 아니라 batch작업을 위해 데이터를 쌓아놓는 용도로도 사용할 수 있다.
- 기존의 메시징 시스템이 broker가 consumer에게 메세지를 push해주는 방식이라면 kafka는 consumer가 broker로부터 직접 메세지를 가지고 가는 pull 방식으로 동작한다. 따라서 consumer는 자신의 처리능력만큼의 메시지만 broker로부터 가져오기때문에 최적의 성능을 낼 수 있다.
- 그 만큼 broker의 메세지 관리에 대한 부담이 경감되었다.
- 메세지를 쌓아두었다가 주기적으로 처리하는 batch consumer 구현이 가능.