---
layout: post
title: "[데이터 중심 애플리케이션 설계] 07. 트랜잭션"
subtitle: "[데이터 중심 애플리케이션 설계] 07. 트랜잭션"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> transaction = 어플리케이션에서 몇개의 읽기와 쓰기를 하나의 논리적 단위로 묶는 방법


- commit / abort 존재
- 어플리케이션상의 오류처리가 단순해짐
- 안정성을 보장해줌
- 속도는 느려짐

### The Slippery Concept of a Transaction

- 트랜잭션은 이점(지속성)과 한계(가용성)이 있음
- trade-off를 잘 알고 써야함

#### The Meaning of ACID

- ACID
  - Atomicity 원자성
  - Consistency 일관성
  - Isolation 격리성
  - Durability 지속성
- DB마다 ACID구현이 제각각임
- ACID는 단순한 마케팅 용어임
- 각 용어에 기술적으로 지향하는바를 정리하자면 아래와같음

원자성
- 여러 쓰기작업이 하나의 원자적 단위로 묶였을때, 커밋될수 없다면 모두 abort되어야함
- 이로인해 데이터 정합성이 깨질 염려가 적어짐.
- = 잘 abort하는 능력. abortability가 더 정확

일관성
- 데이터는 항상 진실이어야하는 invariant(불변식)이 있음
  - ex. UK 제약
  - ex. FK 제약
- 이 일관성을 유지하도록 transaction을 잘 정의해야함
- 어플리케이션의 속성(책임)임.

격리성
- 동일데이터에 동시에 접근하는 동시성문제
- 동시에 실행되는 transaction은 서로 격리되어야함

지속성
- transaction이 commit됐다면 결함이 발생해도 데이터는 손실되지않는다는 보장
- 비휘발성 저장소에 기록되었다는 뜻. (복구수단을 동반)
- 지속성 보장하려면 복제완료시까지 기다려야함
- 완벽한 지속성은 존재하지않음

#### Single-Object and Multi-Object Operations

- 원자성/격리성 - 클라가 한 transaction에서 여러번쓰기를하면 db는 어떻게동작하는가?
  - 원자성 : 오류시 abort
  - 격리성: 각 transaction은 서로 방해하면안됨
- multi-object transaction은 어떤 읽기연산과 쓰기연산이 동일한 transaction에 속하는지 알아야함
  - RDB는 `BEGIN TRANSACTION` \~ `COMMIT` 으로 구분
  - 비RDB는 연산을 잘 묶지 않음 (⇒ 부분갱신될 여지가잇음)
- Single object writes
  - 보통 한 노드 single object수준 원자성/격리성 제공
  - 동시에 쓰기시도가 있지 않을때 쓰기 반영
  - transaction은 아님 (보통 multi에 적용되는걸 의미)
-  The need for multi-object transactions
  - 분산db는 대부분 포기함
  - 필요하긴함.
  - 원자성/격리성 구현필요
- Handling errors and aborts
  - 오류시 abort 라는 철학을 모든 db가 따르진않음
  - 오류복구는 애플리케이션의 책임으로..
  - abort transaction retry는 효과적이지만 완벽하지는 X
    - 재시도 중복
    - 과부하가 원인일때 재시도는 현상을 악화시킴
    - abort sideeffect
    - retry fail시 데이터손실

### Weak Isolation Level

- Concurrency Issue(race condition)
  - 트랜잭션이 다른트랜잭션에서 동시에 변경한 데이터를 읽음
  - 두 트랜잭션이 동시에 같은 데이터를 변경
- Concurrency Bugs
  - 타이밍문제
  - 운이없을때만 촉발
  - 테스트로 발견 어려움
  - 재현이 어려움
- Transaction isolation
  - concurrency issue를 감춤
  - serializable isolation(직렬성 격리) : 트랜잭션을 직렬로 실행
  - 구현이 어려움.. → 보통 weak isolation level 사용

> 동시성 문제에 은탄환은 없음. concurrency issue의 종류를 잘 이해하고 방지하는 방법을 배울 필요가 있다

