---
layout: post
title: "[Modern Java In Action] 12. JAVA에서 날짜/시간API 다루기"
subtitle: "[Modern Java In Action] 12. JAVA에서 날짜/시간API 다루기"
categories: programming
tags: java
comments: true
---

- Java 8에서 새로운 날짜, 시간 라이브러리 제공 이유
- 사람이나 기계가 이해할 수 있는 날짜, 시간 표현 방법
- 시간의 양 정의하기
- 날짜 조작, 포매팅, 파싱
- 시간대와 캘린더 다루기

## 12.1 날짜와 시간 (사람 이해 가능)

### LocalDate

- 날짜를 표현하는 불변 객체
- 시간대 정보를 포함하지 않음
- 정적 팩토리 메서드 of 로 인스턴스를 만들 수 있음

```java
LocalDate date  = LocalDate.of(2017, 9, 21); // 2017-09-21
int year        = date.getYear();           // 2017
Month month     = date.getMonth();          // SEPTEMBER
int day         = date.getDayOfMonth();     // 21
DayOfWeek dow   = date.getDayOfWeek();      // THURSDAY
int len         = date.lengthOfMonth();     // 30 (9월의 일수)
boolean leap    = date.isLeapYear();        // false (윤년이 아님)

// 현재 날짜 정보
LocalDate = LocalDate.now();

// Enum ChronoField를 이용해서 명시적으로 get 메소드 이용 가능
int y   = date.get(ChronoField.YEAR);
int mon = date.get(ChronoField.MONTH_OF_YEAR);
int d   = date.get(ChronoField.DAY_OF_MONTH);
```

### LocalTime

- 시간을 표현
- LocalDate와 비슷하게 사용

```java
LocalTime time = LocalTime.of(13, 45, 20);
int hour = time.getHour();
int minute = time.getMinute();
int second = time.getSecond();
```

### 문자열로 인스턴스 만들기

YYYYMMDD 나 YYYY-MM-DD 같은 형식의 날짜 스트링은 LocalDate/LocalTime 객체로 파싱할수있다. 

```java
LocalDate date2 = LocalDate.parse("2017-09-21");
LocalTime time2 = LocalTime.parse("13:45:20");
```

밑에서 parse 에대해 더 자세히 다룸 

### LocalDateTime

- LocalDate, LocalTime을 쌍으로 갖는 복합 클래스

```java
// 2017-09-21T13:45:20 표현 방법
LocalDateTime dt1 = LocalDateTime.of(2017, Month.SEPTEMBER, 21, 13, 45, 20);
LocalDateTime dt2 = LocalDateTime.of(date, time);
LocalDateTime dt3 = date.atTime(13, 45, 20);
LocalDateTime dt4 = date.atTime(time);
LocalDateTime dt5 = time.atDate(date);

// 날짜, 시간 추출
LocalDate date3 = dt1.toLocalDate();
LocalTime time3 = dt1.toLocalTime();
```

## 12.2 날짜와 시간 (기계 용)

사람은 보통 주, 날짜, 시간, 분으로 날짜와 시간을 계산

기계의 관점에서는 연속된 시간에서 특정 지점을 하나의 큰 수로 표현하는 것이 가장 자연스러움

### Instant

- 유닉스 에포크 시간(1970년 1월 1일 0시 0분 0초 UTC)를 기준으로 특정 시점까지의 초를 표현
- 나노초(10억분의 1초)의 정밀도를 제공
- 사람이 읽을 수 있는 정보를 제공하진 않음
    - 예시) Instant.now().get(ChronoField.DAY_OF_MONTH); 는 예외 발생시킴.
- Duration, Period 클래스와 함께 활용

```java
Instant instant = Instant.ofEpochSecond(3); // 기준시 +3초
System.out.println(instant);         // 출력: 1970-01-01T00:00:03Z
System.out.println(Instant.now());   // 출력: 2021-03-09T02:39:53.630Z

// 두번째 인수로 나노초 보정이 가능, 아래 표현은 기준시 +3초와 동일함
Instant.ofEpochSecond(2, 1000000000);
```

### Duration

- 두 시간 객체 사이의 지속 시간 (간단히 말해, **시간상의 거리**라고 할수있음. 시각이 아닌, 시간! 을 의미함.)
- 초, 나노초의 시간 단위를 쓰기 때문에 LocalDate를 사용할 수 없음

```java
Duration d1 = Duration.between(time, time2);
Duration d2 = Duration.between(dt1, dt2);
Duration d3 = Duration.between(instant1, instant2);

Duration threeMinutes = Duration.ofMinutes(3);
Duration fourMinutes  = Duration.of(4, ChronoUnit.MINUTES);
```

### Period

- 날짜 지속 시간에 사용 (= **날짜상의거리**)

```java
Period tenDays = Period.between(LocalDate.of(2017, 9, 11),
                                LocalDate.of(2017, 9, 21));

Period oneDay                   = Period.ofDays(1);
Period threeWeeks               = Period.ofWeeks(3);
Period twoYearsSixMonthsOneDay  = Period.of(2, 6, 1); // 2년 6개월 하루 만큼의 시간간극
```

## 12.3 날짜 변경(날짜연산)

### 날짜 조정

- LocalDate는 불변 객체이므로 실제로 고쳐지는 것은 아니고 복사본이 생기는 것.

