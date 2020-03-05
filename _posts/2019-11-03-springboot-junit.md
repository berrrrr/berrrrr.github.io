---
layout: post
title: Springboot에서 기본적인 테스트코드 작성하기 (Junit)
subtitle: Springboot에서 기본적인 테스트코드 작성하기 (Junit)
categories: programming
tags: spring
comments: true
---

Junit을 사용해 Springboot에서 기본적인 테스트코드를 작성해보자. 

## Mock 객체란
테스트 대상 클래스가 다른 클래스에 종속되어있을수있다. 이때 Unit Test를 수월하게 하기 위해 종속된 클래스를 매번 전부 선언하는게 아니라 가짜 객체를 만들어서 테스트할수있도록하는것이 Mock객체(가짜객체)이다.

## DTO Testcode
보통 repository, dto 생성 후 assertThat 코드로 테스트
```java
@RunWith(SpringRunner.class)
@ImportAutoConfiguration(DatabaseConfiguration.class)
@MybatisTest
@Transactional
public class AccountMappingTest {

 @Autowired
 private AccountMapper accountMapper;

 @Autowired
 private SqlSession sqlSession;

 @Before
 public void setup() {
  AccountDTO account = new AccountDTO(1001, "서울", 20);
  sqlSession.insert("insertAccount", account);
 }

 @Test
 public void sqlSessionTest() {
  AccountDTO account = sqlSession.selectOne("selectAccountById", 1001);
     assertThat(account.getAccountId()).isNotNull().isEqualTo(1001);
     assertThat(account.getResidence()).isNotNull().isEqualTo("서울");
     assertThat(account.getAge()).isNotNull().isEqualTo(20);
 }

 @Test
 public void accountMapperTest() {
  AccountDTO account = accountMapper.selectAccountById(1001);

     assertThat(account.getAccountId()).isNotNull().isEqualTo(1001);
     assertThat(account.getResidence()).isNotNull().isEqualTo("서울");
     assertThat(account.getAge()).isNotNull().isEqualTo(20);
 }
 ```

## Service Testcode
생성자있는건 @Mock 으로 주입  
생성자없는것은 객체체=mock(객체.class) 로 주입  

위에서 생성된 Mock 객체는 @InjectMock 어노테이션을 가진 객체에 주입된다. 

## Controller Testcode
@WebMVC 사용하여 테스트


```java
@RunWith(SpringRunner.class)
@WebMvcTest(AccountController.class)
@AutoConfigureMybatis
@Transactional
public class AccountRestTest {
	@Autowired
	private MockMvc mvc;

	@MockBean
	private AccountService accountService;

	@Test
	public void acoount_조회_성공() throws Exception {
		// Given
		String expectedResult = "{\"accountId\":1,\"residence\":\"경북\",\"age\":59}";
		AccountDTO account = new AccountDTO(1, "경북", 59);

		// When
		when(accountService.getAccount(1)).thenReturn(account);
		ResultActions result = this.mvc.perform(get("/account/1"));

		// Then
		result.andExpect(status().isOk()).andExpect(content().json(expectedResult));
	}

	@Test
	public void acoount_조회_실패() throws Exception {
		// Given

		// When
		when(accountService.getAccount(123123123)).thenReturn(null);
		ResultActions result = this.mvc.perform(get("/account/123123123"));

		// Then
		result.andExpect(status().isOk());

	}

	@Test
	public void acoount_등록_성공() throws Exception {
		// Given
		String expectedResult = "{\"success\":true,\"errorMessage\":\"null\"}";
		String inputJson = "{\"accountId\":1,\"residence\":\"경북\",\"age\":59}";

		// When
		ResultActions result = this.mvc.perform(post("/account")
                .contentType(MediaType.APPLICATION_JSON).content(inputJson));

		// Then
		result.andExpect(status().isOk()).andExpect(content().json(expectedResult));

	}

	@Test
	public void acoount_등록_실패() throws Exception {
		// Given
		String expectedResult = "{\"success\":false,\"errorMessage\":\"Internal Server Error.\"}";
		String inputJson = "{\"accountId\":1,\"age\":\"경북\",\"residence\":59}";

		// When
		ResultActions result = this.mvc.perform(post("/account")
                .contentType(MediaType.APPLICATION_JSON).content(inputJson));

		// Then
		result.andExpect(status().is5xxServerError()).andExpect(content().json(expectedResult));

	}
}

```

## @MockBean, @Mock 차이
### @Mock (org.mockito.Mock)
다른 Mock Framework  있지만 대부분 mockito를 사용하는 것 같다. Bean이 Container에 꼭 존재해야하는것이 아니라면 @Mock 사용.

### @MockBean (org.springframework.boot.test.mock.mocito.MockBean)
스프링 부트 테스트 안에 내장되어 있음.Spring Boot Container 가 테스트 시에 필요하고 Bean 이 Container 에 존재 해야 한다면 @MockBean 사용. 


참고  
https://github.com/mockito/mockito/wiki/Mockito-features-in-Korean
https://overclassbysin.tistory.com/14
