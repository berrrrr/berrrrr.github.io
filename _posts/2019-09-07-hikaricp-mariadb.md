---
layout: post
title: hikari CP로 로 MariaDB 사용하기
subtitle: hikari CP로 로 MariaDB 사용하기
categories: programming
tags: spring
comments: true
---

hikari CP로 MariaDB 사용하려면?  

## mariadb datasource 사용
bundle.gradle
```
dependencies {
	compile group: 'org.mariadb.jdbc', name: 'mariadb-java-client', version: '2.2.1'
}
```
application.properties
```
spring.datasource.hikari.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.hikari.jdbc-url=jdbc:mariadb://localhost:3307/dbname?characterEncoding=UTF-8&serverTimezone=UTC
spring.datasource.hikari.username=insight
spring.datasource.hikari.password=insight
spring.datasource.hikari.connection-test-query=SELECT 1
```

## mysql datasource 그대로 사용해도 됨
datasource를 mysql 연동하듯이 입력해도 사용이 가능하다..

bundle.gradle
```
dependencies {
	runtimeOnly 'mysql:mysql-connector-java'
}
```
application.properties
```
spring.datasource.hikari.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.hikari.jdbc-url=jdbc:mysql://localhost:3307/dbname?characterEncoding=UTF-8&serverTimezone=UTC
spring.datasource.hikari.username=test
spring.datasource.hikari.password=test
spring.datasource.hikari.connection-test-query=SELECT 1
```

## log4j jdbc 사용
bundle.gradle
```
dependencies {	
	compile group: 'org.mariadb.jdbc', name: 'mariadb-java-client', version: '2.2.1'
    compile group: 'org.bgee.log4jdbc-log4j2', name: 'log4jdbc-log4j2-jdbc4.1', version: '1.16'
}
```
application.properties
```
spring.datasource.hikari.driver-class-name=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
spring.datasource.hikari.jdbc-url=jdbc:log4jdbc:mariadb://localhost:3307/dbname?characterEncoding=UTF-8&serverTimezone=UTC
spring.datasource.hikari.username=insight
spring.datasource.hikari.password=insight
spring.datasource.hikari.connection-test-query=SELECT 1
```