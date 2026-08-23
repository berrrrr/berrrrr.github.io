---
layout: post
title: "[데이터 중심 애플리케이션 설계] 11. 스트림 처리"
subtitle: "[데이터 중심 애플리케이션 설계] 11. 스트림 처리"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 시간의 흐름에 따라 점진적으로 생산된 데이터를 처리하는 스트림 처리에 대해 알아보자


- Batch processing (일괄처리)
  - 입력으로 파일 집합을 읽어 출력으로 새로운 파일 집합을 생성하는 기술.
  - 입력을 사전에 알려지 유한한 크기로 한정
  - 현실의 데이터는 계속 계속 생산됨.  (거의 무한함)
  - 따라서 Batch processor는 인위적으로 data chunk를 나눠야함
  - 입력의 변화가 하루가 지나야 반영됨
- Stream processing (스트림처리)
  - 이벤트를 발생할대마다 처리
  - stream = 시간흐름에 따라 점진적으로 생산된 데이터
    - java FileInputStream
    - file system API
    - lazy lists
    - stdin, stdout
    - TCP connection ..
- Event Stream
  - 데이터 관리 메커니즘
  - 입력된 데이터를 점진적으로 처리

### Transmitting Event Streams

- input : record = event.
  - 파일을 분석해 sequence of record로 변환함
  - 이벤트 발생 timestamp를 포함. (time-of-day clock)
  - ex. 상품 구매 이벤트
  - ex. cpu metric
- event
  - text string, JSON, binary 등으로 encoded됨
  - 이벤트를 파일에 저장하거나 rdb에 저장하는식으로 기록
  - encoding한 후 network로 전송하기도함
  - producer가 한번 이벤트를 만들면 복수의 consumer가 처리
  - 저장소가 있으면 연결 가능 (생산자: write, 소비자: poll)
  - polling의 오버헤드를 생각해서 datastore 설계해야함
  - rdb trigger등..

#### Messeging System

- 이벤트 주고받을때 사용되는 일반적인 방법
- 생산자 : 이벤트 포함 메세지 전송
- 소비자 : 메세지를 소비
- publish / subscribe 접근법
  - 생산자가 소비자 메세지가 처리하는 속도보다 빠르게 메세지를 전송한다면?
  - 노드가 죽거나 일시적 오프라인이 된다면? 손실되는 메세지가 있을까?
- 생산자에서 소비자로 메세지 직접 전달
  - 중간노드 없이 네트워크 직접 통신
  - UDP
  - Zero MQ
  - statsD (datadog?)
  - webhook
  - 메세지 유실 가능성을 고려해야함 (소비자 오프라인 등)
- message broker ( = message queue)
  - message stream을 처리하는데 최적화된 db의 일종
  - 생산자: 브로커로 메세지 전송
  - 소비자: 브로커에서 메세지 읽기
  - 지속성문제를 브로커에 몰빵
  - 디스크에도 메세지 기록 (쟁애대비)
  - 소비자는 비동기로 동작
- message brokers vs database
  - db는 삭제전까지 데이터 보관 / 브로커는 소비자에 데이터 배달시 자동으로 메세지 삭제
  - 브로커는 메세지를 빨리 지워서 작업 집합이 작다고 가정
  - db : secondary index지원 / broker : topic 부분집합을 구독
- multiple consumer
  - load balancing : 메세지는 소비자중 하나로 전달됨. 소비자는 임의로 지정됨.
  - fan out : 메세지는 모든 소비자에게 전달됨.같은 입력을 다른 작업이서 처리.
  - 두가지 패턴은 함께 사용 가능. (consumer group)
- 확인응답과 재전송
  - 소비자가 메세지를 처리하지못하거나 장애나는 경우 있음. 이때 메세지를 잃어버리지 않기 위해 브로커는 acknowledgements(확인 응답)을 사용.
  - 클라는 메세지처리 끝낫을때 명시적으로 알려야함 (commit)
  - 메세지순서에 영향을 미칠수있음 (따라서 인과성이 있으면 문제가될수있음)

#### Partitioned Logs

