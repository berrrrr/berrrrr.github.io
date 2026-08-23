---
layout: post
title: "[데이터 중심 애플리케이션 설계] 03. 저장소와 검색"
subtitle: "[데이터 중심 애플리케이션 설계] 03. 저장소와 검색"
categories: data
tags: dataengineering
comments: true
---

> **데이터 중심 애플리케이션 설계 시리즈**의 글입니다.

> 데이터베이스가 데이터를 저장하는 방버과 요청했을때 다시 찾을 수 있는 방법을 자세히 알아보자


### Data Structures That Power Your Database

- 가장 간단한 구조를 생각해보면?
  - `db_set key value` : db저장
  - `db_get key` : db로드
  - 이와같이 많은 db들은 내부적으로 log(append-only data file)를 사용
  - `db_get` 은 O(n)의 시간복잡도를 가짐. → 비효율
  - 특정 키의 값을 효율적으로 찾기 위해 다른 데이터 구조 필요 (Index)
- Index (색인)
  - 어떤 부가적인 메타데이터를 유지
  - 다양한 방법으로 검색한다면 다양한 index필요
  - 데이터를 쓸때마다 index도 갱신해야하므로 쓰기과정에서 overhead발생
  - read/write속도간의 trade-off

#### Hash Indexes

- key-value store
- dictionary type과 유사
- hash map(hash table) tkdyd
- in-memory data structure 를 사용한다면?
  - key를 데이터파일의 file byte offset에 매핑
  - 값 조회시 해당 오프셋을 찾아 값을 읽음
  - 키의 값이 자주 갱신되는 상황에 적합.
- append only라 디스크 공간이 부족해진다면?
  - 특정 크기의 segment로 로그를 나누는게 좋은 해결책.
  - segment file들을 compaction(로그에서 중복된 키를 버리고 각 키의 최신 갱신값만 유지)해서 사용
  - compaction 수행시에는 background thread에서 수행
  - 동시에 여러 segment를 병합. → 병합된 결과는 새로운 파일로 만듦
  - 각 segment 는 자체 in-memory hash table을 갖게됨
-  실제 구현에서 중요한 문제
  - file형식 : binary format추천
  - 레코드 삭제 : 특수한 삭제 레코드(tombstone)을 추가.
  - crash recovery: db재시작시 in-memory hashmap은 날아감.. 파일 복원이 가능하나 오래걸림. snapshot드을 사용해 복구 속도를 높힐수잇음
  - paritally written records : 레코드 추가 도중 죽는다면? → checksum등을 사용해 손상부분 탐지
  - concurrency control (동시성제어) : 쓰기 스레드만 쓴다거나..
- append-only 로그가 좋은 설계인 이유
  - appending / segment merging은 sequential한 작업이라, random writes보다 빠름.→ 특히 magnetic spinning-disk hard drive에서 유리.
  - concurrency, crash recovery가 더 쉬워짐
  - segment merging은 데이터파일이 조각화되는 경향이 없음.
- hash table index의 한계
  - key가 너무많으면 문제가됨.(해시충돌)
  - 해시테이블은 범위질의에 효율적이지않음.

#### SSTables, LSM-Trees

SS Table : key로 정렬된 형식 = <span color="blue">**Sorted String Table**</span>
- 장점
  - segment merging시 mergesort방식으로 햇을때 메모리보다 더 큰 파일을 사용 가능.
  - 다중 segment가 동일한 key를 포함한 경우 가장 최근의 값만 유지하고 오래된 값은 버림.
  - 특정 key를 찾을 때 메모리에 모든 키의 index를 유지할 필요 없음
  - sparse in-memory index는 압축된 블록의 시작을 가리킴. → 디스크 공간 + I/O 대역폭 사용 절약
