---
layout: post
title: "[데이터 중심 애플리케이션 설계] 05. 복제"
subtitle: "[데이터 중심 애플리케이션 설계] 05. 복제"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 복제 = 네트워크로 연결된 여러 장비에 동일한 데이터의 복사본을 유지한다는 의미
> 복제가 필요한 이유
> - 지리적으로 사용자에게 가까운 위치에 데이터 유지 → latency 감소
> - 높은 가용성
> - 읽기 처리량 확보
> 복제가 어려운 이유
> - 복제된 데이터의 변경처리
> 복제 트레이드오프
> - 동기식복제 vs 비동기식복제
> - 잘못된 복제본 처리 방법
> - 대체로는 db의 설정옵션으로 조정가능


### Leaders and Followers

replica : db의 각 복사본을 저장하는 노드
모든 쓰기는 모든 replica에서 처리되어야함
→ leader-based( = active-passive = master-slave) replication
- 클라의 write 명령어는 leader에게 전송
- leader는 로컬저장소에 새로운 데이터 갱신
- 동시에 replication log나 change stream의 일부로 follower에게 전송
- 각 follower들은 leader와 처리한 것과 동일한 순서로 wrtie 적용
- follower는 로컬 복사본을 갱신

#### Synchronouse vs Asynchronous Replication

동기식 vs 비동기식
- 동기식
  - leader가 follower가 요청을받고 ok신호를 돌려줄때까지 기다림
  - follower가 leader와 일관성있게 최신 데이터 복사본을 가지는것을 보장
  - follower가 응답하지않으면 write가 처리되지않을수있음
  - 현실적 동기식 복제 = 한 follower만 sync로, 나머지는 async로 = 반동기식(semi sync)
- 비동기식
  - leader는 메세지는 전송하지만 follower의 응답을 기다리지는 않음
  - 보통 leader-based replication은 이 방식을 사용
  - 모든 follower가 잘못돼도 leader는 write를 계속 처리 가능

#### Setting up New Followers

- 데이터는 항상 유동적 → 새 follower를 추가할때 복사본이 유효할거라고 보장하기 힘듬
- 가능하면 db를 lock하지 않고 db의 snapshot을 특정 시점에 가져옴
- leader에 연결해 snapshot 이후 발생한 모든 변경을 받아옴
- backlog를 모두 처리하면 caught up된것

#### Handling Node Outages

노드 중단처리하는 방법 (=고가용성을 달성하는 방법)
- Follower failure: Catch-up recovery
  - 보관된 로그의 마지막 transaction을 체크
  - leader에게 끊어진동안의 데이터 변경을 요청
  - catch up
- Leader failure : Failover
  - 리더가 장애인지 판단
  - 새로운 리더를 선택
  - 새로운 리더 사용을 위해 시스템을 재설정

#### Implementation of Replication Logs

leader-based replication의 내부동작 방법들
- statement based-replication
  - leader는 모든 쓰기요청(statement)를 기록하고 쓰기를 실행한 뒤, statement log를 follower에게 전송
  - follower는 전달받은 sql statment를 슬행
  - 복제가 깨질 수 있는 다양한 사례 존재
    - now(), rand() 같은 비결정적 함수구문이 서버마다 다른값을 생성할수있음
    - autoincrementing column 구문이나 db에 있는 데이터에 의존하는 구문은 정확히 같은 순서로 실행되어야함
    - side effect를 가진 구문 (ex. trigger, stored procedures, user-defined functions)은 side effect가 비결정적이면 서버에서 다른 side effect를 생성함
  - leader가 statement log를 기록할때 모든 비결정적 값을 고정값을 반환하게 대체하면 해결가능
  - 그래도 여러 위험성때문에 비선호되는 방법임
  - mysql 5.1 이전버전, voltDB에서 사용되었었음
- write-ahead log(WAL) shipping
  - 일반적으로 모든 쓰기는 log에 기록
  - log는 append only
  - 완전히 동일한 로그를 사용해 달느 노드에서 복제 서버 구축
  - 단점은 log가 제일 저수준의 데이터를 기술해 복제 저장소가 엔진과 밀접해짐
  - 운영상 버전, 엔진별 영향이 적어야 sw upgrade등을 편하게 수행 가능
