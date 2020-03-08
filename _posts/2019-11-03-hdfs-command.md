---
layout: post
title: 자주쓰이는 hdfs 명령어 정리
subtitle: 자주쓰이는 hdfs 명령어 정리
categories: datascience
tags: hadoop
comments: true
---


하둡에서 자주 사용하는 명령어는 다음과 같다.

```
hdfs dfs -cat [경로]
```
- 경로의 파일을 읽어서 보여줌
- 리눅스 cat 명령과 동리함

```
hdfs dfs -count [경로]
```
- 경로상의 폴더, 파일, 파일사이즈를 보여줌

```
hdfs dfs -cp [소스 경로] [복사 경로]
```
- hdfs 상에서 파일 복사

```
hdfs dfs -df /user/hadoop
```
- 디스크 공간 확인

```
hdfs dfs -du /user/hadoop
```
- 파일별 사이즈 확인

```
hdfs dfs -dus /user/hadoop
```
- 폴더의 사이즈 확인

```
hdfs dfs -get [소스 경로] [로컬 경로]
```
- hdfs 의 파일 로컬로 다운로드

```
hdfs dfs -ls [소스 경로]
```
- 파일 목록 확인

```
hdfs dfs -mkdir [생성 폴더 경로]
```
- 폴더 생성

```
hdfs dfs -mkdir -p [생성 폴더 경로]
```
 - 폴더 생성, 부모 경로까지 한번에 생성해 준다. 

```
hdfs dfs -put [로컬 경로] [소스 경로]
```
 - 로컬의 파일 hdfs 상으로 복사

```
hdfs dfs -rm [소스 경로]
```
 - 파일 삭제, 폴더는 삭제 안됨

```
hdfs dfs -rmr [소스 경로]
```
 - 폴더 삭제

```
hdfs dfs -setrep [값] [소스 경로]
```
  - hdfs 의 replication 값 수정

```
hdfs dfs -text [소스 경로]
```
 - 파일의 정보를 확인하여 텍스트로 반환
 - gz, lzo 같은 형식을 확인후 반환해줌

```
hdfs dfs -getmerge hdfs://src local_destination
```
- hdfs 경로상의 파일을 하나로 합쳐서 로컬로 가져온다. 
- 리듀스 결과가 여러개일 경우 하나의 파일로 만들기 위해 사용할 수 있다. 
- 주의할 점은 로컬 경로로 가져온다는 것이다. hdfs 상에는 생성 불가이다. 




하둡 명령어 참조
https://hadoop.apache.org/docs/r3.1.2/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html#dfs
