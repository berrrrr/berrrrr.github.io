---
layout: post
title: 유용한 hive query 모음
subtitle: 유용한 hive query 모음
categories: data
tags: dataengineering
comments: true
---


##  임시테이블 (raw data 저장)테이블 생성
```
CREATE EXTERNAL TABLE test.eaxmple_table
(date string, data string)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
LOCATION '/test/db/eaxmple_table'
TBLPROPERTIES ('skip.header.line.count'='1');
```


## 집계테이블생성

```
DROP TABLE IF EXISTS test.eaxmple_table_agg;

CREATE TABLE IF NOT EXISTS test.eaxmple_table_agg (data string)
PARTITIONED BY ( date string )
STORED AS PARQUET
TBLPROPERTIES ('parquet.compression'='snappy');

SHOW CREATE TABLE test.eaxmple_table_agg;

ALTER TABLE test.eaxmple_table_agg ADD IF NOT EXISTS PARTITION (dt='20191224');

INSERT OVERWRITE TABLE test.eaxmple_table_agg PARTITION ( dt='20191224' )
SELECT to_date(date), data FROM test.eaxmple_table_agg where to_date(date)=to_date('2019-12-24');

select * from test.eaxmple_table_agg where date = '20191224';
```

## json table 생성
```
DROP TABLE IF EXISTS test.eaxmple_table_json;
CREATE EXTERNAL TABLE test.eaxmple_table_json
( 
	`time` STRING,
	`log` STRING
)ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
STORED AS TEXTFILE
LOCATION '/test/db/eaxmple_table_json';
```

## json 집계테이블 생성 및 데이터삽입

```
DROP TABLE IF EXISTS test.eaxmple_table_json_agg;

CREATE TABLE IF NOT EXISTS test.eaxmple_table_json_agg (
`time` STRING,
`log` STRING
)
PARTITIONED BY ( `time` STRING )
STORED AS PARQUET
TBLPROPERTIES ('parquet.compression'='snappy');

SHOW CREATE TABLE test.eaxmple_table_json_agg;

ALTER TABLE test.eaxmple_table_json_agg ADD IF NOT EXISTS PARTITION (`time`='20200109');;

INSERT OVERWRITE TABLE test.eaxmple_table_json_agg PARTITION ( `time`='20200109' )
SELECT `time`, `log` FROM test.eaxmple_table_json where to_date(`time`)=to_date('2020-01-09');

```

## ALTER 쿼리
```
ALTER TABLE invites ADD COLUMNS (new_col2 INT COMMENT 'a comment')
```

## table의 컬럼명 리스트 가져오기
```
describe database.tablename;
```
(컬럼명만 가져옴) 

## table 의 상세정보 가져오기
```
describe formatted test.eaxmple_table;
```
( 테이블의 컬럼, external 테이블 여부, 만든시간, 포맷정보, 저장위치, 등등 다나옴) 


## 테이블 있는지 없는지 체크하기
```
USE {db명};
SHOW TABLES LIKE '{테이블명}';
예)
USE test;
SHOW TABLES LIKE 'example_table';
```

## partition table에 특정 partition 이 있는지 확인하기
```
show partitions {table} partition(`{partition column}`="{partition column value}")
```

## 특정 partition 삭제
```
ALTER TABLE test.eaxmple_table DROP PARTITION (dt='2020--0-1-');
```

## 파티션별 count 보기
```
select dt, count(*) 
from test.eaxmple_table
where dt >= '2020-02-01'
group by dt;
```

## multi depth로 구성된 json구조에서 객체얻기 
``` json
{
  "time": "2020-07-19T23:01:52.400361591Z",
  "kubernetes": {
    "pod_name": "test_pod",
  },
  "log": "2020-07-20 08:01:52.400 test log"
}
```
이런 데이터를 조회한다고하면

```
select * from `test.example_table` WHERE `dt`='20200720' and `hr`='08' AND get_json_object(`pod_name`,'$.kubernetes') = 'test_pod';
```
이렇게 사용해준다.

## get_json_object 할때 특문 치환하기
```
select get_json_object(regexp_replace(data, '@timestamp', 'timestamp'), '$.timestamp')
from test.example_table;
```
`@` 같은 특문있어서 조회 안될때 ㅠㅠ 