- Logical (row-based) log replication
  - replication과 storage engine이 서로 다른 로그 형식을 사용하는 방법.
  - 대개 row단위 db table write를 기술한 레코드
    - inserted row : 모든 컬럼의 새로운 값 포함
    - deleted row : row 식별자(pk) 포함. (pk가없다면 모든값 포함)
    - updated row : row 식별자와 컬럼의 새로운 값 포함
  - 여러 row수정시 → 여러 log record를 생성 후 커밋여부를 표시
  - storage engine과 분리된 로그이므로 sw 하위호환성을 더 쉽게 유지할수있음
  - 심지어는 다른 storage engine을 사용할수있음
  - 외부 어플리케이션에서 parsing하기도 쉬움 ⇒ CDC
- Trigger-based replication
  - application layer에서 이루어지는 replication
  - subset만 복제하거나, 다른 종류의 db로 복제하거나, 충돌해소로직이 필요한 경우 사용
  - db log를 읽어 애플리케이션이 데이터를 변경할 수 있게함. → trigger, stored procedure 사용
  - 다른방식보다 overhead가 큼.
  - bug, limitation이 더 큼
  - 유연성이 필요한 경우에 사용.

### Problems with Replication Lag

- read scaling architecture
  - follower를 더 추가함으로써 읽기 처리 성능을 높힐수있음.
  - async replication에서만 동작.
  - follower의 복제가 뒤처지면 과거 데이터를 보는 불일치문제가 생길수있음
  - 단, 불일치는 일시적이고 최종적 일관성을 유지.
  - 일반적으로 이 lag(지연)은 아주 짧은 순간이지만, 커질수있음
  - lag이 커지면 불일치는 real problem이 된다..
- 네트웍이슈 , disk operation이 밀림, 메모리용량 부족..
- 복제 지연이 야기하는 세가지 사례와 해결방법을 살펴보자

#### Reading Your Own Writes

- 사용자가 쓰기 직후에 데이터를 읽는다면 아직 새로 쓴 데이터가 replica에 반영 안돼있을수있음
- read-after-write consistency가 필요
  - 사용자가 수정한 내용을 읽을 때는 leader에서 읽기. 그 외는 follower에서 읽기
  - 마지막 갱신시간을 찾아서 마지막 갱신 후 1분동안은 leader에서 읽기
  - 클라에 last write timestamp를 저장해두고 follower가 최소 해당 timestamp까지 내용을 반영하게함. 아직 catch up 전이라면 대기함.
  - multiple datacenter를 사용한다면 더 복잡해짐. leader가 제공해야하는 모든 요청은 leader가 포함된 datacenter로 라우팅해야함
- cross-divce read-after-write consistency
  - 사용자가 여러 디바이스를 사용하는경우
  - 사용자의 last write timestamp 저장 방식을 쓰려면 메타데이터를 중앙집중식으로 관리해야함
  - leader에서 읽는 요청의 경우, 동일 사용자라면 다른 device라도 동일 datacenter로 라우팅해야함

#### Monotonic Reads

- 단조읽기
- 비동기식에서는 시간이 거꾸로 흐르는(moving backward in time) 현상이 일어날수있음
- 각기 다른replica에서 여러 읽기를 수행할대 발생..
- monotonic read
  - 위와같은 이상현상이 발생하지않음을 보장
  - strong consistency보다는 약하지만 eventual consistency보다는 강한 보장
  - 사용자가 더 최신 데이터를 읽은적이 있다면, 그보다 old한 데이터는 읽지 않음을 보장

<details>

<summary>예시 </summary>

    1. 시간 T1: 사용자 A가 게시글의 **버전 5**를 읽음
    2. 시간 T2: 사용자 A가 다시 게시글을 읽는데, **버전 3**이 보이면 이상함 → ❌ 단조 읽기 위배
    단조 읽기가 보장된다면:
    - 시간 T2 이후에는 항상 **버전 5 이상**만 보이게 됨 → ✅ 일관성 유지

