---
layout: post
title: "[데이터 중심 애플리케이션 설계] 10. 일괄 처리"
subtitle: "[데이터 중심 애플리케이션 설계] 10. 일괄 처리"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 일괄처리(batch processing)은 신뢰할수있고 확장 가능하며 유지보수하기 쉬운 어플리케이션을 구축하는데 매우 중요한 요소


- Services (online systems)
  - 클라로부터 요청이나 지시가 올때까지 기다림
  - 가능한 빨리 요청을 처리해 응답
  - 중요 성능지표 : 응답시간
- Batch processing systems (offline systems)
  - 매우 큰 입력 데이터를 받아 데이터를 처리하는 작업을 수행
  - 결과 데이터를 생산
  - 사용자는 작업이 끝날때까지 대기하지않음 (오래걸리므로)
  - 중요 성능지표 : 처리량 throughput
- Stream processing systems (near-real-time systems)
  - 온라인 / 오프라인의 중간 = near-real-time
  - 요청에대해 응답하지않고 입력데이터를 소비, 출력데이터를 생산
  - 입력이벤트 발생 직후에 바로 작동
  - batch system보다 지연시간 낮음

### Batch Processing with Unix Tools

#### Simple Log Analysis

- awk, sed, grep, sort, uniq, xargs 등의 유닉스 도구로 쉽게 분석 가능

#### The Unix Philosophy

- 파이프로 프로그램을 연결하는 아이디어
- 각 프로그램이 한가지 일만 하도록 작성
- 모든 프로그램의 ouput은 다른 프로그램의 input이 될 수 있음
- 빠르게 써볼 수 있게 설계하고 구축
- 도구를 적극 사용
=
- automation
- rapid prototyping
- incremental iteration
- being friendly to experimentation
- braking down large projects into manageable chunks
⇒ agile, devops 에도 적용되는 철학

unix에 결합성을 부여하는 요소들
- a uniform interface
  - 서로 입출력 호환가능해야함
  - unix는 file을 interface로 사용
  - 유닉스만큼 uniform interface가 잘되어있는 s/w는 매우 드뭄.
- Separation of logic and wiring
  - unix tools는 stdin, stdout 사용
  - pipe는 한 프로세스의 stdout을 다른 프로세스의 stdin과 연결
  - 중간데이터는 in-memory buffer 사용해 전송
  - 프로그램은 입력이 어디서 들어오고 출력이 어디로 나가는지 알필요없음
    - = loose coupling
    - = late binding
    - = IoC (inversion of control)
- Transparency and experimentation
  - 진행상황 파악이 쉬움
  - 입력파일은 불변으로 처리됨
  - 언제든지 파이프라인 중단 가능
  - 특정 파이프라인의 output을 파일로 저장하여 input으로 활용 가능. (중셉)

### MapReduce and Distributed Filesystems

- unix tool과 비슷하면서 수천대의 장비로 분산해 실행이 가능
- HDFS의 file을 input/output으로 사용
- HDFS(haddop distributed filesystem) = GFS(google file system)을 재구현한 오픈소스
- share-nothing 원칙
- 각 장비에서 실행되는 daemon process로 구성
- daemon process는 다른 노드가 해당 장비의 파일에 접근 가능하게끔 네트워크 서비스 제공
- namenode (=중앙서버)는 특정 파일블록이 어떤 장비에 저장됏는지 추적
- 장애에 대비해 파일블록은 여러 장비에 복제됨 (erasure coding방식 사용)
- HDFS는 확장성이 뛰어남

#### MapReduce Job Execution

- MapReduce = HDFS와 같은 분산 파일 시스템 위에서 대용량 데이터셋을 처리하는 코드를 작성하는 programming framework
- 처리패턴
  1. input file 읽어서 record로 쪼갬
  2. 각 record마다 mapper function으로 key - value 추출 ( = Map)
  3. sort
  4. reduce function 호출 (=같은 key의 record수 count)  ( = Reduce)
- callback function 구현
  - Mapper : 모든 input record마다 한번씩 호출. key-value 추출. 정렬에 적합한 형태로 데이터를 준비
  - Reducer : 같은 key record를 모아서 output record를 생산. 정렬된 데이터를 가공.
