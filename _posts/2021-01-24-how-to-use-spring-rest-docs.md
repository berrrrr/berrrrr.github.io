---
layout: post
title: "Maven + MockMvc 환경에서 Spring Rest Docs 써보기"
subtitle: "Maven + MockMvc 환경에서 Spring Rest Docs 써보기"
categories: programming
tags: spring
comments: true
---

테스트코드와 연계되어 api 문서를 작성해주는 Spring Rest Docs를 적용하는법을 알아보자. 

# 1. Spring Rest Docs란?

Spring MVC Test와 함께 자동 생성되는 snippet을 이용해 작성할수있는 RESTful 서비스 문서.

# 2. Spring Rest Docs 적용해보기

maven + Spring Data REST(MockMvc) 환경 기준.

(그외 WebTestClient, REST Assured 등도 지원하니 필요시 [공식문서](https://docs.spring.io/spring-restdocs/docs/2.0.5.RELEASE/reference/html5/#getting-started-sample-applications) 확인)  

## 1) configuration

Build Configuration. rest docs를 빌드하기위해 아래 내용을 `pom.xml`에 추가한다.

```xml
<dependency> 
	<groupId>org.springframework.restdocs</groupId>
	<artifactId>spring-restdocs-mockmvc</artifactId>
	<version>{project-version}</version>
	<scope>test</scope>
</dependency>

<build>
	<plugins>
		<plugin> 
			<groupId>org.asciidoctor</groupId>
			<artifactId>asciidoctor-maven-plugin</artifactId>
			<version>1.5.8</version>
			<executions>
				<execution>
					<id>generate-docs</id>
					<phase>prepare-package</phase> 
					<goals>
						<goal>process-asciidoc</goal>
					</goals>
					<configuration>
						<backend>html</backend>
						<doctype>book</doctype>
					</configuration>
				</execution>
			</executions>
			<dependencies>
				<dependency> 
					<groupId>org.springframework.restdocs</groupId>
					<artifactId>spring-restdocs-asciidoctor</artifactId>
					<version>{project-version}</version>
				</dependency>
			</dependencies>
		</plugin>
	</plugins>
</build>
```

작성된 doc을 jar에 package하기 위해 또 플러그인이 필요하다. 아래내용도 `pom.xml`에 추가해주자.

```xml
<plugin> 
	<artifactId>maven-resources-plugin</artifactId>
	<version>2.7</version>
	<executions>
		<execution>
			<id>copy-resources</id>
			<phase>prepare-package</phase>
			<goals>
				<goal>copy-resources</goal>
			</goals>
			<configuration> 
				<outputDirectory>
					${project.build.outputDirectory}/static/docs
				</outputDirectory>
				<resources>
					<resource>
						<directory>
							${project.build.directory}/generated-docs
						</directory>
					</resource>
				</resources>
			</configuration>
		</execution>
	</executions>
</plugin>
```

위 내용을 추가하면 우리가 작성한 doc이 static/docs밑으로 배포된다. 

❗️spring 프로젝트 처음 생성할때 초기 dependency 설정하는 부분에서 `Testing > spring rest docs`를 추가하는 방식으로 설정해도 되는데, 그럼 패키징플러그인 부분이 빠진다. 잊지말고  `maven-resources-plugin`  까지 야무지게 추가해주자. 

## 2) Test 설정

### 2-1) JUnit4 기준

```java
@Rule
public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation();

private MockMvc mockMvc;

@Autowired
private WebApplicationContext context;

@Before
public void setUp() {
	this.mockMvc = MockMvcBuilders.webAppContextSetup(this.context)
			.apply(documentationConfiguration(this.restDocumentation)) 
			.build();
}
```

`@Before` 어노테이션 붙이면 매 테스트 실행 이전에 테스트가 실행되므로, 이렇게 설정하면 매 MockMvc실행시마다 자동으로 rest docs snippet을 생성해준다. 

### 2-2) JUnit5 기준

```java
@ExtendWith(RestDocumentationExtension.class)
public class MainControllerTest {
		private MockMvc mockMvc;
		
		@BeforeEach
		public void setUp(WebApplicationContext webApplicationContext,
				RestDocumentationContextProvider restDocumentation) {
			this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
					.apply(documentationConfiguration(restDocumentation)) 
					.build();
}
```

이런식으로 Test위에 `@ExtendWith` 어노테이션 달아주면됨. 

마찬가지로, snippet 생성을위해 `@BeforeEach` 에 설정도 필요함. 

## 3) Test 작성

대충 이런 API를 개발했다고 하자. 

```java
@RestController
@RequestMapping("/api")
public class MainController {
    @GetMapping("/test")
    public Map<String, String> getTest() {
        return Collections.singletonMap("code", "ok");
    }
}
```

아래와 같이 mockmvc로 테스트하는 테스트코드를 작성한다. 

```java
@SpringBootTest
@ExtendWith(RestDocumentationExtension.class)
public class MainControllerTest {
    private MockMvc mockMvc;
    @BeforeEach
    public void setUp(WebApplicationContext webApplicationContext,
                      RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    public void getTestTest() throws Exception {
        this.mockMvc.perform(get("/api/test").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andDo(document("get-test"));
    }

}
```

테스트코드를 실행하고나면, target 폴더 밑에 아래와 같은 스니펫들이 자동으로 생성된다.

- `<output-directory>/get-test/curl-request.adoc`
- `<output-directory>/get-test/http-request.adoc`
- `<output-directory>/get-test/http-response.adoc`
- `<output-directory>/get-test/httpie-request.adoc`
- `<output-directory>/get-test/request-body.adoc`
- `<output-directory>/get-test/response-body.adoc`

![spring-rest-docs-01.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/spring-rest-docs-01.png?raw=true)

이런식으로 api request/response에 대한 코드조각(snippet)을 자동으로 생성해준다.  

ex) http-request.adoc

```java
[source,http,options="nowrap"]
----
GET /api/test HTTP/1.1
Accept: application/json
Host: localhost:8080

----
```

ex) http-response.adoc

