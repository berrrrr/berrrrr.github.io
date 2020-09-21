---
layout: post
title: '[Junit] 좋은 테스트의 FIRST 속성'
subtitle: '[Junit] 좋은 테스트의 FIRST 속성'
categories: programming
tags: spring
comments: true
---

좋은 테스트의 조건에 대해 알아보자 

## 1. FIRST : 좋은 테스트 조건

- **F**ast 빠른
- **I**solated 고립된
- **R**epeatable 반복 가능한
- **S**elf-validating 스스로 검증 가능한
- **T**imely 적시의

## 2. Fast : 빠르다

- 빠른테스트 : DB같은 외부시스템에 접근하지 않고 로컬에 있는 로직코드만 실행. (수밀리초)
- 느린테스트 : DB, 파일, 네트워크 호출 등 외부자원을 다루는 코드를 호출. (수십, 수백, 수천밀리초)

시스템이 커지면 단위테스트도 실행하는데 점점 오래걸림. 단위테스트를하루에 서너 번 실행하기 버거워진다면 잘못된 방향으로 가고 있는것. 

테스트를빠르게 유지해야함. 설계를 깨끗하게 하면 빠르게 유지할 수 있다. 

ex) 회원id-회원정보를 db에 넣고, 그 회원정보가 들어갔는지 다시 조회해서 확인하는 테스트코드가 필요하다면?

회원id-회원정보 map을 생성하고 그 map을 조회하는 테스트코드를 작성.! (db조회하는부분 뺌) 

→ 당근 컨트롤러+외부리소스에 의존하는 메서드를 테스트하고싶을수있음. 이걸 테스트하는 방법은 나중에 설명. ( Mock 사용 등..) 

## 3. Isolated : 고립시킨다

좋은 단위테스트는 검증하려는 작은 양의 코드(=단위, Unit)에 집중. 

외부저장소(ex.DB)와 상호작용하게되면 테스트가 가용성, 접근성 이슈로 실패할 가능성이 증가하므로, 외부 저장소와의 상호작용 최소화. 

좋은 단위테스트는 다른 단위테스트에 의존하지 않아야함. 

테스트코드는 어떤 순서나 시간에 관계없이 실행 가능해야함.

각 테스트가 작은 양의 동작에만 집중하도록 해야 독립적으로 유지하기 쉬워짐.

항상 **SRP(단일 책임 원칙)**을 명심! 

테스트가 고립되어 혼자 동작할수있도록 해야함.

## 4. Repeatable : 반복가능하다

반복 가능한 테스트는 실행할때마다 결과가 같아야함. 

이러한 반복 가능한 테스트를 만들려면 직접 통제할 수 없는 외부 환경에 있는 항목들과 격리시켜야함. 

어쩔수 없이 외부환경과 상호작용해야하는경우에는? 테스트 대상 코드의 나머지를 격리하고 시간 변화에 독립성을 유지하는 방법으로 목(Mock)객체를 사용하면 됨. 

ex) 새 회원정보가 추가되었을때 생성 timestamp가 저장되는것을 테스트하고자한다면? timestamp 값은 매번 변하는 값인데 어떻게 단언할것인가? → `java.time.Clock` 객체를 사용하여 고정된 시간을 now변수로 받음

```java
@Test
   public void questionAnswersDateAdded() {
      Instant now = new Date().toInstant();
      controller.setClock(Clock.fixed(now, ZoneId.of("America/Denver")));
      int id = controller.addBooleanQuestion("text");
      
      Question question = controller.find(id);
      
      assertThat(question.getCreateTimestamp(), equalTo(now));
   }
```

```java
public class QuestionController {
	private Clock clock = Clock.systemUTC();
	// ...

	public int addBooleanQuestion(String text) {
      return persist(new BooleanQuestion(text));
   }

   void setClock(Clock clock) {
      this.clock = clock;
   }

	// ...

	private int persist(Persistable object) {
      object.setCreateTimestamp(clock.instant());
      executeInTransaction((em) -> em.persist(object));
      return object.getId();
   }
};
```

테스트 단언에서는 위와같이 세팅된 상태에서 질문 생성 timestamp와 now변수가 동일한지 검사.

테스트에서 사용된 시계는 실제의 것을 대표하는 테스트더블(test double)의 역할을 함. (테스트 더블에 대해서는 차후에 자세히 설명) 

## 5. Self-validating : 스스로 검증 가능하다

기대하는것이 무엇인지 단언하지 않으면 그건 올바른 테스트가 아니다. 기대하는것을 올바로 작성하고 이를 자동으로 검증하게 해주는 단위테스트는 우리의 시간을 소모하는게 아니라 절약해준다. 

테스트는 스스로 준비도 할 수 있어야함. 테스트에 필요한 설정들은 모두 자동화 해야함. (만약 테스트할때 외부 설정이 필요하다면 Isolated 를 위반한것) 

한단계 더 나아가서, 테스트를 언제 어떻게 실행할지도 자동화 할 수 있어야함. (ex. 젠킨스, TeamCity같은 CI 도구들 이용.. 변화감지시 빌드와 테스트 실행) 

## 6. Timely : 적시에 사용한다

단위테스트로 코드를 검증하는것은 미룰수록 불쾌한 버그가 생기고 프로그램에 결함이 늘어날것임. 따라서 적시에 단위테스트를 작성하여 테스트코드가 시스템 건강에 기여하도록 하자!