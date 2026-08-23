---
layout: post
title: "[소프트웨어 설계 트레이드오프] 13. 최신 기술 vs 유지보수 비용"
subtitle: "[소프트웨어 설계 트레이드오프] 13. 최신 기술 vs 유지보수 비용"
categories: programming
tags: systemdesign
comments: true
---

> **소프트웨어 설계 트레이드오프 시리즈**의 글입니다.

> sw공학에서는 새로운 라이브러리, 개념이 주기적으로 등장함. 이녀석들은 각자 여러 장점을 제공하기도 하지만, 고유한 복잡성 역시도 가지고있음. 새로운 녀석을 사용하기에 앞서 장단점을 주의 깊게 조사하고 복잡성과 비용이 컨텍스트 안에서 정당화 되는지를 확인해야함.


### 13.1 의존성 주입 프레임워크

- DI framework의 핵심 아이디어 = 컴포넌트가 요구하는 모든 의존성은 외부에서 주입한다
- 장점
  - 메서드를 훨씬 더 쉽게 테스트할수있음. (mocking이 쉬움)
  - 객체를 주입받는 메서드는 그 객체의 lifecycle을 신경 쓸 필요가 없음.
  - 그 객체의 생성/소멸은 외부에서 이루어짐. (호출자가 처리 X)
- 단점
  - 객체지향 프로그래밍 언어에서 개발자는 다른 객체를 사용하는 훨씬 더 복잡한 객체를 구성하는 경향이 있음.
  - 모든 메서드 호출에 컴포넌트를 전달하면 코드가 장황해지고 읽기 어려워짐
- 해법
  - 생성자주입을 사용해 고차원에서 컴포넌트를 주입
  - 호출자는 객체의 인스턴스 생성시 모든 의존 컴포넌트를 제공
  - 필드에 컴포넌트를 대입하고, 메서드는 필드참조로 컴포넌트를 사용

#### 13.1.1 DIY(Do it yourself) 의존성 주입

- 전용장소 (ex. `public class Application` ) 한곳에서 모든 서비스와 구성을 생성
- 아무 클래스나 격리해서 빠르게 테스트 가능
- thread-safe한 개발이 어려움

#### 13.1.2 의존성 주입 프레임워크 사용하기

- Spring, Guice, DropWizard등.. 검증된 DI프레임워크가 많음
- 컴포넌트의 생명주기를 관리하는 DI컨테이너를 사용
  - 스프링의경우, 컴포넌트를 Bean이라고 함
  - DI컨테이너는 bean 생산자쪽에서 새로운 bean을 등록할수 있게 허용함
  - 소비자쪽의 컨테이너로부터 bean을 얻을 수 있게 허용
  - bean마다 다른 scope를 고를 수 있음
  - bean은 생명주기마다 한번만 생성 가능(=singleton패턴)
  - bean method 호출 전 추가 로직을 덧붙일수있음 (ex. proxy로 로그 남기기)
  - `@Configuration`, `@Service` , `@Autowired` 등 어노테이션으로 편리하게 주입 가능
  - `@SpringBootApplication` 이 모든 bean의 annotation을 탐색해 필요 컴포넌트 주입을 처리
- 실제 ㅅ생성, 생명주기, 초기화는 숨겨져있음
- 어플리케이션을 계속해서 개발하면 몇 lifecycle 문제를 목격.
- 모든 로직이 암시적이기때문에 디버깅이 어려움
- 컴포넌트 초기화가 코드베이스 전반에 분산되어있음
- 이 모든 편리성을 활용하다보면, 어플리케이션과 프레임워크가 더욱 강하게 결합됨
- 어플리케이션에 부여되는 복잡성이 커짐
- 외부 의존성 숫자를 제한하고싶다면, DIY해법이 맞을수있음
- 증명된 프레임워크 기능이 필요하면 그때는 사용이 맞음.

### 13.2 리액티브 프로그래밍