- 생성과 유지
  - 정렬된 구조는 디스크보다 메모리에 유지하는게 쉬움.
  - red-black tree나 AVL tree같은 데이터 구조를 사용하면 임의 순서로 키를 삽입하고 정렬된 순서로 해당 키를 다시 읽을 수 있음.
  - 단 db가 고장나면 디스크에 기록되지 않은 메모리의 테이블(memtable)은 손실될수잇음. → 분리된 log를 디스크상에 유지해야. 나중에 복원할때 사용할수있음.
- LSM Tree 만들기
  - levelDB, RocksDB, key-value store engine library, HBase에 사용되는 알고리즘.
  - <span color="blue">**Log-Structured Merge-Tree**</span>(LSM Tree: 로그 구조화와 병합트리) : log 구조화와 파일시스템의 초기 작업의 기반이 됨.
  - LSM store engine: 정렬된 파일 병합과 compaction 원리를 기반으로 하는 저장소 엔진
  - Lucene : elastic search, Solr에서 full-text search에 사용되는 indexing engine.
    - 검색 질의로 단어가 들어오면 단어가 언급된 모든 문서를 찾음
    - key를 word(term)으로, value를 word를 포함하는 문서의 id리스트로 하는 key-value 구조로 구현.
    - ⇒ 역색인 (inverted index)
  - 성능 최적화
    - db에 존재하지 않는 key를 찾는경우 성능 저하됨(풀스캔해서 없는걸 확인해야하니..)
    - 이를 방지하기 위해 보통 Bloom filter를 사용.

<details>

<summary>bloom filter (블룸필터) : 집합 내용을 근사한 메모리 효율적 데이터 구조</summary>

        이해가 쉽게 예를 들어보자면,

        ```bash
인덱스: 0 1 2 3 4 5 6 7
값     : 0 0 0 0 0 0 0 0
        ```

        - **해시 함수 2개** (예시)
          - h₁(x) = (단어 길이) mod 8
          - h₂(x) = (단어 첫 글자의 알파벳 순서) mod 8
        - **“apple” 추가하기**
          1. 단어 길이 5 → h₁(apple)=5 mod 8 = **5**
          2. 첫 글자 A → 순서 1 → h₂(apple)=1 mod 8 = **1**
          3. 비트 배열의 인덱스 5와 1을 1로 표시

        ```bash
인덱스: 0 1 2 3 4 5 6 7
값     : 0 1 0 0 0 1 0 0
        ```

        - **“apple” 조회하기**
          - h₁(apple)=5, h₂(apple)=1 → 배열\[5\]=1, 배열\[1\]=1
          - **둘 다 1**이니 “있을지도(maybe)”
          - (실제로 넣었으니 “있음”)
        - **삽입**: 해시 함수로 뽑은 칸들을 1로 체크
        - **조회**: 체크된 칸 중 하나라도 0이면 “없음”, 모두 1이면 “있을지도”
        - 메모리는 비트 배열만 쓰고, 어떤 원소가 들어왔는지 따로 저장하지 않음
        - 그래서 \*\*거짓 음성(false negative)\*\*은 절대 없지만,
          해시 충돌로 \*\*거짓 양성(false positive)\*\*은 가끔 발생

</details>

      - key가 db에 존재하지 않음을 알려주므로 불필요한 디스크 읽기를 절약할수잇음
    - SS table을 압축, 병합하는 순서와 시기를 결정하는 다양한 전략 사용
      - size-tiered : 상대적으로더 새롭고 작은 ss테이블을 상대적으로 오래되고 큰 ss테이블에 연이어 병합
      - leveled compaction : 키 범위를 더 작은 ss table로 나누고 오래된 데이터는 개별 level로 이동해 컴팩션을 점진적으로 진행 → 디스크 공간 절약
    - 기본적으로 LSM Tree = background에서 연쇄적으로 ss table을 지속적으로 병합
      - 범위 처리가 유리해짐
      - 매우 높은 쓰기 처리량 보장.

#### B-Trees

