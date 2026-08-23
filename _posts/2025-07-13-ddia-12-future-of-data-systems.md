---
layout: post
title: "[데이터 중심 애플리케이션 설계] 12. 데이터 시스템의 미래"
subtitle: "[데이터 중심 애플리케이션 설계] 12. 데이터 시스템의 미래"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 어플리케이션을 설계, 구축하는 방법을 근본적으로 개선하는 아이디어와 접근법


### Data Integration

- 파생 데이터에 특화된 도구의 결합
  - 100프로 정답인 툴은없다..
  - 저자는 분산트랜잭션보다 파생데이터를 이종데이터 시스템 통합의 장래성있는 접근법으로 보고있음.
  - 분산환경에서의 total ordering은 아직 해결해야할 숙제
  - 따라서 causality를 위한 ordering event도 여전히 숙제
- Batch and Stream processing
  - 사실 stream = micro batching이라서.. 경계가 흐려짐
  - 비동기방식은 이벤트 로그 기반 시스템을 더욱 견고하게함
  - 데이터 재처리, derived view 사용은 굿굿
  - lambda architecture = batch + stream processing
  - 혹은 두개 processing의 통합

### Unbundling Databases

- DB \~= OS
- 고수준 추상화 for 프로그래머
- 조직의 dataflow \~= 거대한 database
- unbundling = 기능을 각자 풀어서 제공
- 로그기반 통합 추천 (loose coupling)
- 넓은 범위의작업부하에 대해 좋은 성능을 달성하기위함
- `mysql | elasticsearch`  같은 마법의 통합 툴 주세요
- database inside out
- stream processor(like pipe)로 각 연산자가 상태 변경 스트림을 받아 다른 상태 변경 스트림을 출력한다면?
- 즉 MSA처럼 구성한다면? (단, 단방향, 비동기식으로)
- 마치 spread sheet처럼 동작햇으면 좋겠다..는 저자의 희망
- 하지만 시간의존성문제 해결이 쉽지않음 ..
- 파생데이터 = read path 와 write path가 만나는곳..즉 trade-off생김
- 최신 프로토콜들도 http 기본 요청/응답 → SSE, websocket 등으로 다양화
- 스트림처리뿐 아니라 최종 사용자 장치까지 확장을..!
- redux, vuex, pinia 같은 상태관리도구도 스트림구독방식
- 요청/응답 → 발행/구독 방식으로 변경해야.. ⇒ 보다 반응성있는 사용자 인터페이스

### Aiming for Correctness

- 결국 stateful한 시스템(db)들은 장애가 큰 문제가됨
- excatly-once = 멱등한 연산 사용
- 중복억제 = 모든 경로에 식별자 추가
- transaction은 유용하지만 완벽하지않음
- 내결함성 추상화를 탐구해야한다..
- 무결성 \> 적시성 (즉, 저자는 ‘최종적 일관성’을 지지)
- (저자주장) 답은 신뢰성 있는 스트림 처리 시스템..! 트랜잭션없이도 무결성보장가능!
- 보상트랜잭션은 좋은 방법 (단, 비즈니스로직이 허용할때.)
- 믿어라, 하지만 확인해라
- 감사시스템/감사기능..  (암호화폐, 블록체인, 분산원장)

### Doing the Right Thing

- sw개발에 윤리적 선택은 갈수록 중요해지고있음
- 예측분석 (알고리즘지옥)
- 편견과 차별 (머신러닝..)
- 데이터가 사람들을 해치지 않게 하고 긍정적 잠재력을 실현하는 방법을 찾아야함
- 동의와 선택의 자유 - 일부만 서비스 사용을 거부할 특권이 있는건?
- 사생활데이터 사용에는 주의를 기울여야..
- 데이터라는 권력으로 레몬마켓을 만들지 말자
- 산업혁명을 반복하면 안됨.
- 각 개인은 스스로 자신을 보호할수있어야함.