- 리액티브 프로그래밍 핵심아이디어 = 들어오는 데이터를 훨씬 더 쉽고 효율적으로 처리
- 데이터를 변환해서 결과를 방출
- 결과는 sink로 저장되거나, 다른 코드가 소비
- 리액티브 모델은 non-blocking이고 async로 수행하고 미래 어느시점에 방출될수있음
- 데이터 스트림으로 작업하고 데이터가 도착하면 필요에 따라 처리
- non-blocking방식으로 동작하는 함수형의 data-driven 처리 방식 제공
- 처리를 고도로 병렬화하도록 만듬
- 스레드 모델은 처리과정과 분리되어잇어 어느부분을 어느스레드가 담당할지에 대해서는 명백한 가정이 어려움
- 배압(back-pressure) 지원.
  - consumer가 처리가능한 이벤트 수를 보내면, producer는 그만큼의 데이터만 방출
  - pull 기반임
- 리액티브 프로그래밍은 많은 복잡한 문제의 솔루션이 되지만, 러닝커브가 크고 추론이 쉽지않음

#### 13.2.1 단일 스레드, 차단 처리

```java
public List<Integer> calculateForUserIds(List<Integer> userIds){
  return userIds.stream()
    .map(IOService::blockingGET)
    .map(CPUIntensiveTask::calculate)
    .collect(Collectors.toList());
```

- 로직을 blocking으로 구현
- 호출자는 메서드를 호출하면, 끝날때까지 기다려야함
- 단일스레드이며 병렬이 아님

#### 13.2.2 `CompletableFuture` 사용하기

```java
public List<CompletableFuture<Integer>> calculateForUserIds(List<Integer> userIds){
  return userIds.stream()
    .map(
      v ->
        CompletableFuture.supplyAsync(() -> IOService.blockingGet(v))
          .thenApply(CPUIntensiveTask::calculate))
    .collect(Collectors.toList())
}
```

- 비동기추상화
- promise-future API
- n 개 작업을 병렬로 제출
- 작업을 각각 다른 스레드 or 스레드풀에서 가져온 스레드 집합에서 수행 가능
- id별로 별도의 스레드에서 수행하는 비차단 작업
- I/O bound 작업 이후 CPU bound 작업은 `thenApply()` 를 통해 순차실행
- 비동기 + 병렬 방식으로 동작
- 컴포넌트에서 동시성을 달성했지만 모든 호출자에게 비동기식 작업 흐름을 강요하지는 않음.
  - 리스트에서 값을 추출해 차단 API를 사용해 작업 가능
- 기본적으로 여러 스레드에서 수행되나, 단일 스레드 Executor를 전달하면 단일스레드에서 수행 가능

#### 13.2.3 리액티브 해법 구현하기

```java
public Flux<Integer> calculateForUserIds(List<Integer> userIds){
  return Flux.fromIterable(userIds)
    .publishOn(Schedulers.boundedElastic())
    .map(IOService::blockingGet)
    .publishOn(Schedulers.parallel())
    .map(CPUIntensiveTask::calculate);
```

- Flux추상화를 제공하는 리액티브 API를 사용할 수 있음
- 이벤트 N개의 reactive stream
- 모든 Flux 소비자는 자신의 흐름도 reactive가 되도록 migration해야함
- `publishOn()` 을 통해 스케줄러 지정 가능
- I/O bound 작업은 `boundedElastic()` 스케쥴러로 호출
- CPU bound 작업은 `parallel()` 스케쥴러로 호출
- 즉 서로 다른 스레드를 사용해 호출하게됨
- 연산이 상호 교차하므로 병렬성을 달성하게됨
- 다만 스레드 친화도 달성은 어려움
  - 두 작업은 분리된 스레드풀에서 수행
  - 단일 스레드에서 두가지 유형 수행은 불가능