#### Read Committed

- 가장 기본적인 수준의 transaction isolation
- no dirty reads
  - dirty read = 커밋되지 않은 데이터를 읽는것
  - 일부만 갱신된 데이터를 읽는 혼란을 막을수있음
  - 나중에 롤백될수도있는 데이터를 보이는 혼란을 막을 수 있음
- no dirtye writes
  - dirty writes : 커밋되지 않은 변경을 이후 쓰기작업에서 덮어쓰는것
  - 먼저 실행된 transaction이 commit / abort 되기 전까지 두전빼 쓰기를 지연시킴
- Implementing
  - read commited = 매우 널리 쓰이는 격리수준
  - 보통 row수준 lock을 사용해 dirty writes 방지
  - 그러나 잠금대기때문에 응답시간이 느려짐

#### Snapshot Isolation and Repeatable Read

- nonrepeatable read : 같은 row를 다시읽을때 값이 바뀌는현상
- read skew : 관련된 여러 행 사이에 불일치 발생 (이체계좌 / 입금계좌 금액 불일치)
- 보통은 잇을수 있는 일로 ㅇㅋ해줌.
- 감내할수없는경우도 있음.
  - backups
  - analytic queries and integrity check
- Implementing
  - dirty write를 막기 위해 write locks 사용
  - read할때는 lock 없음
  - readers never block writers, and writers never block readers
  - lock 경쟁 없이 일상적으로 write가능
  - 일관성잇는 snapshot에 대해 long query 수행 가능
  - MVCC(multi-versin concurrency control) : 객체마다 커밋된 버전 여러개를 유지
    - txid
    - created_by
    - deleted_by
- Visibility rules for observing a consistent snapshot
  - txid로 어떤 스냅샷을 볼지 결정
  - 이미 커밋된 트랜잭션만 읽음
  - 대상객체가 삭제로 표시되지 않음 (or 삭제 트랜잭션이 있어도 아직 커밋되지않음) 만족시 읽음
- Indexes and snapshot isolation
  - 심플하게는.. index가 객체의 모든 버전을 가리키게 한 뒤, query 가 현재 transaction에서 볼수 없는 버전을 걸러냄
  - 성능을 올리고싶다면?
    - 동일객체의 다른버전을 같은 page에 저장되게함 → index갱신 회피
    - append-only B-tree : 특정 root = 해당 시점의 snapshot

#### Preventing Lost Updates

- lost update (갱신손실) : 쓰기작업이 동시에 일어나 두번째 쓰기 작업이 첫번째 변경을 포함하지 않고 변경이 수행됨
- atomic write operations (원자적 쓰기 연산)
  - 한 operation에서 read-modify-write  한번에 순차적으로 실행되도록 강제함.
  - concurrency-safe
  - 객체를 읽을때 해당 객체에 대한 exclusive lock(독점적인 잠금) 획득
- Explicit locking (명시적 잠금)
  - application에서 갱신할 객체를 명시적으로 lock
  - race condition 유발하기 쉬움
- Automatically detecting lost updates
  - read-modify-write 병렬실행을 허용. 대신 lost updates가 탐지되면 abort후 retry.
  - snapshot isolation과 결합하면 효율적으로 수행됨
- Compare-and-set
  - 마지막으로 읽은 후로 변경되지않았을대만 갱신을 허용
  - 현재값 ≠ 이전에 읽은값이면 갱신반영 X, retry
- Conflict resolution and replication
  - 여러 replica에 대해서도 lost updates를 막아야함..
  - replica에는 lock, compare-and-set 적용 불가능.
  - sibling 생성한 뒤 사후에 병합.
  - LWW(last write wins) : 갱신손실 발생하기 쉬움..

#### Write skew and Phantoms

