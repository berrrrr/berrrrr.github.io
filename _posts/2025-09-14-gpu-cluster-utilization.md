---
layout: post
title: "[MLOps] 비싼 GPU 클러스터 낭비 없이 제대로 운영하는 법"
subtitle: "[MLOps] 비싼 GPU 클러스터 낭비 없이 제대로 운영하는 법"
categories: programming
tags: mlops
comments: true
---

- GPU는 비쌈
  - 폭발적인 수요
  - 공급은 제한적
- GPU를 효율적으로쓴다?
  - 낭비하지않는것.
  - 낭비란? = 필요한것보다 많이 할당받고, 할당받은 자원을 다 쓰지 않는것
- 토스증권 낭비 분류
  - hold = 누군가 점유햇지만 사용 x
  - low = 점유하고 사용률 낮은경우
  - medium : 점유하고 사용률 보통
  - high : 점유하고 사용율높음 (50%이상)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/gpu-cluster-utilization/01.png?raw=true)

- 운영
  - 1단계: hold 해결하기
    - hold발생이유?
    - 10분미만의 hold상태가 많앗음. (83%)
      - 배치형태의 ml서비스가 많음
      - 처리할 데이터양이 예측하기 어려움
      - 서버가 생성되었다가 대기 후 종료되는 패턴
    - 진짜문제 = 7일이상. (12%)
      - → 잊고 안끈경우가 대부분.
      - 망분리환경으로 반납하기 귀찮은환경
    - 잊지않게 노티를 주고, 편하게 끌수있게하자
    - = 알람을주고 알람에 중지버튼을 넣어서 바로 중지할수잇도록함.
    - 3주후 미사용 시간 약 70% 개선
  - 2단계: low 해결하기
    - 받은만큼 자원을 못쓰고있음
    - 가능하면 받은만큼 자원 다 쓰기 (=학습의 배치사이즈 키우기)
    - 애초에 필요한 자원이 적다면? ex. 1B 모델 서빙
    - [MIG라는 gpu 가상화기술을 통해 나눌수잇음](https://toss.tech/article/toss-securities-gpu-mig)
      - gpu를 최대 7개까지 나눌수있음
      - 단 세팅이 어려움
      - 성능이 제한될수있음.
      - MIG활성화시 일부 칩셋이 비활성화됨
      - nvlink도 비활성화됨 (gpu간 통신인터페이스)
    - GPU나누는법
      - 패턴1: 개발환경 : gpu를 절반 or 1/4만쓰고싶음 → 2등분
      - 패턴2: 모델서빙 : 좀더 극단적. 최대한 나누고싶어함  → 7등분 (max)
    - 적용사례

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/gpu-cluster-utilization/02.png?raw=true)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/gpu-cluster-utilization/03.png?raw=true)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/gpu-cluster-utilization/04.png?raw=true)
