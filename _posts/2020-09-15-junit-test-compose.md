---
layout: post
title: '[JUnit] 테스트 조직'
subtitle: '[JUnit] 테스트 조직'
categories: programming
tags: spring
comments: true
---

테스트코드를 잘 조직하고 구조화할 수 있는 JUnit 기능을 알아보자

## 1. AAA로 테스트 일관성 유지
### 1-1. Assignment (준비)
테스트 코드를 실행하기 전에 시스템이 적절한 상태에 있도록함. (ex. 객체생성, 사전 준비에 필요한 api 호출 등)

### 1-2. Act (실행)
테스트 코드를 실행. 보통 단일 메서드를 호출함

### 1-3. Assert (단언)
실행한 코드가 기대한 대로 동작하는지 확인. 실행한 코드의 반환값 검사, 새로운 객체의 상태 검사. 

### 1-4 After (사후) - Optional
테스트를 실행할 때 어떤 자원을 할당 했다면 잘 정리되었는지 확인

## 2. 동작테스트 vs 메서드 테스트
단위테스트를 작성 할 때는 먼저 전체적인 시각에서 시작해야함.    
개별 메서드를 테스트 하는것이 아니라 클래스의 종합적인 동작을 테스트해야함.  

ex) ATM 기의 테스트코드를 작성한다면?  
메서드테스트 - deposit(). withdraw(), getBalance()등 메서드를 테스트.. -> 의미가 없다! 
동작테스트 - makeSingleWithdrawl(), makeMultipleWithdrawls, atteptToWithdrawTooMuch -> 여러 메서드들이 종합적으로 동작하는것을 테스트

## 3. 내부 데이터 노출 vs 내부 동작 노출
테스트를 위해 내부데이터를 노출하는(getter를 만들거나 private을 public으로 바꾸는) 행동을 해야한다면 설계에 문제가 있는것..  
SRP(단일책임의 원칙)을 어기지 않게 설계를다시 생각해봐라.  
보통은 private메서드를 추출하여 다른 클래스로 이동한 뒤 그 클래스의 public 메서드로 작성하는 방식이 좋은 해결책이 된다.  

## 4. 테스트 분리
테스트를 합쳐놓으면 반복적인 공통 초기화 부담을 줄일수 있지만, JUnit이 제공하는 테스트 고립의 이점을 잃게됨.  
안좋은예)
```java
   public void matches() {
      Profile profile = new Profile("Bull Hockey, Inc.");
      Question question = new BooleanQuestion(1, "Got milk?");

      // answers false when must-match criteria not met
      profile.add(new Answer(question, Bool.FALSE));      
      Criteria criteria = new Criteria();
      criteria.add(
            new Criterion(new Answer(question, Bool.TRUE), Weight.MustMatch));

      assertFalse(profile.matches(criteria));
      
      // answers true for any don't care criteria 
      profile.add(new Answer(question, Bool.FALSE));      
      criteria = new Criteria();
      criteria.add(
            new Criterion(new Answer(question, Bool.TRUE), Weight.DontCare));

      assertTrue(profile.matches(criteria));
   }
```

좋은예)
```java
   @Test
   public void matchAnswersFalseWhenMustMatchCriteriaNotMet() {
      profile.add(new Answer(question, Bool.FALSE));      
      criteria.add(
            new Criterion(new Answer(question, Bool.TRUE), Weight.MustMatch));

      boolean matches = profile.matches(criteria);
      
      assertFalse(matches);
   }
   
   @Test
   public void matchAnswersTrueForAnyDontCareCriteria() {
      profile.add(new Answer(question, Bool.FALSE));      
      criteria.add(
            new Criterion(new Answer(question, Bool.TRUE), Weight.DontCare));

      boolean matches = profile.matches(criteria);
      
      assertTrue(matches);
   }
```

### 테스트 분리의 장점
- 단언 실패시 실패한 테스트의 이름이 표기되어 빠르게 문제 파악 가능
- 현재 실패한 테스트가 다른 테스트에 영향을 끼치지 않아 실패 테스트 디버깅에 필요한 시간을 단축. 
- 모든 케이스가 실행되었음을 보장. 단언실패시 이후의 테스트는 실행되지 않으므로 분리시켜야지 모든 케이스가 실행됨을 보장할수있다.  

## 5. 문서로의 테스트
테스트코드 자체가 쉽게 설명할 수 없는 기능들을 알려주기때문에 주석으로 적을 내용을 테스트코드가 보충하기도 함. 

### 5-1. 일관성 있는 이름으로 테스트 문서화
좀 더 작은 테스트로 이동할수록 이름이 특정 행동에 집중하게되어 의미가 부여됨. 어떤 맥락에서 일련의 행동을 호출했을때 어떤 결과가 나오는지 명시하면 좋음.  
`doingSomeOperationGeneratesSomeResult` 양식을 추천. 

나쁜예)  
makeSingleWithdrawal  

좋은예)  
withdrawalReducesBalanceByWithdrawnAmount

### 5-2. 의미있는 테스트 만들기
- 지역 변수 이름 개선
- 의미 있는 상수 도입
- 햄크레스트 단언 사용
- 커다란 테스트를 작게 나누어 집중적 테스트만들기
- 테스트 군더더기들을 도우미메서드와 `@Before` 메서드로 이동

### 6. @Before와 @After 
### 6-1. @Before
@Before 메서드는 매번 테스트 메서드 실행에 앞서 실행됨.  
ex. @Before, @Test1, @Test2 있다면?  
@Before  
@Test1  
@Before  
@Test2  
이런식으로 실행됨


또한 다수의 @Before 메서드가 있을때 JUnit은 실행 순서를 보장하지않음.  
일정한 순서가 필요하다면 단일@Before메서드안에 결합해서 순서대로 실행되도록 해야함

### 6-2. @After
클래스에 있는각 테스트를 한 후 실행되며 테스트가 실패하더라도 실행됨.
ex. @Before, @Test1, @Test2, @After 있다면?  
@Before  
@Test1  
@After  
@Before  
@Test2  
@After  

### 6-3. @BeforeClass
테스트를 처음 실행하기 전에 한번만 실행됨
ex. @BeforeClass, @Before, @Test1, @Test2 있다면?  
@BeforeClass  
@Before  
@Test1  
@Before  
@Test2  
이런식으로 실행됨

### 6-4. @AfterClass
테스트 끝나기 전에 한번만 실행됨 
ex. @BeforeClass, @Before, @Test1, @Test2, @After, @AfterClass 있다면?  
@BeforeClass  
@Before  
@Test1  
@After  
@Before  
@Test2  
@After  
@AfterClass  

## 7. 의미있는 테스트
실패하면 곧바로 고쳐서 모든 테스트가 항상 통과하도록 해야함.  
`항상 녹색으로` 지침이 코드에 오류가 없도록 지켜줄것임.  

### 7-1. 테스트를 빠르게 
- 필요하다고 생각하는 테스트만 실행. (-> 비추. 더큰 문제를 만들수있음)
- 목(Mock)객체를 활용
- Categories기능을써서 특정 카테고리 해당 테스트만 별도로 실행
- 테스트 개수를 주의하며 최소화.
- 빠른 피드백을 얻을 수 있는 단위테스트에 집중 

### 7-2. 테스트 제외
`@Ignore` 어노테이션을 활용해 실패 테스트를 주석처리할 수 있다. 