- write skew:  두개 이상 트랜잭션이 같은 조건을 검사하고 서로 다른 객체를 수정할때 각 트랜잭션 안에서는 유효하지만 전체 시스템 상에서는 제약조건을 위반하게 되는 상황.
- 해결하려면 결국 serializable isolation(직렬성격리)가 필요. 차선으로는 row lock.
- phantom : 어떤 트랜잭션에서 실행한 쓰기가 다른 트랜잭션의 검색 질의 결과를 바꾸는 효과
- 보통 팬텀이 까다로운 쓰기스큐를 유발하게됨
- materializing conflict(충돌 구체화) : 충돌을 유발하는 구체적인 row를 정의하고 (select for update) 이를 위반하면 잠금 충돌이 일어나도록함.

### Serializability

- 충돌의 명시적 해답은 결국, 직렬성 격리(serializable isolation)
- 동시성없이 한번에 하나씩 직렬로 실행되도록 보장
- 모든 경쟁조건을 막아줌

#### Actual Serial Execution

- 램값이 싸져서 단일스레드에 트랜잭션 실행이 가능해짐.
- cpu코어 하나로 처리해야하므로 트랜잭션이 구조화되어야함.
- Encapsulating transactions in stored procedure
  - 상호작용식 트랜잭션은 네트워크통신에 많은 시간을 소비
  - 트랜잭션 코드 전체를  stored procedure형태로 db에 미리 제출
  - 필요 데이터를 메모리에 모두 올리고 작업 수행
  - deterministic해야함
- partitioning
  - 트랜잭션 처리량이 단일cpu코어속도로 제한됨..
  - 여러 코어/노드로 확장하기위해 data를 partioning해 사용
  - coordinating이 필요할가능성이 높음..복잡해짐

#### Two-Phase Locking (2PL)

- lock requirements가 훨씬 강함
- 쓰기 트랜잭션은 다른 쓰기/읽기 트랜잭션을 막음.
- implementation
  - shared mode / exclusive mode 존재
  - 읽기를 원한다면 공유모드 잠금을 획득
  - 읽다가 쓰려면 shared → exclusive로 upgrade
  - 쓰기를 원한다면 독점모드 잠금을 획득
  - 트랜잭션이 잠금 획득 후에는 종료될때까지 잠금을 유지해야함
  - 1단계 : 트랜잭션 실행하며 잠금 획득
  - 2단계: 트랜잭션 종료하며 잠금 해제
  - deadlock발생시? db가 감지하고 하나를 강제로 abort
- performance
  - 성능이 구림..
  - 처리량 / 응답시간 매우 bad
- predicate locks
  - 팬텀을 막기위해 조건으로 lock을 거는거
  - 2PL이 predicate lock을 포함하면 → serializable isolation
- index-range locks
  - predicate lock이 잘 동작하기 어려움.. (확인에 시간 오래걸림)
  - 현실적으로 index-range locking 을 사용 (\~= predicate lock)

#### Serializable Snapshot Isolation (SSI)

- 직렬성 격리 + 좋은성능을 공존하려면? → SSI
- pessimistic concurrency control
  - 비관적 동시성제어
  - 뭔가 잘못될거같으면 안전해질때까지 기다림.
  - 2PL, mutex, serial execution
- optimistic concurrency control
  - 낙관적 동시성 제어
  - SSI
  - 뭔가 잘못될거같으면 괜찮아질거라는 가정하에 계속 진행
  - 일단 시도하고 잘못된거면 abort 후 retry.
  - 성능이 더 좋은 경향이 있음.
- snapshot isolation 기반.
- serialization conflict를 감지해  abort시킬 트랜잭션을 결정.
- oudated premise를 감지하려면?
  - stale MVCC version을 읽었는지 감지
  - 과거의 읽기에 영향을 미치는 쓰기 감지
- performance
  - trade-off : transaction read/write 추적 detail 정도와 속도
  - 2PL에 비해 다른 트랜잭션의 잠금을 기다릴 필요가 없음
  - 읽기전용 질의는 consistency snapshot 위에서 빠르게 수행가능
  - 단일 cpu처리량에 제한되지않음
  - abort ratio 중요함
