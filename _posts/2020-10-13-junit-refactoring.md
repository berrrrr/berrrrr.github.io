---
layout: post
title: '[JUnit] 깔끔한 코드로 리팩토링하기'
subtitle: '[JUnit] 깔끔한 코드로 리팩토링하기'
categories: programming
tags: spring
comments: true
---


테스트는 단지 '설계'의 일부에 불과하다. 좋은 단위테스트로 어떻게 리팩토링할 수 있을지 배워보자.

시스템이 비대해졌다면, 중복된 코드조각이 늘어 유지보수비용이 증가하고 리스크가 증가하였는지 확인해보아야한다. 그리고 시스템에 있는 중복의 양을 최소화하여야한다. 

## 1. 작은 리팩토링

리팩토링이란? 기존 기능은 유지하면서 코드의 하부 구조를 건강하게 변형하는것.

```java
public boolean matches(Criteria criteria) {
      score = 0;
      
      boolean kill = false;
      boolean anyMatches = false;
      for (Criterion criterion: criteria) {
         Answer answer = answers.get(criterion.getAnswer().getQuestionText());
         boolean match = criterion.getWeight() == Weight.DontCare || answer.match(criterion.getAnswer());
         if (!match && criterion.getWeight() == Weight.MustMatch) {
            kill = true;
         }
         if (match) {
            score += criterion.getWeight().getValue();
         }
         anyMatches |= match;
         // ...
      }
      if (kill)
         return false;
      return anyMatches;
   }
```

이 코드를 한번 리팩토링해보자! 

### 메서드 추출

리팩토링의 가장 중요한 요소는? 바로 이름짓기(renaming). 

소스코드에서 가장 중요한 명확성은 대게 코드의 의도를 잘 전달하는것을 의미하고, 좋은 이름은 코드의 의도를 전달하는 가장 좋은 수단이다. 

```java
for (Criterion criterion: criteria) {
	Answer answer = answers.get(criterion.getAnswer().getQuestionText());
	boolean match = criterion.getWeight() == Weight.DontCare || answer.match(criterion.getAnswer());
		// ...
}
```

위 for 문에서, match 변수를 할당하는 조건이 한눈에 들어오지 않는다. 이 메서드의 복잡도를 줄여 코드가 무엇을 담당하는지 정책을 쉽게 바꿔보도록 하자. 

```java
public boolean matches(Criteria criteria) {
    score = 0;
    
    boolean kill = false;
    boolean anyMatches = false;
    for (Criterion criterion: criteria) {
       Answer answer = answers.get(criterion.getAnswer().getQuestionText());
       boolean match = matches(criterion, answer);

       if (!match && criterion.getWeight() == Weight.MustMatch) {
          kill = true;
       }
       if (match) {
          score += criterion.getWeight().getValue();
       }
       anyMatches |= match;
    }
    if (kill)
       return false;
    return anyMatches;
 }

private boolean matches(Criterion criterion, Answer answer) {
    return criterion.getWeight() == Weight.DontCare || answer.match(criterion.getAnswer());
}
```

저수준의 세부사항을 추출함으로써 Profile이 Criteria 객체를 어떻게 매칭하는지 고수준의 정책만 이해해도 충분! 

아래 테스트 코드로 기존 기능에 문제가 없는지 확신을 가질 수 있다. 