</details>

  - 각 사용자의 읽기가 항상 동일한 replica에서 이루어지게 함.

#### Consistent Prefix Reads

- replication lag은 causality(인과성) 위반을 초래하기도함.
- partitioning(sharding)된 db에서 발생하는 특정적 문제 (각 파티션이 독립적으로 동작하고, 전역적 순서가 없어서 발생할수있음)
- 일관된 순서로 읽기 (consistent prefix reads)
  - 일련의 쓰기가 특정 순서로 발생하면, 사용자는 동일 순서로 쓰여진 내용을 보는것을 보장
  - causality가 있는 write는 동일한 파티션에 기록되도록함.

#### Solutions for Replication Lag

- 복제가 비동기식으로 동작하지만 동기식으로 동작하는 척 하는게 solution
- application layer에서 보장하는 방법이 있지만.. 너무 복잡해서 잘못되기 쉬움
- application layer에서 이런 미묘한 문제를 신경쓰지않고 db를 신뢰할수있는게 best
- → transaction의 존재 이유. → db가 더 강력한 보장을 제공하는 방법
- 그러나 distributed db로 가면서 많은 시스템이 transaction을 포기함.
- 어쩔수 없이 eventual consistency를 사용해야된다?
- 그래도, 대안 메커니즘이 있다! (뒤에서 알아보자)

### Multi-Leader Replication

- leader-based replication은 리더가 하나만 존재하고 모든 쓰기는 해당 리더를 거쳐야함.
- 리더 하나가 망하면 쓰기를 못해버림
- 따라서 write 허용 노드를 하나 이상 두는것으로 확장됨
- → multi-leader (=active/active = master-master) replication
- 각 leader는 동시에 다른 leader의 follower 역할을 함.

#### Use Cases for Multi-Leader Replication

- multi-datacenter operation
  - 각 데이터센터마다 leader가 존재
  - 각 데이터센터 내에서는 leader-follower 복제
  - datacenter간에는 각 센터의 리더가 다른 센터 리더의 변경사항을 복제
  - 성능은 사용자입장에서는 더 좋아보임 (한 데이터센터에서 처리하고, 다른 데이터센터거를 복제해오므로)
  - 동일한 데이터를 다른 두개의 datacenter에서 동시에 변경하는 쓰기충돌이 발생할수있음 → 해소 필요
  - autoincrementing key, trigger, integrity constraints에 문제가 생길 소지가 많음
- clients with offline operation
  - 인터넷이 끊어진 상황(offline)에도 어플리케이션이 계속 동작해야하는 경우.
  - ex. 스마트폰, 노트북 등 장비에서 오프라인에서 변경해도 다음에 온라인상태가 됐을때 동기화
  - 보통 기기의 로컬 DB가 leader처럼 동작
  - 기기안에 replica간 leader복제를 비동기방식으로 수행하는 process가 따로있음
- collaborative editing
  - 동시에 여러사람이 문서를 편집하는 real-time collaborative editing application (ex. 구글 독스)
  - 한 사용자가 문서 편집시 변경된 내용을 즉시 로컬서버에 적용하고 동일한 문서를 편집하는 사용자에게 비동기로 복제해서 보여줘야함
  - 편집충돌을 피하려면?
    - 문서 lock 사용
    - 변경단위를 매우 작게함

#### Handling Write Conflicts

multi-replication의 가장 큰 문제는 쓰기 충돌의 발생 → 충돌 해소가 필요
- Synchronous vs Asyncronous conflict detection
  - single leader DB에서는 첫번째 쓰기가 완료될때까지 두번째 쓰기를 차단 or 대기시킴
  - multi leader DB에서는 두 쓰기는 모두 성공 → 특정 시점에 비동기로 충돌 감지
  - 동기식 충돌감시 : 사용자에게 쓰기 성공을 노티하기전에 모든 replica 복제가 끝나길 기다림 → 하지만 이러면 독립적 쓰기를 허용하는 multi leader의 장점이 없어짐
