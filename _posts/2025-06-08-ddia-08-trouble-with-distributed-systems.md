---
layout: post
title: "[데이터 중심 애플리케이션 설계] 08. 분산 시스템의 골칫거리"
subtitle: "[데이터 중심 애플리케이션 설계] 08. 분산 시스템의 골칫거리"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 어떤것이든 잘못 될 가능성이 있으면 잘못된다 <br>분산시스템에서 잘못될지도 모르는 것에 대한 모든 비관적 가정과 회피방법을 알아보자


### Faults and Partial Failures

- 좋은 S/W는 보통 fully functional 하거나 아예 entirely broken됨. → 의도된 동작.
- 잘못된 결과가 더 다루기 어렵고 혼란스러움
- 분산시스템에서  어떤부분은 예측할수 없는 방식으로 고장남 → partial failures
- partial failures는 nondeterministic해서 어려움..
- 심지어는 뭐가 성공이고 실패인지 알기어려울수있음
- nondieterministic과 부분장애가능성이 분산시스템을 다루기 어렵게함

#### Cloud Computing and Supercomputing

- 대규모 컴퓨팅
  - HPC(high-performance computing, 고성능 컴퓨팅) : 단일노드와 유사
  - Cloud Computing : 분산시스템과 유사
- 분산시스템 동작
  - 부분장애가능성을 받아들임
  - 신뢰성없는 구성요소를 사용해 신뢰성있는 시스템 구축
  - 결함처리 필수적
  - 의심, 비관주의, 편집증 필요\^\^

###  Unreliable Networks

- 분산시스템 = 비공유시스템. 네트워크로 연결됨.
- asynchronous packet network - 메세지 도착을 보장하지않음
  - 요청손실
  - 요청 전송 지연
  - 노드 장애
  - 노드 일시중지
  - 응답손실
  - 응답지연
- 흔히 timeout으로 이 문제를 처리.

#### Network Faults in Practice

- 신뢰성있는 네트워크는 “없다”
- 네트워크장비를 중복추가해도 결함은 줄지않는다
- 반드시 네트워크 결함을 견딜수있게 처리할필욘 X
- 네트워크 문제에 어떻게 반응하고, 복구할수 있을지 보장할수 있으면 됨.

#### Detecting Faults

- 결함 노드를 자동으로 감지할 수 있어야함
- 네트워크 불확실성으로 노드 동작여부 판단이 어려움
- 수차례 retry뒤에 타임아웃 내 응답이 없다면 노드가 죽은것으로 선언

#### Timeouts and UnBounded Delays

- 타임아웃은 얼마나 길어야할까? → 간단한 답은 없음
- 장애감지지연 - 이른 타임아웃  trade off..
- max 전송시간 d, 처리시간 r : 타임아웃= 2d+r 가 합리적
- 비동기 네트워크는 unbounded delay가 있어서.. 100프로는 없음..

#### Network congestion and queueing

- 큐 대기는 패킷 지연의 대표적 사유
- 실험적으로 timeout을 선택할수밖에..
- jitter (응답시간 변동성)을 측정해 timeout 자동조절

#### Sync vs Async Network

- telephone network = 동기식
  - circuit 연결
  - 고정된 대역폭
- TCP = 비동기식
  - 가변 대역폭
  - bursty traffic에 최적화

### Unreliable Clocks

- clock, time은 중요
- 분산시스템은 통신이 즉각적이지 않아 시간을 다루기 어려움
- 개별 장비는 자신만의 clock을 가짐
- NTP (Network Time Protocol)로 시간을 동기화하기

#### Monotonic vs Time-of-Day Clocks

- Time-of-day Clock (일 기준 시계)
  - 현재 날짜, 시간 반환
  - NTP로 동기화
  - 로컬시계가 NTP와 크게 차이나면 강제 리셋 → elapsed time 측정에 부적합
- Monotonic Clock (단조시계)
  - 항상 앞으로 흐르는 시계
  - timeout, response time같은 interval 재는데 적합
  - 시계의 절대적인 값은 의미 X

#### Clock Synchronization and Accuracy

- time-of-day clock은 NTP등과 sync 필요
- 그러나 윤초(leap seconds) 등의 사유로 NTP도 신뢰성X
- 자원 때려박아서 PTP, GPS 같은걸 만들던지..

#### Relying on Synchronized Clocks

- 견고한 S/W는 clock이 결함이 생길수 있다는걸 가정하고, 대비해야함
- 모든 장비의 clock 차이를 모니터링하고, 차이가 심한 노드는 죽은것으로 판단하고 제거해야함
- timestamp for ordering events
  - LWW를 쓰든지
  - logical clock (결국 버전벡터?) 쓰든지..해야 충돌해결.
- confidence interval(신뢰구간) 범위로 읽기
- global snapshot 사용시 신뢰구간을 통해 txid를 발행