- Distributed execution of MapReduce

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/ddia-10-batch-processing/01.png?raw=true)

  - mapreduce는 병렬로 수행하는 코드를 따로 작성하지 않아도 여러 장비에서 동시처리가 가능
  - putting the computation near the data (데이터 가까이에서 연산하기) : 보통 스케쥴러는 입력파일이 있는 장비에서 작업을 수행.
    - 네트워크를 통해 파일을 복사하는 부담이 없음
    - 네트워크 부하 없음
    - 지역성 증가
  - map task count : 입력파일 블록수로 결정
  - reduce task count : 사용자가 설정
  - key의 hash값을 사용해 동일 key는 동일 reducer가 처리
  - 데이터셋이 매우 크므로 보통 sorting은 단계를 나눠서 수행됨
  - shuffle : reducer가 mapper로부터 자기 partition에 해당하는 데이터를 fetch 한 뒤, 복사한 데이터를 key 기준으로 sorting을 유지하며 merge
- MapReduce workflows
  - mapreduce작업 하나로 해결할수잇는 문제는 제한적
  - 따라서 mapreduce작업을 연결해 workflow로 구성하는게 일반적
  - airflow등의 스케쥴러로 mapreduce작업간 의존성 관리

#### Reduce-side Joins and Grouping

- 여러 데이터셋에서 한 레코드가 다른 레코드와 연관이 있는것은 일반적 (FK, doc reference, edge..)
- join 은 필수적.. (비정규화의 한계)
- map reduce는 index(색인)개념이 없음
- batch processing에서 join = full scan임.
- batch processing에서 throughput을 늘리기 위해서는 가능한 한 장비 내에서 연산을 수행해야함
- 보통 데이터를 동일 hdfs상에 존재하게 옮겨서 데이터를 모아 효율적으로 처리
- sort-merge join : mapper output이 key로 정렬된 후 reducer가 양측의 record를 merge

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/ddia-10-batch-processing/02.png?raw=true)

- group by
  - 같은 key를 가진 모든 레코드로 group을 만드는 연산은 일반적  (ex. Count, Sum, Top K.. )
  - mapper가 group by 대상을 key로 mapping
  - reducer는 같은 key를 가진 record로 추가 연산
  - sessionization (A/B test)등에 활용
- Handling skew
  - linchpin object (= hot key) 가 있으면 동일 key를 동일 장소에서 처리하기 쉽지않음
  - 한 reducer가 혼자 많은 레코드를 처리하게됨.
  - 해결하기위한 알고리즘
    - skwed join : sampling으로 hot key를 찾고, hot key record는 임의 reducer로 보냄
    - shared join : hot key를 명시적으로 지정해 임의 reducer로 보냄
    - hive : hot key를 metadata에 명시하고, 해당 레코드는 별도 파일로 저장하여 map-side join으로 처리
    - 이렇게 나눠서 처리된 리듀서들 값들은 다시 결합하는 작업을 거침

#### Map-Side Joins

- 여러 join알고리즘은 reducer에서 수행됨 (=reduce-side join)
  - 장점 : input data에 대한 특별한 가정이 필요없음
  - 단점 : reduce input을 merge하는 비용이 상당히 큼
- map-side join
  - input data에 특별한 가정이 가능하다면 수행
  - reduce side join보다 빠름
  - 축소된 map reduce
- Broadcast hash joins
  - 매우 작은 데이터셋과 매우 큰 데이터셋을 조인하는 경우 사용
  - 매우 작은 데이터셋을 in memory hash table에 적재
  - mapper는 큰 데이터셋을 스캔할때 hash table을 사용해 조회
  - 혹은 hash table 대신에 local disk에 read-only index로 저장하기도함.
- Partitioned hash joins
  - map-side join의 input을 partitioning해 hash join 접근법을 각 파티션에 독립적으로 적용
  - 각 mapper의 hash table에 적재할 데이터 양을 줄일수있음
  - 단 join할 두 입력 모두를 같은 key, hash function기반으로 같은 수로 파티셔닝해야함
  - = bucketed map join
- Map-side merge join
  - 같은 key를 기준으로 sorting되었다면 사용 가능
  - mapper에서 merge연산을 수행
  - 선행 mapreduce 작업이 이미 데이터를 partitioning / sorting 해둬야 사용가능..
- MapReduce workflows with map-side joins
  - mapside join 이냐 reduce side join에 따라 출력구조가 달라짐
    - reduce-side join : join key로 partitioning, sorting
    - map-side join : 큰 입력과 동일한 방법으로 partitioning, sorting
  - 결국 map-side join은 여러 제약조건이 존재 → metadata 가 중요.
  - HCatalog나 Hive metastore등으로 metadata관리하기도..

#### The Output of Batch Workflows

- building search indexes
  - 구글은 처음에 검색엔진에 사용할 index구축을 위해 mapreduce를 사용했음
  - ex. 특정 키워드가 포함된 문서ID를 찾기
  - index file - 불변
  - index 문서집합이 변한다면? index workflow재수행
  - 혹은 증분색인 구축