- 가장 널리 사용되는 index 구조
  - SS-Table과 같이 정렬된 key-value 쌍을 유지. → 범위 질의에 효율적
  - 4KB(혹은 그 이상)의 고정 크기 block이나 page로 나누고 한번에 하나의 page에 읽기 / 쓰기를 함.
  - ⇒ HW와 밀접한 관련의 설계
  - 한 page가 다른 page를 참조 (포인터, 대신 디스크에 저장됨)
  - key를 찾을때 root에서 시작되어, 최종 개별 키 (leaf page)를 포함하는 페이지에 도달.
  - branching factor(분기계수) : 한 페이지에서 하위 페이지를 참조하는 수. 보통 수백개에 달함
  - 값 갱신시 key를 포함하는 leaf page검색 후, 값을 갱신하고 다음 페이지를 디스크에 다시 기록.
  - 키 추가시 새 키를 포함하는 넘위의 페이지를 찾아 해당 페이지에 키와 값을 추가
  - 새 키를 수용할 페이지에 여유공간이 없으면 페이지 하나를 반으로 나눈 뒤 상위 페이지가 새로운 키 범위의 하위 부분을 알 수 있도록 갱신
  - 이 알고리즘은 트리가 계속 균형을 유지하는것을 보장.
  - n개 key가진 b-Tree는 O(logn)의 깊이 보장. 보통 3\~4단계면 충분.
- 신뢰할 수 있는 B-tree 만들기
  - B-tree의 기본동작 : 새로운 데이터를 디스크상의페이지에 덮어씀(overwrite)
  - 일부 동작은 여러 페이지 덮어쓰기를 필요로함 (ex. 삽입시 페이지가 분할되는 경우)
  - 일부 페이지만 쓰읽게된다면? → orphan page(고아페이지)가 생길수 있어서 위험
  -  복구가능성을 위해, <span color="blue">**WAL**</span>(write-ahead log, 쓰기 전 로그 =redo log) 를 기록. 변경된 내용을 적용 하기 전, 모든 B-tree의 변경 사항을 기록하는 append-only file.
  -  다중 스레드가 B-tree에 접근 할 일이 있다면 신중하게 동시성 제어를 해야함. 보통은 latch(가벼운 lock)로 트리의 데이터 구조를 보호.
  - log구조화 방식은 간단. background에서 모든 병합을 수행하고 때때로 new segment를 old segment로 바꿈.
- B-tree optimization(최적화)
  - copy-on-wirte scheme(COW) 방식 : 원본 데이터를 공유하다가 쓰기 시점에 추가 메모리를 사용하여 복사 한 뒤, 복사본을 수정하는 방식. 트리 상위 페이지는 이 위치를 가르키게됨
  - 저장시 축약한 key를 저장해 공간을 절약
  - leaf페이지를 디스크상에 연속된 순서로 나타나게끔 트리를 배치 (단, 트리가 커지면 순서 유지가 어려움)
  - 트리에 포인터를 추가 (ex. leaf가 양쪽 형제에 대한 참조를 가짐)
  - fractal tree

#### B-Tree vs LSM-Tree

- LSM tree는 쓰기에서 더 빠름
- B-Tree는 읽기에서 더 빠름
- LSM Tree는 압축률이 더 좋음
- B-Tree는 각 key가 index의 한곳에만 존재
- LSM Tree는 다른 세그먼트에 key의 다중 복사본이 존재할수있음
- 강력한 transaction semantic을 제공시에는 B-tree가 더 매력적
- B-tree는 기존 DB 아키텍처에 아주 깊게 뿌리내림
- 그러나 쓰기위주 새로운 db저장소에서는 Log structured index가 점점 인기를 얻고있음

#### Other Indexing Structured

- Primary Key index : pk로 한 row를 고유하게 식별
- Secondary index : 효율적으로 join수행시 결정적인 역할
- index안에 value저장
  - clustered index : index에 row를 바로 저장
  - non clustered index : index에 row의 reference를 저장. (실제 row가 저장된 heap file을 참조)
  - covering index (=index with included column) : index안에 column 일부를 저장
  - clustered index와 covering index는 읽기 성능은 높이지만 쓰기 오버헤드를 높힐수있음
