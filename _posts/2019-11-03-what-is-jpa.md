---
layout: post
title: JPA란?
subtitle: JPA란?
categories: programming
tags: spring
comments: true
---

JPA(Java Persistence API)란 자바 객체와 데이터베이스 테이블간의 매핑을 처리하는 ORM(Object Relational Mapping) 기술의 표준. ORM은 특정 언어에 종속적인 개념이 아니라 객체와 RDBMS를 매핑시키는 개념. 이러한 ORM의 개념을 구현하기 위한 표준이 JPA. 

## JPA 장점
1. 개발이 편리하다. - 반복적으로 작성하는 기본적인 CRUD SQL을 직접 작성하지 않아도된다.
2. 데이터베이스에 독립적인 개발이 가능하다. - JPA는 특정 DBMS에 종속적이지 않기때문에 DBMS와 관계없이 개발 가능. DBMS가 변경되더라도 JPA가 해당 DBMS에 맞는 쿼리를 생성.
3. 유지보수가 쉽다. - MyBatis와 같은 Mapper framework를 사용해 개발하면 DBMS 변경시 관련된 쿼리와 코드들을 모두 변경해야함. JPA를 사용하면 객체(JPA Entity)만 수정하면 된다.

## JPA 단점
1. 학습곡선(learning curve)가 크다 - DB위주 개발방식에 비해 배워야할것이 많다. SQL을 직접 작성하지 않아 튜닝시에 어려움이 있다.
2. 특정 DB의 기능을 사용할 수 없다. - 이를테면 오라클에서는 다양한 강력한 함수들을 제공하는데 이를 사용할수없다.
3. 객체지향설계가 필요하다. - 보통은 DB의 테이블을 설계하고 그에 맞춰 설계되기때문에 객체지향설계가 보다 어려울수있다. 


# 스프링데이터 JPA란?
JPA를 스프링에서 쉽게 사용할 수 있도록 해주는 라이브러리

# JPA Annotation
## @Entity
해당 class가 JPA의 Entity임을 나타냄

## @Table(name='table_name')
table_name 테이블과 매핑이 되도록함

## @Id
Entity의 기본키(PK) 임을 나타냄. 

## @GeneratedValue(strategy = GenerationType.AUTO)
기본키의 생성 전략. GenerationType.AUTO의 경우 데이터베이스에서 제공하는 기본키 생성 전략을 따름.

## @Coloumn(nullable = false)
컬럼의 null속성 지정. nullable = true로 할경우 null 값을 허용한다.

## @OneToMany
1:N의 관계를 표현하는 JPA 어노테이션.

## @JoinColumn(name='column name')
relation관계가 있는 column을 지정한다.

# Repository
스프링데이터 JPA에서 제공하는 인터페이스. 보통 repository에서 사용할 domain class와 domain의 id 타입을 파라미터로 받는다. ex) CrudRepository<BoardEntity, Integer> : BoardEntity를 사용하고 Integer 타입의 id를 사용하는 repository. 

## CrudRepository
CRUD(Create, Read, Update, Delete) 기능을 기본적으로 제공.
## PagingAndSortingRepository
CrudReository인터페이스의 기능에 페이징 및 정렬기능이 추가

# Repository 기능
## Query method
Repository 규칙에 맞게 메소드를 추가하면 실행시 메소드의 이름에 따라 쿼리가 생성.  
find...By, read...By, query...By, count...By, get...By 로 시작해야함. By 뒤쪽에는 컬럼 이름으로 구성됨. 예를들면 findByTitle 메서드를 만들면 title로 검색할수있는 쿼리가 자동으로 생성됨. findByTitleAndContents 와 같이 생성하면 title과 contents로 검색 가능. 
## findAllByOrderByBoardIdxDesc 
BoardIdx 로 DESC 내림차순 정렬해 전체조회
## @Query 어노테이션
@Query annotation은 실행하고싶은 쿼리를 직접 정의할수있다. 이때 쿼리는 JPQL이나 데이터베이스에 맞는 sql을 사용할 수 있다. 이때 JPQL에서는 FROM절에 데이터베이스의 테이블이름이 아닌 검색하려는 엔티티의 이름을 사용하니 주의해야함. 변수지정에는 2가지 방식이 있다.
### ?숫자
```
@Query("SELECT file FROM BoardFileEntity file WHERE board_idx = ?1 AND idx= ?2)
BoardFileEntity findBoardFile(int boardIdx, int idx);
```
`?숫자` 형식으로 파라미터를 지정. 메서드의 파라미터 순서대로 `?1`, `?2`에 할당됨. 

### :변수이름
```
@Query("SELECT file FROM BoardFileEntity file WHERE board_idx = :boardIdx AND idx= :idx)
BoardFileEntity findBoardFile(@Param("boardIdx") int boardIdx, @Param("idx")int idx);
```
`:변수이름` 으로 파라미터를 지정함. 일반적으로 사용되는 방법. 변수이름은 메서드의 `@Param` 어노테이션에 대응됨. `:boardIdx` 의 `boardIdx`변수는 `@Param("boardIdx")` 어노테이션이 있는 메서드의 파라미터를 사용. 

## Named Query
@Query 어노테이션으로 관리할때 쿼리문이 길어지거마 많아져 관리가 힘들때 쿼리문을 XML 에 작성하면된다. XML에서 jpql 사용시에는 `<named-query>` , 그냥 sql사용시에는 `<named-native-query>` 태그를 붙여서 사용한다. 사실 이런경우에는 JPA기능을 사용