- message 처리는 확인응답을 받으면 메세지 바로 삭제
- db의 지속성있는 저장방법 + 메시징 시스템의 짧은 지연시간을 조합할수없을까?
- = log-based message broker
- 로그를 사용한 메세지 저장소
  - 생산자가 보낸 메세지는 로그 끝에 추가
  - 소비자는 로그를 순차적으로 읽음
- 처리량을 높이기 위해 log partitnioning 사용 → 다른 파티션은 독립적으로 읽고 쓰기 가능
- 파티션 내 offset을 기록
- fanout 방식으로 제공됨.
- 메세지를 병렬로 처리하고싶음 + 순서 중요하지않음 = JMS/AMQP
- 처리량이 많고 순서가 중요함 = log based
- consumer offset
  - 주기적으로 기록됨
  - offset까지 메세지를 처리했다는 의미
  - log sequence number와 유사
  - 장애시 마지막 기록된 offset부터 메세지 처리
- disk space usage
  - 로그를 여러 조각으로 나누고 오래된 조각을 삭제하거나 cold storage로 이동
  - = circular buffer = ring buffer
  - 로그 처리량은 일정
- 소비자가 생산자를 못따라갈때
  - 메세지 버리기
  - 버퍼링
  - 배압적용 (=큐에 메세지를 천천히 보내도록 조절)
- replaying old messages
  - offset을 변경해 쉽게 replay 가능
  - 일괄처리와 유사
  - = dataflow구축에 good

### Database and Stream

- log-based broker는 db에서 아이디어를 얻어 메세징에 적용
- 반대로, 메세징/스트림에서 아이디어를 얻어 db에 적용도 가능
- event = 특정시점에 발생한 사건을 기록한 레코드
- 복제로그 = db기록 event stream
- state machine replication도 event stream의 일종

#### Keeping Systems in Sync

- 한 데이터가 db, cache, datawarehouse등 여러곳에 복제됨
- 이들간 동기화가 필수
- batch processing (data dump)하기
- dual write(이중기록)하기
  - race condition 발생가능
  - 불일치 발생

#### Change Data Capture (CDC)

- db 의 모든 데이터 변화를 관찰해 다른 시스템으로 데이터 복제
- 변경내용을 스트림으로 제공하면 유용
- 구현
  - debezium
  - AWS DMS
  - 보통은 비동기방식으로 동작
  - 복제지연문제 발생
    - 데이터 불일치
    - 시간역전
    - 인과성위반
- 로그 컴팩션
- 변경 스트림용 api 지원
  - kafka connect : kafka를 cdc에 활용
- 이벤트발송
  - transactional outbox pattern
    - db처리 + 카프카 바ㅓㄹ송
    - db 처리 + 카프카 이벤트 테이블에 저장 + 그걸 카프카로 발송

#### Event sourcing

- CDC와 event sourcing은 유사한면이있음
- applciation 상태 변화를 모두 변경 이벤트 로그로 저장 (append-only)
- 사용자의 행동을 불변이벤트로 기록
- 이벤트 로그에서 현재 상태 파생
  - 어플리케이션은 이벤트로그를 가져와 사용자에게 보여줄수있는 상태로 변환해야함
  - replay를 통해 상태 재구성
- commands and events
  - 사용자의 요청 = 명령 (command)
  - 무결성이 검증되고 명령이 승인되면 → command는 event가 됨.
  - 명령의 유효성은 이벤트가 되기 전 동기식으로 검증
  - 혹은 이벤트를 나눠 비동기식 검증
    - 좌석예약
      - 가계약 이벤트
      - 확정이벤트

#### State, Streams, and Immutability

- 불변셩은 이벤트소싱과 cdc를 강력하게만듬
- 상태 = 이벤트의 마지막 결과
- 모든 changelog는 바뀌는 상태를 표현함
- 상태 = event stream 적분
- 변경스트림 = 시간으로 상태 미분
- 불변성 장점
  - ex. 원장(ledger)
  - 감사 대응가능
  - 현재 상태보다 많은 정보를 포함하게됨