- Conflict avoidance
  - 충돌을 처리하는 제일 간단한 전략 → 충돌 회피
  - 모든 쓰기가 동일한 leader를 거치도록 application이 보장
  - 데이터센터가 라우팅되는경우에는 충돌회피가 실패할수있음
- Converging toward a consistent state
  - multi-leader는 쓰기순서가 서로 정해져있지않아 최종값이 무엇인지 불명확함
  - 모든 replica는 최종적으로 동일해야함 → 따라서 convergent(수렴)의 방식으로 충돌해소
    - last write wins (LWW) : 각 쓰기에 고유id를 부여하고 가장 높은 id를 승자로 보기
    - 각 복제서버에 고유id를 부여하고 높은 복제서버의 쓰기를 승자로 보기
    - 어떻게든 값을 병합하기 (ex.사전순으로 정렬한 후 연결)
    - 명시적 데이터 구조에 충돌을 기록해 정보를 보존하고, 어플리케이션에 충돌해서 코드를 작성
- custom conflict resolution logic
  - 어떤 충돌해소방식이 이상적인지는 앱마다 다름
  - 앱에서 코드를 사용해 각자 충돌해소  로직을 작성하기..
    - On write : write 중, 충돌을 감지하자마자 충돌핸들러 호출
    - On read : 충돌 감지시 모든 conflict write를 저장. 다음에 읽을때 사용자에게 충돌 내용을 보여줌.

#### Multi-Leader Replication Topologies

- replication topology : 쓰기를 한 노드에서 다른 노드로 전달하는 통신 경로
- all-to-all : 전체 연결 토폴로지. 모든 리더가 각자의 쓰기를 다른 모든 리더에게 전송
- circular : 각 노드가 하나의 노드로 쓰기를 받고 이 쓰기에 자신의 쓰기도 추가하여 다른 노드에 전달
- star : 지정된 루트 노드 하나가 다른 모든 노드에 쓰기를 전달
- 무한 복제 루프를 방지하기 위해 각 노드에 고유 식별자가 있고, 쓰기 전달마다 식별자를 태깅하여 중복태깅을 막음
- circular, start topology는 한 노드에 장애가 나면 다른 노드간 복제흐름에 방해가 될 수 있다는점 (spof)
- 빽빽한 연결의 topology가 내결함성이 훨씬 좋다
- all-to-all topology도 일부 복제메세지가 다른 메세지를 추월해 도착하는 문제가 생길수잇음 → version vector 기법으로 해결가능.

### Leaderless Replication

- 일부 데이터 저장소 시스템은 leader의 개념을 버리고, 모든 replica가 client로부터 쓰기를 직접 받을 수 있게 허용하는 접근 방식을 사용하기도 한다
- ex. AWS Dynamo, cassandra, ..
- coordinator node가 클라 대신 여러 복제서버로 쓰기를 전송하기도함

#### Writing to the DB When a node is down

leaderless에서는 replica 하나가 쓰기를 실패하더라도 장애복구가 필요하지 않음. read요청을 병렬로 여러 노드에 전송해서 만약 outdated된 응답이 섞여있다면 version이 최신인 값을 사용함.
- read repair and anti-entropy
  - replication scheme(복제계획)은 최종적으로 모든 데이터가 replica에 복사된것을 보장해야함.
  - 누락된 데이터를 따라잡기위해서는
    - read repair (읽기복구) : 특정 replica의 응답이 outdated라면 해당 replica에 새로운 값을 다시 기록. → read가 자주 일어나는 경우 적합
    - anti-entropy: background process를 두고, 서버간 데이터 차이를 지속적으로 찾아 누락된 데이터를 복사함. 데이터 복사가 이뤄지기까지 상당한 지연이 있을 수 있음. 읽기가 거의 이뤄지지않는 값을 누락되지 않게 하기 위해 필요함.
- quorums for reading and writing
  -  n개 복제 서버가 잇을때 모든 쓰기는 w개의 노드에 성공해야 쓰기가 확정되고, 모든 읽기는 최소한 r개 노드에 질의해야한다. w+r \> n  이면 읽을때 최신값을 얻을것으로 기대.  ⇒ 정족수
  - 일반적으로 n을 홀수, w = r = (n+1) / 2 로 설정
  - 쓰기가 적고 읽기가 많다면 w=n, r-=1 로 설정하기도함.