- Multi-column index
  - concatenated index (결합색인) : 하나의 key에 여러 field 를 결합 ex. (성, 이름) - 전화번호
  - multi-dimensional index (다차원 색인)
    - 한번에 여러 컬럼에 질의하는 더 일반적인 방법. 지리공간 데이터에 중요하게 사용.
    - ex. 특정 좌표의 반경 50m 이내 음식점 찾기
    - B-Tree나 LSM-Tree는 이러한 질의에 효율적으로 검색 불가능
    - R-Tree같은 전문 공간 색인을 사용. (ex. PostGIS)
- Full-text search (전문검색) 과 fuzzy index(퍼지 색인)
  - fuzzy query(애매모호한 질의)에는 다른 기술이 필요 ex. 철자가 틀린 단어로 유사한 키 검색
  - 동의어로 질의를 확장
  - 인접해 나타난 단어를 검색
  - 언어학적 테스트 분석해 사용
  - editdistance 를 사용
  - levenshtein automaton : trie 와 유사. 특정 edit distance이내 단어 검색.
- 모든것을 memory에 보관
  - disk = 지속성이 있고 가격이 더 저렴
  - 그러나 ram 가격이 싸짐. → in-memory database 의 개발
  - memcache : 재시작시 데이터 손실. 캐시용도로만 사용
  - 지속성있는 in-memory DB도 개발됨
    - 특수하드웨어(배터리 지속ram 등) 사용
    - 변경사항 로그 기록
    - 디스크에 주기적 snapshot 기록
  - disk 기반 index로 구현하기 어려운 data model 제공
    - ex. redis - priority queue, set
  - anti-caching
    - 최근에 사용하지 않은 데이터를 메모리에서 디스크로 보내고 나중에 다시 접글할때 메모리에 적재하는 방식.
    - 가용 메모리보다 더 큰 데이터셋을 지원하게끔 확장 가능
  - 비휘발성메모리(NVM: non-volatile memory) 기술이 확장될수록 기존 db들의 설계가 변경될것!!

### Transaction Processing or Analytics?

- transaction : 꼭 ACID 속성을 가질 필요는 없음. low latency read/write를 가능하게 하는 처리를 뜻함.
- OLTP (online transaction processing) : 트랜잭션 처리 시스템. index를 이용해 레코드를 찾고 사용자의 입력을 토대로 삽입/갱신하는 패턴.
- data analytic에도 점점 많이 사용되고있음 = business intelligence
- OLAP (online anlaytic processing) : 분석 시스템.  온라인 분석 처리.
<table>
<tr>
<td></td>
<td>OLTP</td>
<td>OLAP</td>
</tr>
<tr>
<td>주요 읽기 패턴</td>
<td>query당 적은 수의 record를 key 기준으로 가져옴. </td>
<td>많은 record에 대한 집계 (aggregate)</td>
</tr>
<tr>
<td>주요 쓰기 패턴</td>
<td>random-access, low-latency write from user input</td>
<td>bulk import (ETL), or event stream</td>
</tr>
<tr>
<td>주요 사용처</td>
<td>end user/consumer via web application</td>
<td>internal analyst, for decision support</td>
</tr>
<tr>
<td>데이터 표현</td>
<td>latest state of data</td>
<td>history of events</td>
</tr>
<tr>
<td>데이터셋 크기 </td>
<td>GB or TB</td>
<td>TB or PB</td>
</tr>
</table>

#### Data Warehousing

- 분석가들이 OLTP작업에 영향을 주지 않고 마음껏 질의할 수 있는 개별 데이터베이스
- 다양한 OLTP시스템에 있는 데이터의 읽기 전용 복사본
- ETL(extract-transform-load) : data warehouse로 데이터를 가져오는 과정
- 분석 접근 패턴에 맞게 최적화할수있음

**OLTP Database vs Data warehouse**
- sql 은 둘다 지원
- OLTP는 transaction processing 지원
- data warehouse는 analytic workload지원