```java
// 절대적 방식으로 변경
LocalDate ld1 = LocalDate.of(2017, 9, 21);
LocalDate ld2 = ld1.withYear(2021);
LocalDate ld3 = ld2.withDayOfMonth(25);
LocalDate ld4 = ld3.with(ChronoField.MONTH_OF_YEAR, 3);

// 상대적 방식으로 변경
LocalDate ld11 = LocalDate.of(2017, 9, 21);
LocalDate ld12 = ld11.plusWeeks(1);
LocalDate ld13 = ld12.minusYears(6);
LocalDate ld14 = ld13.plus(6, ChronoUnit.MONTHS);
```

### 더 복잡한 날짜 조정

- 오버로드된 with 메서드에 좀 더 다양한 동작을 수행할 수 있는 `TemporalAdjuster`를 전달
    - `TemporalAdjusters` 에서 제공하는 정적 팩토리 메서드 이용

```java
LocalDate ld21 = LocalDate.of(2021, 3, 9);
LocalDate ld22 = ld21.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
LocalDate ld23 = ld22.with(TemporalAdjusters.lastDayOfMonth());
```

→ 뿐만 아니라 TemporalAdjuster 인터페이스를 직접 구현하여 커스텀도 가능하다. 

## 12.4 날짜, 시간 출력과 파싱

- 포매팅과 파싱 전용 `java.time.format`이 새로 추가 됨

### DateTimeFormatter

YYYYMMDD 나 YYYY-MM-DD 같은 형식의 날짜 스트링은 LocalDate 객체로 파싱할수있다. 

```java
// 포매팅 출력
LocalDate ld31 = LocalDate.of(2021, 3, 9);
String s1 = ld31.format(DateTimeFormatter.BASIC_ISO_DATE);
// -> 출력: 20210309
String s2 = ld31.format(DateTimeFormatter.ISO_LOCAL_DATE);
// -> 출력: 2021-03-09

// 파싱
LocalDate ld32 = LocalDate.parse("20210325", DateTimeFormatter.BASIC_ISO_DATE);
LocalDate ld33 = LocalDate.parse("2021-03-25", DateTimeFormatter.ISO_LOCAL_DATE);
```

DateTimeFormatter 에서는 굉장히 많은 날짜타입을 제공하고있다. 

### 패턴으로 포매터 만들기

규정된 패턴 외에도 아래와같이 내가 원하는 패턴으로 포매터를 만들어 사용할수있다. 

```java
// 포매터 만들고 사용
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate ld41 = LocalDate.of(2021, 3, 25);
String formattedDate = ld41.format(formatter);

// 파싱
LocalDate ld42 = LocalDate.parse(formattedDate, formatter);
```

### 포매터 빌더 사용하기

이런식으로 빌더패턴사용해서 포매터만들수도있다. 

```java
DateTimeFormatter italianFormatter = new DateTimeFormatterBuilder()
        .appendText(ChronoField.DAY_OF_MONTH)
        .appendLiteral(". ")
        .appendText(ChronoField.MONTH_OF_YEAR)
        .appendLiteral(" ")
        .appendText(ChronoField.YEAR)
        .parseCaseInsensitive()
        .toFormatter(Locale.ITALIAN);

LocalDate ld51 = LocalDate.of(2021, 3, 25);
String italianFormattedDay = ld51.format(italianFormatter);
// -> 출력: 25. marzo 2021
```

## 12.5 시간대와 캘린더 활용 방법

- `java.time.ZoneId` 클래스가 새롭게 등장
    - 서머타임(DST, Daylight Saving Time) 같은 복잡한 사항이 자동으로 처리 됨
    - 마찬가지로 불변 객체

### 시간대(Time zone)

- 표준 시간이 같은 지역을 묶어서 시간대를 정의
- ZoneRules 클래스에서는 약 40개 정도의 시간대 존재
- ZoneId는 '{지역}/{도시}' 형식
    - IANA Time Zone DB 제공 지역
        - [https://www.iana.org/time-zones](https://www.iana.org/time-zones)

```java
ZoneId romeZone = ZoneId.of("Europe/Rome");
System.out.println(romeZone.getRules());
// -> 출력: ZoneRules[currentStandardOffset=+01:00]

ZoneId seoulZone = ZoneId.of("Asia/Seoul");
System.out.println(seoulZone.getRules());
// -> 출력: ZoneRules[currentStandardOffset=+09:00]

ZoneId zoneId = TimeZone.getDefault().toZoneId();
System.out.println(zoneId);
// -> 출력: Asia/Seoul
```

### 시간대 적용된 날짜와 시간

```java
LocalDate ld61 = LocalDate.of(2021, 3, 25);
ZonedDateTime zdt1 = ld61.atStartOfDay(romeZone);
// -> 출력: 2021-03-25T00:00+01:00[Europe/Rome]

LocalDateTime ldt1 = LocalDateTime.of(2021, 3, 25, 13, 45);
ZonedDateTime zdt2 = ldt1.atZone(romeZone);
// -> 출력: 2021-03-25T13:45+01:00[Europe/Rome]

Instant i1 = Instant.now();
ZonedDateTime zdt3 = i1.atZone(romeZone);
```

### UTC/Greenwich 기준의 고정 오프셋

- UTC(Universal Time Coordinated) - 협정 세계시 / GMT(Greenwich Mean Time) - 그리니치 표준시
- 때로는 위 기준 시를 기점으로 시간대를 표현하기도 한다.
- "뉴욕은 런던보다 5시간 느리다" (런던은 0도, 뉴욕은 본초 자오선 기준 서쪽에 있으므로 -)

    → ZoneOffset newYorkOffset = ZoneOffset.of("-05:00");

- 그러나 위와 같은 방식으로는 서머타임을 제대로 처리 못하므로 권장하지 않음.