- 동일 이벤트 로그로 여러가지 뷰 만들기
  - 이벤트로그에서 가변상태를 분리하면 여러 읽기전용 뷰 만들수있음
  - 새 기능 추가가 쉬움 (기존시스템 수정 X)
  - 명령과 질의 책임분리(CQRS)
    - command query responsibility segregation
    - 데이터 쓰는형식 / 읽는형식 분리
    - 다양한 읽기 뷰 허용
  - 질의 형식과 기록 형식은 꼭 같을 필요가 없다
  - 읽기 최적화 뷰는 데이터를 비정규화하는것이 합리적
- 동시성 제어
  - 이벤트로그의 소비가 비동기로 이뤄짐
  - 사용자에게 지연된 상태를 보여줄수있음
  - 해결방법
    - 읽기뷰 갱신 + 로그이벤트 추가를 동기식으로 수행 (분산트랜잭션)
    - 이벤트로그로 현재상태 만들기
    - 파티션 내 이벤트 직렬 순서 정의 → 비결정성 제거
- 불변성의 한계
  - 갱신/삭제가 잦은 데이터셋은 히스토리가 너무 커지거나 파편화문제 발생 가능
  - 관리상의이유로 데이터를 삭제해야만 하는 경우가 발생할수있음 (ex. 민감정보..)
  - 적출(exicision) 혹은 셔닝(shunning) : 데이터를 처음부터 없엇던것처럼 처리..

### Stream processing

- 스트림 처리 방법
  - 이벤트데이터를 db or cache or index 등에 기록하고 클라는 여기에 질의
  - 이벤트를 사용자에게 직접 보냄
  - 입력스트림을 처리해 출력 스트림을 생산
- 파생스트림 생성
  - 연산자(operator) 혹은 작업(job) 이 스트림 처리
  - 일긱전용방식으로 입력 스트림을 read한 후 방식으로 다른곳에 출력을 write (append only)

#### Uses of Stream Processing

- 특정 상황이 발생하면 조직에 경고하는 모니터링 목적
  - 신용카드 패턴탐지
  - 시장 가격변화 감지
  - 기계 오작동 감지
- 복잡한 이벤트 처리 (Complex event processing, CEP)
  - 스트림 분석용으로 개발된 방법
  - 특정 이벤트 패턴을 검색하는 어플리케이션에 적합
  - sql이나 gui사용하기도함
  - 질의하고, 매치되면, complex event를 방출
  - db와는 반대로 동작
    - db : data를 영구적으로 저장, 질의를 일시적으로 다룸
    - cep : 질의를 오랜기간 저장, 스트림은 지속적으로 질의를 흘러 지나감
- 스트림 분석
  - 대량의 이벤트를 집계하고 통계적 지표를 뽑음
  - 일반적으로 고정된 시간 간격(window) 기준으로 계산
  - 확률적 알고리즘(ex. bloom filter)을 사용하기도함
- materialized view 유지
  - 이벤트 로그로 만들어지는 어플리케이션 상태는 일종의 materialzied view임
  - 임의 시간범위 내 모든 이벤트가 필요
- search on streams
  - cep외에도 복잡한 기준으로 검색이 필요한 경우가 있음
  - ex. elastic search의 percolator(여과)기능
  - 질의를 저장하고 스트림마다 검색
  - 때로는 질의를 indexing하기도함
- message passing  을 RPC 대안으로 쓸수도잇음

#### Reasoning About Time

- stream processor는 종종 시간을 다루게됨
- 이벤트의 timestamp를 봐야함
- 보통 stream processor는 장비의 시스템 시계를 사용
- event time vs processing time
  - 실제 이벤트 시간보다 처리시간이 차이가 많이 발생하면 문제가 생김
  - 큐 대기, 네트워크 결함, race condition 등으로 발생 가능
  - 순서예측이 틀릴수있음
  - 이벤트시간과 처리시간을 혼동하면 좋지않은 데이터가 만들어짐
