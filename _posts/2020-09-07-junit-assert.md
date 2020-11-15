---
layout: post
title: '[JUnit] 단언(assert) 파보기'
subtitle: '[JUnit] 단언(assert) 파보기'
categories: programming
tags: test
comments: true
---

junit 단언에 대해 파보자. 

## 1. Junit 단언이란?
단언은 어떤 조건이 참인지 검증하는 방법. 보통 요즘은 **햄크레스트 단언**을 많이 사용한다.

### 1-1. assertTrue
가장 기본적인 단언. 특정 조건이 참인지 검증
```java
   @Test
   public void depositIncreasesBalance() {
      int initialBalance = account.getBalance();
      account.deposit(100);
      assertTrue(account.getBalance() > initialBalance);
      assertThat(account.getBalance(), equalTo(100));
   }
```
### 1-2 assertThat
명확한 값을 비교하는 단언. **햄크레스트 단언**의 일종. 
```java
   @Test
   public void depositIncreasesBalance_hamcrestAssertTrue() {
      account.deposit(50);
      assertThat(account.getBalance() > 0, is(true));
   }
```

햄크레스트 단언에는 두번째 인자로 `matcher`를 넣을 수 있음. 
```java
   @Test
   public void assertFailure() {
      assertThat(account.getName(), startsWith("xyz"));
   }
```
matcher를 인자로 넣은 상태에서 테스트가 실패하면 아래와 같은 stacktrace가 나와서 문제 해결에 필요한 정보를 쉽게 알 수 있음. 

```
java.lang.AssertionError:
Expected: a string starting with "xyz"
but: was "abc"
```

## 2. 햄크레스트 매처 살펴보기 
### 2-1. 배열, 컬렉션 비교 - equalTo()
자바 배열, 컬렉션 객체를 비교할 때는 `equalTo()` 메서드를 사용한다. 
```java
   @Test
   public void comparesArraysFailing() {
      assertThat(new String[] {"a", "b", "c"}, equalTo(new String[] {"a", "b"}));
   }
```
--> 실패

```java
   @Test
   public void comparesCollectionsFailing() {
      assertThat(Arrays.asList(new String[] {"a"}), 
            equalTo(Arrays.asList(new String[] {"a", "ab"})));
   }
```
--> 실패

```java
   @Test
   public void comparesArraysPassing() {
      assertThat(new String[] {"a", "b"}, equalTo(new String[] {"a", "b"}));
   }
```
--> 성공

### 2-2. 가독성 높이기 - is 장식자
경우에 따라 `is` 장식자를 사용하여 가독성을 높힐 수 있음. 
```java
   @Test
   public void moreMatcherTests() {
      Account account = new Account(null);
      assertThat(account.getName(), is(nullValue()));
   }
```
### 2-3 불필요한 테스트코드
null이 아닌값을 검사하는건 불필요하고 가치가 없으니 되도록 이런 테스트코드는 짜지말것
```java
      assertThat(account.getName(), is(not(nullValue())));
      assertThat(account.getName(), is(notNullValue()))
```

### 2-4. JUnit 햄크레스트 매처를 이용하여 할 수 있는것
- 객체 타입 검사
- 두 객체의 참조가 같은 인스턴스인지 검사
- 다수의 매처를 결합해 둘다 or 1개라도 성공하는지 검사 
- 어떤 컬렉션이 요소를 포함하거나 조건에 부합하는지 검사
- 어떤 컬렉션이 아이템 몇 개를 모두 포함하는지 검사
- 어떤 컬렉션에 있는 모든 요소가 매처를 준수하는지 검사

### 2-5 부동소수점 비교
```java
   @Test
   public void assertDoublesEqual() {
      assertThat(2.32 * 3, equalTo(6.96)); // Expected : <6.96> But was <6.599999999999>
   }
```
-> 실패하는 테스트. float 혹은 double을 비교할때는 두 수가 벌어질 수 있는 공차 또는 허용 오차를 지정해야함. 


```java
   @Test
   public void assertWithTolerance() {
      assertTrue(Math.abs((2.32 * 3) - 6.96) < 0.0005);
   }
```
안좋은예 -> 성공하긴 하는데 가독성이 구림.


```java
   @Test
   public void assertDoublesCloseTo() {
      assertThat(2.32 * 3, closeTo(6.96, 0.0005));
   }
```
좋은예 -> `isCloseTo`라는 햄크레스트 매처 사용. 가독성이 훨씬 굿. 

### 2-6 단언 설명
`assertThat()`에 첫번째 인자로 message를 넣어서 단언의 근거를 설명할 수 있음. 
```java
   @Test
   public void testWithWorthlessAssertionComment() {
      account.deposit(50);
      assertThat("account balance is 100", account.getBalance(), equalTo(50));
   }
```
근데 위의 예시처럼 잔액이 50인데 주석을 100으로 다는식의 실수가 있을수 있음.   
따라서 위와 같이 주석문을 달기보다는, 테스트 코드 자체만으로 코드를 이해할 수 있게 하는것이 더 좋은 방법.  

## 3. 예외 다루기
예외가 발생해야 테스트가 통과하는 케이스의 경우가있음.  
그럴때는 아래와 같은 방식으로 테스트 코드를 짤 수 있다. 

### 3-1. annotation 사용
```java
   @Test(expected=InsufficientFundsException.class)
   public void throwsWhenWithdrawingTooMuch() {
      account.withdraw(100);
   }
```
-> `InsufficientFundsException` 에러가 발생하면 테스트 통과

### 3-2. try-catch 사용
```java
   @Test
   public void throwsWhenWithdrawingTooMuchTry() {
      try {
         account.withdraw(100);
         fail();
      }
      catch (InsufficientFundsException expected) {
         assertThat(expected.getMessage(), equalTo("balance only 0"));
      }
   }
```
-> 옛날 방식. 예외가 안발생하면 `fail()` 메서드로 강제로 실패. 

### 3-3. ExpectedException 사용
```java
   @Rule
   public ExpectedException thrown = ExpectedException.none();  
   
   @Test
   public void exceptionRule() {
       // Assignment
      thrown.expect(InsufficientFundsException.class); 
      thrown.expectMessage("balance only 0");  
      
      // Act
      account.withdraw(100);  
   }
```
-> 최근방식. AOP 처럼 동작. `@Rule`로 규칙 인스턴스를 선언하고 셋업단계에서 테스트 실행시 발생할 수 있는 예외를 규칙 인스턴스에 알려줌. 실제로 withdraw 메서드를 실행했을때 기대한 예외와 메세지가 발생해야 테스트가 통과됨. 

> 자바와 JUnit을 활용한 실용주의 단위테스트 책   
https://github.com/gilbutITbook/006814