#### **Stars and snowflakes : Schemas for Analytics**

- OLTP에서는 필요에따라 다양한 데이터모델을 사용
- OLAP에서는 star schema(dimensional modeling) 라는 정형화된 방식을 사용
- fact table : 특정시각에 발생한 event. 다른 컬럼은 dimension table의 foreign key reference.
- dimension은 who, when, where, what , how, why를 나타냄
- fact table이 가운데 있고 dimension table이 이를 둘러싸고있는 모양 = star schema
- snowflake schema : star schema의 변형. 차원이 하위 차원으로 더 세분화됨.

### Column-Oriented Storage

- 각 컬럼을 모두 한곳에 저장하는 방식
- 질의에 사용되는 컬럼만 읽고 구문을 분석
- 각 컬럼 파일에 포함된 모든 row가 같은 순서인점에 의존해, 특정 row를 만드려면 칼럼별 특정 index의 값을 가져와 합치면 한 row가 완성된다

#### Column compression

- 데이터를 압축하면 디스크 처리량을 더 줄일 수 있음
- column-oriented storage는 압축에 적합함. 동일 컬럼에서는 많은 값이 반복해서 나타나기때문.
- ex. bitmap encoding

**메모리 대역폭과 벡터화 처리**
- 디스크로부터 메모리로 데이터를 가져오는 대역폭이 큰 병목
- column-oriented storage는 CPU cycle을 효율적으로 사용하기에 적합
- ex. 압축된 컬럼데이터를 cpu cache에 딱 맞는 사이즈로 가져온 뒤, 이 작업을 tight loop에서 반복
- bit연산자 (AND, OR)는 압축된 컬럼을 바로 연산할수있음. → vectorized processing

#### Sort order in column storage

- 컬럼저장소에서는 순서가 그닥 중요하지않음
- 보통 삽입된 순서로 저장하는 방식이 가장 easy
- 그러나 order를 도입해 색인 메커니즘으로 사용할수는있음
- 첫번째 칼럼에서 같은 값을 가진 row들의 정렬 순서를 두번째 컬럼에서 정함
- ex. 같은날짜에 판매한 제품을 그룹화
- 정렬은 컬럼압축에도 도움이 됨. 정렬 후에 같은값이 연속될확률이 높기때문.

**다양한 순서 정렬 **
- 다양한 질의는 서로 다른 정렬순서의 도움을 받음
- 데이터를 다양한 방식으로 정렬하여 따로 저장
- 복제데이터를 서로 다른 방식으로 정렬해 저장. → 질의 처리시 질의 패턴에 가장 적합한 버전을 사용

#### Writing to column storage

- data warehouse의 대부분의 작업은 읽기전용 질의
- 압축, 정렬 모두 읽기최적화 기여. 쓰기는 어렵게 만듬.
- update-in-place는 압축컬럼에서 불가능. (하나의 작업이 모든 row에 영향을 미침)
- 그렇다면? 메모리저장소에 쓰기작업을 따로 저장한 뒤, 충분한 쓰기가 모이면 칼럼 파일에 병합하고 대량으로 새로운 파일에 기록.

#### Aggregation

- 보통 데이터 분석 질의에는 aggregation function이 많이 사용됨 ( count, sum, avg..)
- 자주 사용하는 count나 sum 을 캐시한다면? ⇒ materialized view (구체화 뷰)
- 원본데이터 갱신시 materialized view도 갱신됨
- data cube (OLAP cube) :  materialized view의 특별 사례.
  - ex. 한 축은 date, 한 축은 product인 2차원테이블
  - 날짜+제품을 결합한 aggregation을 얻을 수 있음
  - 날짜별 제품 판매량, 제품별 특정 날짜 판매량 등..
  - 예시외에 일바적으로는 2차원 이상의 aggregation테이블을 생성.
- 미리 계산된 값을 사용하여 aggregation 조회가 매우 빠름
- 단점은 원시데이터에 질의하는것과 동일한 유연성이 없음.