```java
[source,http,options="nowrap"]
----
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 13

{"code":"ok"}
----
```

## 4) asciidoc 작성

이제 위에서 생성한 스니펫을 기반으로  api 문서가 되는 asciidoc이라는 문서를 작성해보자. 

### 4-1) asciidoctor

asciidoc을 작성하기 위해서는 **asciidoctor**라는 언어를 사용해야하는데, asciidoc을 작성하기 위한 lightweight markup language이다. 쉽게말해 마크다운(md)같이 문서 예쁘게 만들기 위한 언어라고 보면된다.

사실 듣도보도 못한 asciidoctor라는걸 쓰라고 해서 조금 당황스러울 수 있겠지만, 조금만 보면 크게 어렵지는 않다. 마크다운에서 `#` 를 `h1` 으로 사용한다면 asciidoctor에선 `=` 로 `h1` 을 표현한다는 정도의 차이가 있다.

문서를 예쁘게 쓰기위해 asciidoctor를 빨리 익히고싶다면 [공식문서의 quick reference](https://docs.asciidoctor.org/asciidoc/latest/syntax-quick-reference/)를 참고하자.

### 4-2) 작성/생성위치

maven의 경우, `src/main/asciidoc/*.adoc` 에 adoc(asciidoc)을 작성하면 maven install시  `target/generated-docs/*.html` 에 html 파일이 생성된다. 

![_2021-01-11__7.38.40.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__7.38.40.png?raw=true)

### 4-3) snippet include

```java
include::{snippets}/get-test/http-request.adoc[]
```

위와같은 형식의 asciidoctor 문법으로 아까 테스트코드를 통해 자동생성된 스니펫을 asciidoc에 include할 수 있다. 

### 4-4) asciidoc 에시

뭐 대충 이런식으로 asciidoctor문법을 활용해서 문서 하나를 만들었다. 

```java
= 테스트문서
:toc: left

== 테스트API
.Http Request
include::{snippets}/get-test/http-request.adoc[]

.Http Response
include::{snippets}/get-test/http-response.adoc[]
```

## 5) 배포

프로젝트 루트폴더에서 `mvn install` 해주면 위에서 언급한대로 `target/generated-docs/*.html` 에 html 파일이 생성된다. 

![_2021-01-11__7.37.16.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__7.37.16.png?raw=true)

## 6) 문서확인

서버를 띄운 뒤 `{url}/docs/*.html` 형식으로 접근하면 된다. 예시 프로젝트에서는 로컬로 띄웠고 doc 이름을 `api-doc` 으로 했으므로 `[localhost:8080/docs/api-doc.html](http://localhost:8080/docs/api-doc.html)` 로 접근하면 된다. 

![_2021-01-11__7.54.22.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__7.54.22.png?raw=true)


# 4. Spring Rest Docs 응용

위 설정은 정말 default 설정이고.. 아래와 같이 쫌더 응용해서 내가 원하는대로 커스텀할 수 있다. 

## 1) document 설정 커스텀

위에서 설명한 설정은 완전 기본설정이고, 나는 아래와 같이 좀 **커스텀**해서 사용했다.

```java
@Before
    public void setUp() {
        // spring rest docs를 위한 양식 설정
        this.document = document(
                "{class-name}/{method-name}",   // (1) 
                preprocessRequest(              // (2) 
                        modifyUris()
                                .scheme("http")
                                .host("berrrr.demopage.com")
                                .removePort(),
                        prettyPrint()),
                preprocessResponse(prettyPrint()) // (3)
        );

        // mockMvc 실행시 spring rest docs 설정을 자동 적용 (4)
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.context)
                .apply(documentationConfiguration(this.restDocumentation))
                .alwaysDo(document)
                .build();
    }
```

- (1) document snippet 생성시 이름을 자동으로 `{class-name}/{method-name}` 로 저장하게함
- (2) `preprocessRequest` : request snippet 생성시 설정
    - `modifyUris()` : 기본 [localhost:8080](http://localhost:8080) 으로 뜨는 host 이름을 내마음대로 바꿀수있다.
    - `prettyPrint()` : request snippet생성시 prettyPrint 된다
- (3) `preprocessResponse` : response snippet 생성시 설정
    - `prettyPrint()` : response snippet 생성시 pretty Print 된다.

    (4) mockMvc 실행시 spring rest docs 설정을 자동 적용한다. 

## 2) request/response 명세

```java
MvcResult result = mockMvc.perform(
                RestDocumentationRequestBuilders.get("/notice/{noticeId}", testNoticeId)
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(document.document(
                        pathParameters(
                                parameterWithName("noticeId").description("공지사항ID")),
                        responseFields(
                                fieldWithPath("noticeId").description("공지사항ID"),
                                fieldWithPath("noticeType").description("공지사항 유형"),
                                fieldWithPath("noticeTypeName").description("공지사항 유형명"),
                                fieldWithPath("title").description("공지사항 제목"),
                                fieldWithPath("content").description("공지사항 내용"),
                                fieldWithPath("pubStatus").description("공지사항 게시여부"),
                                fieldWithPath("homeStatus").description("공지사항 홈 노출여부"),
                                fieldWithPath("status").description("공지사항 상태"),
                                fieldWithPath("regDttm").description("공지사항 등록시간"),
                                fieldWithPath("modDttm").description("공지사항 수정시간"))))
                .andReturn();
```

이런식으로 pathparam과 response field를 각각 명세해주면 아래와 같이 snippet이 생성된다. 

![_2021-01-11__8.06.39.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__8.06.39.png?raw=true)


![_2021-01-11__8.07.16.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__8.07.16.png?raw=true)


request parameter를 명세할수도 있다. 

```java
MvcResult result = mockMvc.perform(
                get("/notice/list" + "?offset=0&limit=20&title=testnotice&pubStatus=Y&homeStatus=Y&noticeType=notice")
        ).andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(document.document(
                        requestParameters(
                                parameterWithName("offset").description("페이지 번호"),
                                parameterWithName("limit").description("페이지당 데이터 갯수"),
                                parameterWithName("title").description("공지사항 제목 검색 키워드"),
                                parameterWithName("pubStatus").description("공지사항 게시여부"),
                                parameterWithName("homeStatus").description("공지사항 홈 노출여부"),
                                parameterWithName("noticeType").description("공지사항 유형")),
                        responseFields(
                                fieldWithPath("[].noticeId").description("공지사항ID"),
                                fieldWithPath("[].noticeType").description("공지사항 유형"),
                                fieldWithPath("[].noticeTypeName").description("공지사항 유형명"),
                                fieldWithPath("[].title").description("공지사항 제목"),
                                fieldWithPath("[].content").description("공지사항 내용"),
                                fieldWithPath("[].pubStatus").description("공지사항 게시여부"),
                                fieldWithPath("[].homeStatus").description("공지사항 홈 노출여부"),
                                fieldWithPath("[].status").description("공지사항 상태"),
                                fieldWithPath("[].regDttm").description("공지사항 등록시간"),
                                fieldWithPath("[].modDttm").description("공지사항 수정시간"))))
                .andReturn();
```

![_2021-01-11__8.09.02.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__8.09.02.png?raw=true)


![_2021-01-11__8.09.06.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/_2021-01-11__8.09.06.png?raw=true)


❗️ 위와같이 필드를 명세할 때, 실제 mvc test로 호출한 api에 있는 필드와 내가 명세한 필드가 다르면 테스트가 에러를 뱉는다. 때문에 실제 api와 필드명세가 강제로 싱크가 맞춰지게 된다.

❗️ 컬럼이 100개인 API가 있다면? 무조건 100개 필드를 명세해야하는 지옥이 펼쳐짐..

# 3. Spring Rest Docs 장단점

개인적으로 써보고나서 정리해보는 장단점.. 

## 1) 장점

- 문서를 작성하기위해 모든 API 에 대한 테스트코드를 강제로 작성하게됨.
- 실제 코드와 문서의 싱크로율이 강제로 맞춰짐. 문서의 신뢰도가 높아짐.
- asciidocs만 알면 내가 커스텀해서 원하는 doc 모양을 만들수있음.
- 다양한 response (ex. 2xx 외의 response)에 대한 정의도 쉽게할 수 잇음

## 2) 단점

- asciidocs라는 듣보잡 마크다운을 배워야함.
- 문서화하기 위한 뎁스가 엄청남.....ㅎ
    - 가령.... swagger는? 어노테이션붙임. 끝!
    - spring rest docs : 1) test코드 작성 → 2) test코드에 컬럼별 명세를 전부 작성 → 3) 테스트 전부 성공시켜서 snippet 생성함 → 4) 생성된 snippet 기반으로 asciidocs작성 → 5) 빌드하면서 static폴더에 문서 패키징해서 배포