```java
package iloveyouboss;

import org.junit.*;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class ProfileTest {
   private Profile profile;
   private Criteria criteria;

   private Question questionReimbursesTuition;
   private Answer answerReimbursesTuition;
   private Answer answerDoesNotReimburseTuition;

   private Question questionIsThereRelocation;
   private Answer answerThereIsRelocation;
   private Answer answerThereIsNoRelocation;

   private Question questionOnsiteDaycare;
   private Answer answerNoOnsiteDaycare;
   private Answer answerHasOnsiteDaycare;

   @Before
   public void createProfile() {
      profile = new Profile("Bull Hockey, Inc.");
   }

   @Before
   public void createCriteria() {
      criteria = new Criteria();
   }

   @Before
   public void createQuestionsAndAnswers() {
      questionIsThereRelocation =
            new BooleanQuestion(1, "Relocation package?");
      answerThereIsRelocation =
            new Answer(questionIsThereRelocation, Bool.TRUE);
      answerThereIsNoRelocation =
            new Answer(questionIsThereRelocation, Bool.FALSE);

      questionReimbursesTuition =
            new BooleanQuestion(1, "Reimburses tuition?");
      answerReimbursesTuition =
            new Answer(questionReimbursesTuition, Bool.TRUE);
      answerDoesNotReimburseTuition =
            new Answer(questionReimbursesTuition, Bool.FALSE);

      questionOnsiteDaycare =
            new BooleanQuestion(1, "Onsite daycare?");
      answerHasOnsiteDaycare =
            new Answer(questionOnsiteDaycare, Bool.TRUE);
      answerNoOnsiteDaycare =
            new Answer(questionOnsiteDaycare, Bool.FALSE);
   }

   @Test
   public void matchAnswersFalseWhenMustMatchCriteriaNotMet() {
      profile.add(answerDoesNotReimburseTuition);
      criteria.add(
            new Criterion(answerReimbursesTuition, Weight.MustMatch));

      boolean matches = profile.matches(criteria);

      assertFalse(matches);
   }

   @Test
   public void matchAnswersTrueForAnyDontCareCriteria() {
      profile.add(answerDoesNotReimburseTuition);
      criteria.add(
            new Criterion(answerReimbursesTuition, Weight.DontCare));

      boolean matches = profile.matches(criteria);

      assertTrue(matches);
   }

   @Test
   public void matchAnswersTrueWhenAnyOfMultipleCriteriaMatch() {
      profile.add(answerThereIsRelocation);
      profile.add(answerDoesNotReimburseTuition);
      criteria.add(new Criterion(answerThereIsRelocation, Weight.Important));
      criteria.add(new Criterion(answerReimbursesTuition, Weight.Important));

      boolean matches = profile.matches(criteria);

      assertTrue(matches);
   }

   @Test
   public void matchAnswersFalseWhenNoneOfMultipleCriteriaMatch() {
      profile.add(answerThereIsNoRelocation);
      profile.add(answerDoesNotReimburseTuition);
      criteria.add(new Criterion(answerThereIsRelocation, Weight.Important));
      criteria.add(new Criterion(answerReimbursesTuition, Weight.Important));

      boolean matches = profile.matches(criteria);

      assertFalse(matches);
   }

   @Test
   public void scoreIsZeroWhenThereAreNoMatches() {
      profile.add(answerThereIsNoRelocation);
      criteria.add(new Criterion(answerThereIsRelocation, Weight.Important));

      profile.matches(criteria);

      assertThat(profile.score(), equalTo(0));
   }

   @Test
   public void scoreIsCriterionValueForSingleMatch() {
      profile.add(answerThereIsRelocation);
      criteria.add(new Criterion(answerThereIsRelocation, Weight.Important));

      profile.matches(criteria);

      assertThat(profile.score(), equalTo(Weight.Important.getValue()));
   }

   @Test
   public void scoreAccumulatesCriterionValuesForMatches() {
      profile.add(answerThereIsRelocation);
      profile.add(answerReimbursesTuition);
      profile.add(answerNoOnsiteDaycare);
      criteria.add(new Criterion(answerThereIsRelocation, Weight.Important));
      criteria.add(new Criterion(answerReimbursesTuition, Weight.WouldPrefer));
      criteria.add(new Criterion(answerHasOnsiteDaycare, Weight.VeryImportant));

      profile.matches(criteria);

      int expectedScore = Weight.Important.getValue() + Weight.WouldPrefer.getValue();
      assertThat(profile.score(), equalTo(expectedScore));
   }

   // TODO: missing functionality--what if there is no matching profile answer for a criterion?
}
```

## 2. 메서드를 위한 더 좋은 집 찾기

근데 추출한 `matches()` 메서드는 Profile객체와는 관계가 별로 없다.. 이 메서드는 Criterion 클래스로 옮겨주도록 하자. 

```java
public class Criterion implements Scorable{
	// ...

	public boolean matches(Criterion criterion, Answer answer) {
	    return criterion.getWeight() == Weight.DontCare || answer.match(criterion.getAnswer());
	}

}
```

기존 profile에 남아있는 코드에서, 

```java
Answer answer = answers.get(criterion.getAnswer().getQuestionText());
```

이 부분은 디메테르의 법칙(다른객체로 전파되는 연쇄적 메서드 호출은 피해야함)을 위반하고있음. 얘도 `answeringMatching()` 이라는 메서드로 따로 빼주자.

```java
public boolean matches(Criteria criteria) {
    score = 0;

    boolean kill = false;
    boolean anyMatches = false;
    for (Criterion criterion: criteria) {
       Answer answer = answerMatching(criterion);
       boolean match = criterion.matches(answer);

       if (!match && criterion.getWeight() == Weight.MustMatch) {
          kill = true;
       }
       if (match) {
          score += criterion.getWeight().getValue();
       }
       anyMatches |= match;
    }
    if (kill)
       return false;
    return anyMatches;
 }

 private Answer answerMatching(Criterion criterion) {
    return answers.get(criterion.getAnswer().getQuestionText());
 }
```