- knowing when you’re ready
  - 윈도우 정의 시 이벤트가 끝났는지 계속 들어오는지 확신이 어려워 힘듬
  - 윈도우를 이미 종료한 후에 도착한 낙오자 이벤트를 처리할 방법이 필요
    - 낙오자 이벤트 무시
    - 수정값을 발행
- whose clock ar you using?
  - event timestamp = 실제 사용자와 상호작용이 발생한 시각
  - 사용자가 제어하는 장비시계를 항상 신뢰하기 어렵긴함
  - 세가지 timestamp를 모두 로그에 남기는것도 방법
    - 이벤트 발생시간
    - 이벤트를 서버로 보낸 시간
    - 서버에서 이벤트를 받은 시간
- types of windows
  - tumbling window :   데이터를 겹치지 않는 고정 길이의 시간 구간으로 연속 분할해 배치 처리
  - hopping window : 고정 길이의 윈도우를 일정 간격으로 시작시켜 겹치도록 배치 처리
  - sliding window: 매 이벤트마다 해당 시점부터 과거 일정 시간 범위의 데이터를 실시간 집계
  - session window : 이벤트 간 비활성 시간(gap)을 기준으로 동적으로 세션 단위 윈도우 생성<br>

#### Stream Joins

- stream-stream join (window join)
  - join을 위한 적절한 window선택이 필요
  - stream processor는 state를 유지해야함
  - ex. 지난 시간에 발생한 모든 이벤트를 session id로 indexing
- stream-table join (stream enrichment)
  - db정보로 stream을 강화(enrichment)함
  - ex. 사용자정보 - db / 사용자이벤트정보 - stream
  - 메모리에 올리거나 색인을 로컬디스크에 넣거나 등..
  - 이 복사본은 최신상태로 유지되어야함
- table-table join (materialized view maintenance)
  - ex. tweet / follow
  - materialized view를 유지하여, 해당 뷰에 질의
  - 질의 결과의 캐시를 데이터가 변할때마다 갱신
- time-dependence of joins
  - 셋 모두 stream processor가 하나의 조인 입력을 기반으로한 특정 상태를 유지하고, 다른 조인 입력에서 온 메세지에 그 상태를 질의하는 방식
  - 상태유지하는 이벤트 순서는 매우 중요
  - 시간의존성이 발생
  - 복수개의 스트림에 걸친 이벤트 순서가 결정되지 않으면 조인결과도 비결정적
  - 보통 조인 레코드의 특정버전을 가리키는 유일한 식별자를 사용해 해결

#### Fault Tolerance

- stream processor가 어떻게 결함에 견딜수있을까
- stream은 무한해서 처리를 완료할수없으므로 이를 기다릴수도없음
- Microbatching and checkpointing
  - 스트림을 작은 블록으로 나누고
  - 각 블록을 소형 일괄처리와 같이 다룸.
  - = microbatching
  - batch processing과 같이 excatly-once semantic
  - 그러나 실패시에는 .. 재시작이 불가능
- atomic commit revisited
  -  excatly-once semantic을 유지하려면?
  - 처리가 성공했을때만 모든 출려고가 이벤트 처리의 부수효과가 발생해야함
  - atomic 하게 모두 일어나거나 / 모두 일어나지 않거나.
  - stream processing framework 내에서 상태변화와 메세지를 관리해 transaction을 내부적으로 유지
- idempotence(멱등성)
  - 멱등연산 = 여러번수행해도 오직 한번 수행한것과 같은 효과를 내는 연산
  - 여분 메타데이터로 연산을 멱등하게 만들수있음
  - trigger한 메세지 offset을 함께 포함해 갱신여부를 확인해서 반복갱신을 막음.
- rebuilding state after a failure
  - 상태가 필요한 스트림 처리는 실패 후에도 해당 상태가 복구됨을 보장해야함
  - 원격 데이터 저장소에 상태를 유지하고 복제
  - stream processor의 local에 상태를 유지하고 주기적으로 복제
  - 실패시 복제된 상태를 읽어 처리 재개
  - 한마디로 snapshot 방식..
  - 혹은 윈도우가 작다면 그냥 이벤트 replay해도 충분히 빠름
  - infra 성능에 따라 선택하면됨.