#### Process Pauses

- 노드가 여전히 leader이고 write할수이쓴ㄴ 상태인지 어떻게 확신할까?
- 다른 노드들로부터 lease를 얻음
- 특정시점에 오직 하나의 leader만 lease를 얻을수있음
- leader가 lease 갱신을 못하면, 다른 노드가 leader를 넘겨받음
- thread는 다양한 이유로 멈출수있음
  - stop-the-world
  - virtual machine의 suspended
  - O/S의 steal time
  - I/O 연산으로 인한 중지
  - disk swapping (paging) 으로 인한 page fault (disk → memory)
  - SIGSTOP으로인한 멈춤
- response time guarantees
  - 항공기, 로켓, 로봇, 자동차 등은 response time gurarantee 중요 → deadline
  - = hard real-time
  - s/w stack 의 모든수준 지원필요
  - RTOS 필요
  - 실시간 ≠ 고성능
- limiting the impact of G/C
  - GC중단시 어플리케이션에 경고
  - 노드는 GC도중에는 아무 요청도 처리 X
  - 혹은 수명이 짧은객체만 gc사용.
  - gc에 old객체 쌓이기 전에 주기적 프로세스 재시작하기.

### Knowledge, Truth, and Lies

- 분산시스템은
  - 공유메모리없음
  - 지연변동이 크고 신뢰할 수 없는 네트워크를 사용
  - 부분장애, 신뢰성없는 시계, 프로세스 중단에 시달림
- 네트워크상의 노드는 어떤것도 확실히알수없음. 추측만가능.
- assumption을 세우고 이를 만족시키는 방식으로 올바른 동작을 증명

#### The Truth is defined by the majority

- 노드는 때에 따라 잘못된 판단을 할 수 있음.
- 노드들끼리 투표해서 quorum을 만족하는 경우만 살아있다고 하기
- The leader and the lock
  - lease를 가진 leader가, 특정 사유로 중단되었을때 lease가 만료되었는지 모르고 활동을 재개
  - write가 충돌하고 데이터가 오염될수있음
- Fencing tokens
  - 자신이 leader라고 믿는 노드가 시스템을 망치지 않도록 보장해야함
  - lease를 승인할때마다 fencing token을 반환한다고 가정
  - token번호가 더 큰 쓰기를 처리했다면, 작은 token의 쓰기 요청은 거부

#### Byzantine Faults

- 가짜 fencing token이 온다면 시스템 결함은 쉽게 생김
- 노드가 ‘거짓말’을 할 위험이 있다면 문제는 어려워짐 = 비잔틴결함
- byzantine fault-tolerant = 비잔틴 내결함성
  - 비행 제어시스템
  - 비트코인, 블록체인
- 비용효울성때문에 이것까지 잘 고려하진 않음..
- 인증, 접근제어, 암호화, 방화벽등의 전통 메커니즘으로 보호
- weak forms of lying
  - hw문제, sw bug, 잘못된 config때문에 발생
  - 이를 보호하는 메커니즘 추가는 worth
  - packet checksum
  - input sanity-checking
  - NTP outlier check

#### System Model and Reality

- hw, sw 에 지나치게 의존적이면 안됨
- 결함의 종류를 정형화해야함
- 타이밍가정
  - synchronous model : 지연, 오차에 제한이 있다고 가정. 비현실적
  - partially synchronous model : 대부분 sync로 동작하지만 종종 async된다고 가정
  - asynchronous model : 타이밍에 대한 어떠한 가정도 하지않음
- 노드장애 가정
  - crash-stop faults : 죽으면 끝
  - crash-recovery faults : 죽고 다시 살아남
  - byzantine (arbitrary) faults : 속이는걸 포함해 무슨일이든 할수있음
- 현실적으로는 partially sync - crash recovery
- correctness of an algorithm
  - uniqueness : fencing token은 같은 값을 반환하지않음
  - monotonic sequence : x \< y 면 tx \< ty
  - availability : fencing token을 요청하고 죽지않은 노드는 응답을 받음
  - 위 세가지 가정을 만족한다면 알고리즘은 해당 시스템 모델에서 정확함
- safety and liveness
  - safety : 안정성. 나쁜일은 일어나지 않는다
    - uniqueness
    - monotonic sequenece
  - liveness 활동성. 좋은일은 결국 일어난다
    - availability
- 결국 실제 구현에서는 불가능하다고 가정했던일이 발생한걸 처리하는 코드를 포함시키게됨..
- 그럼에도 추상 시스템 모델은 현실의 복잡함에서 우리가 추론 가능한, 관리가능한 결함을 추리고 문제를 이해하고 체계적으로 해결할 수 있게 하는데 도움이 됨.
- 알고리즘이 올바르다고 현실도 올바른것은 아니지만, 알고리즘의 증명은 좋은 첫걸음이됨
