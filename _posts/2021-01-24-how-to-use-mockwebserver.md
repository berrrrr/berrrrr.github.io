---
layout: post
title: "Maven + MockMvc 환경에서 Spring Rest Docs 써보기"
subtitle: "Maven + MockMvc 환경에서 Spring Rest Docs 써보기"
categories: programming
tags: test
comments: true
---

코드를 작성하다보면, 외부API를 호출하는 메서드를 숱하게 작성하게된다. MockWebServer를 사용하여 이러한 메서드의 테스트코드를 쉽게 작성할수 있는 방법을 알아보자. 

# 1. MockWebServer란?

http request를 받아서 response를 반환하는 **간단하고 작은 웹서버**라고 할수있다. 

우리가 작성하는 메서드 중, webclient라 restTemplete등의 client로 http를 호출하는 메서드의 테스트 코드를 작성할때 이 MockWebServer를 호출하게함으로써 쉽게 테스트코드를 작성할수있다. 실제로 Spring Team도 이거 써서 테스트하라고 권장했다고함. [>참고](https://github.com/spring-projects/spring-framework/issues/19852#issuecomment-453452354) 

# 2. MockWebServer 사용해보기

## 1) Dependency 추가

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.0.1</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <version>4.0.1</version>
    <scope>test</scope>
</dependency>
```

최신버전은 [maven repository](https://mvnrepository.com/artifact/com.squareup.okhttp3/mockwebserver) 요기 참고해서 추가하기 

## 2) Test코드에 추가

```java
public class EmployeeServiceMockWebServerTest {

    public static MockWebServer mockBackEnd;

    @BeforeAll
    static void setUp() throws IOException {
        mockBackEnd = new MockWebServer();
        mockBackEnd.start();
    }

    @AfterAll
    static void tearDown() throws IOException {
        mockBackEnd.shutdown();
    }
}
```

Test Before/After에 서버 세팅/셧다운 할 수 있게 위와같이 설정해준다. 

(BeforeEach/AfterEach, BeforeAll/AfterAll 둘다 설정 상관없으니 기호에따라...) 

## 3) base url 설정

```java
@BeforeEach
void initialize() {
    String baseUrl = String.format("http://localhost:%s", mockBackEnd.getPort());
    employeeService = new EmployeeService(baseUrl);
}
```

이런식으로 서비스에서 호출할 base url을 MockWebServer의 url로 교체해준다. (테스트시에는 실제 외부 api를 호출하는게 아니라 MockWebServer를 호출해야되니까..)

## 4) 임의 response 생성

```java
@Test
void getEmployeeById() throws Exception {
    Employee mockEmployee = new Employee(100, "Adam", "Sandler", 
      32, Role.LEAD_ENGINEER);
    mockBackEnd.enqueue(new MockResponse()
      .setBody(objectMapper.writeValueAsString(mockEmployee))
      .addHeader("Content-Type", "application/json"));

    Mono<Employee> employeeMono = employeeService.getEmployeeById(100);

    StepVerifier.create(employeeMono)
      .expectNextMatches(employee -> employee.getRole()
        .equals(Role.LEAD_ENGINEER))
      .verifyComplete();
}
```

mockwebserver에는 내가 원하는 response를 리턴할 수 있도록 차례대로 stub response를 만들어서 넣을 수 있다. 위와 같이 MockResponse 타입으로 내가 원하는 stub 객체를 생성한 뒤, enqueue해서 넣어주면 mockwebserver는 엔큐된 순서대로 응답을 뱉게된다. 

## 5) Dispatcher 설정

만약 단순 엔큐된 순서대로 응답을 뱉는게 아니라, 특정 키워드에 따라 다른 응답을 뱉게 하고 싶으면 아래와 같이 mockwebserver의 dispatcher를 설정해주면 된다.

```java
private Dispatcher dispatcher;
dispatcher = new Dispatcher() {
            @NotNull
            @Override
            public MockResponse dispatch(RecordedRequest request) {
                if (request.getPath().contains("employee")) {
                    return employeeResponse;
                }
                if (request.getPath().contains("employer")) {
                    return emplyerResponse;
                }
                return new MockResponse().setResponseCode(404);
            }
        };
        mockBackEnd.setDispatcher(dispatcher);
```

> 참고사이트
[https://github.com/square/okhttp/blob/master/mockwebserver/README.md](https://github.com/square/okhttp/blob/master/mockwebserver/README.md)
[https://velog.io/@kyle/외부-API를-어떻게-테스트-할-것인가](https://velog.io/@kyle/%EC%99%B8%EB%B6%80-API%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%95%A0-%EA%B2%83%EC%9D%B8%EA%B0%80)
[https://www.baeldung.com/spring-mocking-webclient](https://www.baeldung.com/spring-mocking-webclient)