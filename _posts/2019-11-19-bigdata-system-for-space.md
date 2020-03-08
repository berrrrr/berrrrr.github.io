---
layout: post
title: Big data based operations for space systems
subtitle: Big data based operations for space systems
categories: datascience
tags: paper
comments: true
---

## Big data based operations for space systems

## Author
L. Boussouf, B. Bergelin, D Scudeler, P Rosnet, E Taillefer, C Barreyre   
Airbus Defence & Space SAS, Toulouse, France J Stamminger  
Airbus Defence & Space GmbH, Bremen, Germany H Graydon  
Airbus Defence & Space Ltd, Portsmouth, United Kingdom  

Airbus에서 발행한 논문이다. 

## Abstract 
space systems increasing complexity is observed at two levels: satellite level (or orbital facility, cargo vehicle) and system of systems level (fleet and constellation). as in other industries, satellite monitoring techniques matured toward higher abstraction. complexity of system being solved by scalability of monitoring, we propose here a description of developed methods and processes to implement support for test and operations phases from a big data perspective. using latest advances in big data technologies, from infrastructure to end users applications through algorithms, and considering space system specificities on data, we demonstrate how valuable our proposal is in an in-orbit support context. we also propose the necessary immediate steps to allow further support and automation for operations in the next years.  
space system은 1) 위성 수준 , 2) 시스템 수준에서 점점 더 복잡해지고있다. 다른 산업과 마찬가지로 위성 모니터링 시스템은 더 관념적인 방향으로 성숙했다. 이 논문에서는 모니터링의 확장성, 빅데이터 관점에서의 테스트 및 운영을 위한 개발방법과 프로세스를 제안한다. 인프라 알고리즘을 통한 최종 사용자 어플리케이션까지 빅데이터의 최신 기술을 사용하여 이 논문의 제안이 위성분야에서 얼마나 가치있는지를 증명한다. 

## 6줄요약
- 1500개의 Telemetry를 4310일 동안 모은 csv파일을 HDFS에 parquet형식으로 압축저장
- parquet파일을 Hex File로 변환, Hex File을 다시 CSV파일로 변환한뒤 HDFS로 저장
- telemetry 데이터를 처리 하는데 어떻게 할지 비교
- Hadoop의 HDFS, Apache Hive, Apache HBase, Apache Parquet 비교. 
- 각각의 플랫폼을 Spark의 groupBy, aggregateByKey()로 분석
- Parquet의 aggregateByKey()가 가장 빠른 것으로 나타남