#### Limitation of Quorum Consistency

- 보통 r, w는 n/2를 초과하게 선택 → n/2 노드 장애까지 허용해도 정족수를 만족
- w, r를 작게 설정할수록 outdated된 값을 읽을 확률이 높아짐. 그러나 낮은 지연시간과 높은 가용성이 가능함.
- w+r \> n 도 outdated값을 반환하는 edge case가 잇을수있음 ( w, r 노드가 안겹치는경우, 쓰기충돌이 일어나는 경우 등)
- monitoring staleness (최신성 모니터링)
  - 복제가 뒤쳐진 원인 (ex. network issue)를 조사할 수 있게 알려줘야함
  - leader-based replication에서는 lag에 대한 metric을 노출
  - leaderless replication에서는 모니터링이 더 어려움
  - eventual consistency에서 ‘eventual’을 정량화할수있어야함

#### Sloppy Quorums and Hinted Handoff

- 정족수가 있는 DB는 장애복구 없이 개별 노드 장애를 용인
- 따라서 정족수는 내결함성이 없음
- Sloppy Quorums(느슨한 정족수) : n개 노드에 속하지 않더라도, 일단 쓰기를 받아들이고  연결할수있는 노드에 기록하는 방법.
- Hinted Handoff (암시된 핸드오프) : 한 노드가 다른 노드를 위해 일시적으로 수용한 모든 쓰기를 해당 home node로 전송
- → 쓰기 가용성을 높힐수있음.
- multi-datacenter operation (다중 데이터센터 운영)
  - leaderless replication도 동시쓰기 충돌, 네트워크 중단, 지연시간 금증을 허용하기때문에 다중 데이터센터 운영에 적합
  - n개 복제서버수에 모든 데이터센터의 노드가 포함되어야함.

#### Detecting Concurrent Writes

dynamo style DB는 여러 client가 동시에 같은 key에 쓰는것을 허용하기때문에 conflict 발생
문제는 다양한 네트워크 지연, 부분 장애 등의 사유로 실제 쓰기 순서와 다른 순서로 도착할수잇음
eventual consistency를 유지하기 위해 replica들이 동일한 값을 유지하려면 어떻게 해야할까?
- last write wins (LWW)
  - 최종 쓰기 승리.
  - 예전값을 버리고 가장 최신값으로 덮어씀.
  - 그냥 노드기준에서 최신을 써도 되고, timestamp를 비교한다거나..할수도잇음.
  - 안전하게 쓰려면? key를 unique 하고 immutable하게 사용..
- the ‘happens-before’ relationship and concurrency
  - 작업 B가 작업 A에 의존성이 있으면 작업 A는 작업 B 의 Happens-before (이전발생) 임.
- capturing the happens-before relationship
  - 쓰기가 이전 읽기의 버전번호를 퐇마하면 쓰기가 수행되기 이전의 상태를 알 수 잇음.
  - 버전번호를 포함하지 않은 쓰기는 다른 쓰기와 동시에 수행된것이므로 아무것도 덮어쓰지않음.
- merging concurrently written values
  - 이제 클라는 동시에 쓴 값(sibling values)을 합쳐서 정리해야함.
  - 충돌해소하는 방법과 동일
  - 기본적으로는 합집합, 대신 value제거 연산이 있을경우 제거한 버전변호 표시를 남겨둠 (⇒ tombstone)
- version vectors
  - leaderless replication에서는 버전관리방식이 약간 달라짐
  - single version number로는 어려움
  - replica당 version number를 사용해야함
  - 각 replica는 쓰기를 처리할때 자체 버전번호를 증가시키고, 각기 다른 replica의 버전번호도 추적해야함
  - version vector : 모든 replica의 version number collection
  - version vector를 사용하여 덮어쓰기와 동시쓰기를 구분
  - sibling values가 올바르게 병합되는 한, 데이터손실은 없음