- 스레드 구성이 암시적이고, 개발자가 디테일하게 조정/구성하기 쉬빚않음
- FluxAPI 스레드 모델이 간단하지않음
- 이 API를 외부에 공개하면 사용하는 모든 사람이 reactive API를 이용하고 맞춰서 변경해야함
- 처리과정의 일부만 병렬화하는거라면 리액티브 API 비추
- 어플리케이션의 작업 흐름을 전체적으로 리액티브로 재작업해야한다면, 종단관점에서 Flux API 추천

### 13.3 함수형 프로그래밍

- 함수형프로그래밍의 장점
  - 더 쉬운 병행 모델
  - 간결한 코드
  - side effect, global state가 없어서 테스트가 쉬움
- java의경우
  - 근본은 객체지향언어
  - 그러나 람다함수, 스트림 api와 같은 함수형 프로그래밍 요소들이 최근 자바에 추가됨

#### 13.3.1 비함수형언어에서 함수형 코드 생성

- ex. reduce 함수 같은 함수형 코드를 비함수형언어인 java에서도 재귀를 사용해 충분히 구현 가능
- 그러나, 많은 수의 값을 연산하게 되는 경우 `StackOverflowError` 발생
- 재귀는 매번 호출스택에 프레임을 할당하고, 가용메모리를 초과하면 에러 발생
- java에서는 for 루프를 사용한 명령형 방식으로 구현하는게 올바른 방식.
- stream API에서도 이는 명령형 방식(for loop)로 구현되어있음

#### 13.3.2 꼬리 재귀 최적화

- 완전한 함수형 언어의 경우, 꼬리재귀 최적화를 통해 재귀 문제를 해결 가능
- 재귀호출이 메서드의 마지막 호출인경우 컴파일러가 재귀를 for loop로 변경
- 스칼라의 경우 분해 / 패턴매칭이라는 함수형 프로그래밍 구성요소로 코드를 간결히할수있음
- `@tailrec` 이라는 어노테이션을 통해 자동으로 꼬리재귀 최적화 가능

#### 13.3.3 불변성

- 불변성은 강력한 개념이지만 대가가 따름
- 불변객체는 일단 만들어지면 변경 불가능
- 자바의 경우 final로 불변객체 생성 가능
- 가변구조를 불변래퍼로 감싸면 불변화 가능
- 객체의 변경을 허용하는 모든 메서드 호출 금지
- 객체가 불변이면 thread-safe에 대해 걱정하지않고 공유 가능 (동기화 불필요, race없음)
- 객체가 불변이라도 상태 변경이 필요한경우? → 새로운 객체를 생성하고 원본객체의 상태를 복사 후 필요한 상태로 변경하는 방식으로 수행
- 이런한 접근방식은 상당히 많은 객체를 생성하는 결과를 야기함 ex. react..
- deepcopy가 많아질수록 메모리도 그만큼 많이 사용
- 더 많은 메모리압박과 비싼 gc를 감당해야함
- 노드 참조를 통해 줄일수있으나.. 어쨌든..

### 13.4 지연평가 vs 빠른평가

- 어플리케이션은 여러 컴포넌트와 상호작용함
- lazy evaluation(지연평가)
  -  컴포넌트 초기화와 같은 작업을 어플리케이션 lifecycle의 후반부로 이동.
  - 초기화를 빠르게 수행 가능 → 어플리케이션 시작이 빨라짐
  - 하지만 첫 요청에서 연결 초기화 비용을 사용자가 지불하게됨
  - 외부서비스 초기화가 필요한 경우, 여기에 문제가 생겼을때 지연평가는 감지가 늦을수 있음.
- eager evaluation (빠른평가)
  - 초기화비용이 어플리케이션 시작지점에서 한번 들어감.
  - 어플리케이션 시작이 느려짐
  - 최종 사용자 요청은 초기화된 요청을 사용하므로 빠름.
  - 외부서비스의 장애를 빠르게 감지할 수 있음