- Key-value store
  - classifier나 recommendation system 등을 구축할수있음
  - batch process output을 새 저장소에 저장
- Philosophy of batch process output
  - unix철학 반영
    - 프로그램은 입력을 읽어 출력을 내놓는다
    - 입력은 변하지 않고 새 출력이 이전 출력을 교체한다
    - no side effect
  - 좋은 성능 + 유지보수 간단

#### Comparing Hadoop to Distributed Databases

- hadoop \~= unix의 distributed version
- MapReduce는 사실 이미 MPP(대규모 병렬처리) DB에서 구현됐던것들임
- MPP
  - analsysis sql query를 병렬로 수행하는것에 초점
  - 특정 model을 따라 데이터를 구조화해서 다룸.
  - SQL 질의 소프트웨어가 이미 탑재되어잇음
  - query중에 한 장비만 죽어도 전체  query가 중단
  - disk에서 데이터 읽는 비용을 피하기 위해 최대한 메모리에 데이터를 유지
- hadoop
  - 아무 프로그램이나 실행가능한 OS와 비슷
  - file을 다룸. 어떤 model과 encoding을 사용해도됨.
  - 내가 원하는  SQL 질의 엔진을 hadoop위에 구축할수있음
  - MPP DB에서는 불가능한 접근법들을 구현가능
  - map or reduce실패를 견딜수있음
  - 데이터를 되도록 disk에 기록함
  - 대용량 작업에 더 적합

### Beyond MapReduce

- MapReduce는 distributed system에서 가능한 여러 programming model 중 하나
- 데이터에 따라 다런 도구가 더 적합할수도잇음.

#### Materialization of Intermediate State

- MapReduce작업은 다른 작업과 모두 독립적
- 그러나 보통 한 작업의 output은 다른 작업의 input이 됨
- 이 경우 distributed system의 file들은 Intermediate state(중간상태)임.
- materialization(구체화) : 중간상태를 파일로 기록하는 과정 (여러 단점 존재)
  - 선행작업이 완료되었을때만 시작 가능
  - mapper가 중복될수잇음
  - 중간상태 파일은 여러 장비에 걸쳐 복제됨 → 공간낭비..
- dataflow engine
  - map reduce단점을 해결하기 위한 엔진
  - spark, flink …
  - 전체 workflow를 독립된 하위 작업으로 나누지 않고 작업 하나로 다룸
  - operator를 통해 유연한 방법으로 함수를 조합
  - 최적화로 인해 수행속도가 훨씬 빠름
- fault tolerance
  - 중간상태를 구체화하면 내구성은 높아짐
  - 태스크실패해도 다른장비에서 금방 재실행가능..
  - spark, flink등 중간상태 쓰지않는 엔진들은 유효한 데이터로부터 재계산해서 복구
  - operator과 deterministic하게 구성되어야함

#### Graphs and Iterative Processing

- batch processing 관점에서 graph를 살펴보는것은 good
- ex. 추천엔진, 랭킹시스템 = graph 처리 필요.
- ex. pagerank
- node / edge가 포함된 file형태로 저장
- “ 완료할때까지 반복 “ ⇒ mapreduce로 표현이 안됨.
- 따라서 보통 iterative style로 구현.
  1. batch processing 수행
  2. 종료조건 체크
  3. 안끝났으면 다시 1번으로 돌아감
- 비효율적
- The Pregel processing model
  - batch processing graph를 최적화 하는 방법
  - BSP (bulk synchronous parallel)
  - 한 node는 다른 node로 메세지를 보낼수잇음
  - node는 반복해서 사용한 memory state를 기억하고있음.
  - 새로들어오는 메세지만 처리함.
  - 반복이 끝나는 시점에 node 상태를 checkpoint로 저장 → 내결함성보장

#### High-Level APIs and Languages

- engine for distributed batch processing도 성숙해짐
- high level dataflow API로 쉽게 데이터분석 가능해짐
- 코드를 적게 작성해도됨
-  대화식 사용도 지원함
- declarative query language
  - query optimizer가 내장되어있어 적절한 조인 알고리즘을 선택해줌
  - 선언적인 방법으로 조인을 지정하면 알아서 optimizer가 수행해줌
  - 분석, 통계 등 라이브러리들 활용 가능
  - filtering, mapping연산을 선언하면 optimizer가 컬럼기반 layout을 이용해 필요 컬럼만 읽음
- specialization
  - 통계학, 수치 알고리즘등 지원
  - k-nn같은 유사도검색알고리즘 지원