이제 코드가 훨씬 가독성이 좋아졌다. matches()의 세부 사항을 제거했기 때문에 아래의 고수준의 정책을 쉽게 이해할 수 있다.

- 매칭되는 조건의 가중치를 합하여 점수 계산
- 필수 항목이 프로파일 답변과 매칭되지 않으면 false를 반환
- 매칭되는게 있으면 true, 없으면 false를 반환

아니 근데 지역변수 answer은 한번밖에 안쓰이는데도 이렇게 굳이 따로 선언해야하나요? → 네. 코드의도를 명확하게 할 수 있기때문에 한번만 사용된다해도 빼는게 유효한 선택입니다. (근데 이게 정답은 아니고 그냥 프로그래머 맘입니다) 

## 3. 과한 리팩토링

`matches()` 메서드를 좀더 분명한 핵심 의도 3개로 다시 구조화. 

```java
public boolean matches(Criteria criteria) {
    calculateScore(criteria);
    if (doesNotMeetAnyMustMatchCriterion(criteria))
       return false;
    return anyMatches(criteria);
 }

 private boolean doesNotMeetAnyMustMatchCriterion(Criteria criteria) {
    for (Criterion criterion: criteria) {
       boolean match = criterion.matches(answerMatching(criterion));
       if (!match && criterion.getWeight() == Weight.MustMatch) 
          return true;
    }
    return false;
 }

 private void calculateScore(Criteria criteria) {
    score = 0;
    for (Criterion criterion: criteria) 
       if (criterion.matches(answerMatching(criterion))) 
          score += criterion.getWeight().getValue();
 }

 private boolean anyMatches(Criteria criteria) {
    boolean anyMatches = false;
    for (Criterion criterion: criteria) 
       anyMatches |= criterion.matches(answerMatching(criterion));
    return anyMatches;
 }

 private Answer answerMatching(Criterion criterion) {
    return answers.get(criterion.getAnswer().getQuestionText());
 }
```

- 매칭되는 조건의 가중치를 합하여 점수 계산
- 필수 항목이 프로파일 답변과 매칭되지 않으면 false를 반환
- 매칭되는게 있으면 true, 없으면 false를 반환

위 3가지 항목으로 명확하게 로직이 분리됨.

근데 이렇게 리팩토링하면 동일한 반복문이 3개씩이다. 과연 이렇게 리팩토링하는 방향이 맞을까?

### 1) 보상 : 명확하고 테스트 가능한 단위

`matches()` 메서드는 이제 즉시 이해 가능한 수준으로 알고리즘이 깔끔하게 정리됨. 

- 주어진 조건에 따라 점수계산 → `calculateScore()`
- 프로파일이 어떤 필수조건에 부합하지 않으면 false → `doseNotMeetAnyMustMatchCriterion()`
- 필수조건에 부합하면 어떤조건에 부합하는지 반환 → `anyMatches()`

### 2) 성능염려: 그러지 않아도됨

반복문이 3개가 되어서 잠재적으로 실행시간이 4배가됨. 

책에서의 답변 : **"그래서 어쨌다는겁니까?"**

데이터가 적으면 굳이 성능저하에 대해 신경쓰지 말라.

성능이 즉시 문제되지 않는다면 어설픈 최적화 노력으로 시간을 낭비하기보다 코드를 깔끔하게 유지하라.

최적화된 코드는 여러방면에서 문제 소지가 있다. → 보통 코드 가독성이 낮고 유지보수 비용이 증가하고 설계도 유연하지 못하게됨.

반대로 깔끔한 설계는 성능을 위해 최적화할때 즉시 대응할 수 있는 최선의 보호막이됨. 깔끔한 설계는 코드를 이동시킬 수 있는 유연성을 적용하고 다른 알고리즘을 적용하는데도 수월함. 

깔끔한 설계는 최적화를 위한 최선의 준비다.

## 4. 마치며

단위테스트는 기본 원칙을 깨지 않고 코드를 깔끔하게 유지해주는 보호장치를 제공. 이제 시스템에서 작은 먼지들을 쓸어버리며 큰 그림 설계를 볼 수 있게 되었다. 다음장에서는 단위테스트에 기대어 어떻게 설계 요구사항을 해결할 수 있을지 알아보자.