- swagger처럼 페이지 안에서 try 해볼수잇는 기능이 X.

# 4. Spring Rest Docs 가 적절한곳?

삽질하면서 사용해본 개인적인 감상에서는.. 무조건 spring rest docs를 사용하자고 주장할만큼 압도적인 장점을 가진 라이브러리는 아닌듯하다. (우선 귀찮은게 너무 큼. swagger같은 다른 선택지도 있는 상황에서 이 번거로움을 감수할만큼의 장점이 있냐 하면 음...) 

그러나 다음과 같은 프로젝트에서는 Spring Rest Docs를 사용하는게 나쁘지않을거같다. 

1. 테스트코드가 반드시! 필요한 프로젝트. 어차피 테스트코드를 짜야한다면, 몇줄(?) 추가해서 spring rest docs로 문서화하기 나쁘지 않다. 
2. 문서의 신뢰도가 중요한 프로젝트. Spring Rest Docs는 무조건 소스코드와 싱크로율이 맞춰지기때문에 문서를 무조건 신뢰할수있다. 

> 참고한글들
[https://cheese10yun.github.io/spring-rest-docs/](https://cheese10yun.github.io/spring-rest-docs/)  
[https://woowabros.github.io/experience/2018/12/28/spring-rest-docs.html](https://woowabros.github.io/experience/2018/12/28/spring-rest-docs.html)  
[https://jaehun2841.github.io/2019/08/04/2019-08-04-spring-rest-docs](https://jaehun2841.github.io/2019/08/04/2019-08-04-spring-rest-docs)  