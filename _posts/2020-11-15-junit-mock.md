---
layout: post
title: '[JUnit] 목 객체 사용'
subtitle: '[JUnit] 목 객체 사용'
categories: programming
tags: test
comments: true
---

목 객체 사용법을 알아보자

## 1. 테스트 도전 과제

위/경도를 파라미터로 받는 api 를 호출해서 주소를 받아오는 아래와 같은 클래스가 있다

```java
package iloveyouboss;

import java.io.*;
import org.json.simple.*;
import org.json.simple.parser.*;
import util.*;

public class AddressRetriever {
   public Address retrieve(double latitude, double longitude)
         throws IOException, ParseException {
      String parms = String.format("lat=%.6flon=%.6f", latitude, longitude);
      String response = new HttpImpl().get(
        "http://open.mapquestapi.com/nominatim/v1/reverse?format=json&"
        + parms);

      JSONObject obj = (JSONObject)new JSONParser().parse(response);

      JSONObject address = (JSONObject)obj.get("address");
      String country = (String)address.get("country_code");
      if (!country.equals("us"))
         throw new UnsupportedOperationException(
            "cannot support non-US addresses at this time");

      String houseNumber = (String)address.get("house_number");
      String road = (String)address.get("road");
      String city = (String)address.get("city");
      String state = (String)address.get("state");
      String zip = (String)address.get("postcode");
      return new Address(houseNumber, road, city, state, zip);
   }
}
```

이런 http 호출을 실행하는 메서드에 대한 테스트는 두가지 문제를 내포한다

- 다른 순수 로직테스트에 비해 외부호출을 요하므로 속도가 느림
- api가 항상 호출가능한 상태일지 보장할 수 없음 (통제밖)

이런 메서드는 어떻게 테스트코드를 작성해야할까?

목표에 집중하자. 우리는 retrieve()메서드에 대한 단위테스트를 원한다. 

HttpImple클래스(우리가 보통 쓰는거로치자면 webclient, resttemplate)를 신뢰할수있다면 **http 호출 준비 로직과 호출에 대한 http 응답에서 Address객체를 생성하는 로직을 테스트**하면됨. 

## 2. 번거로운 동작을 Stub으로 대체

우선 http 호출에서 반환되는 JSON response를 이용하여 Address 객체를 생성하는 로직을 검증하는데 집중하자.

실제 http를 매번 호출할 수 없으므로  테스트용도로 하드코딩한 값을 반환하는 구현체가 필요하다. 이를 **Stub(스텁)** 이라고 한다.  

```java
Http http = (String url) -> 
         "{\"address\":{"
         + "\"house_number\":\"324\","
         + "\"road\":\"North Tejon Street\","
         + "\"city\":\"Colorado Springs\","
         + "\"state\":\"Colorado\","
         + "\"postcode\":\"80903\","
         + "\"country_code\":\"us\"}"
         + "}";
```

## 3. 테스트를 지원하기 위한 설계 변경

근데 이걸 쓸려면 실제 코드에서 http 객체를 새로 주입받아야한다. 아래와 같이 AddressRetriever 클래스를 변경한다.

```java
public class AddressRetriever {
   private Http http;

   public AddressRetriever(Http http) {
      this.http = http;
   }

   public Address retrieve(double latitude, double longitude)
         throws IOException, ParseException {
      String parms = String.format("lat=%.6flon=%.6f", latitude, longitude);
      String response = http.get(
         "http://open.mapquestapi.com/nominatim/v1/reverse?format=json&"
         + parms);

      JSONObject obj = (JSONObject)new JSONParser().parse(response);
      // ...

      JSONObject address = (JSONObject)obj.get("address");
      String country = (String)address.get("country_code");
      if (!country.equals("us"))
         throw new UnsupportedOperationException(
               "cannot support non-US addresses at this time");

      String houseNumber = (String)address.get("house_number");
      String road = (String)address.get("road");
      String city = (String)address.get("city");
      String state = (String)address.get("state");
      String zip = (String)address.get("postcode");
      return new Address(houseNumber, road, city, state, zip);
   }
```

어디가바꼈냐면, `new HttpImpl().get()` 이렇게 호출하던걸 주입받은 Http를 이용하여 호출하게 바뀌었다. 

```java
@Test
   public void answersAppropriateAddressForValidCoordinates() 
         throws IOException, ParseException {
      Http http = (String url) -> 
         "{\"address\":{"
         + "\"house_number\":\"324\","
         + "\"road\":\"North Tejon Street\","
         + "\"city\":\"Colorado Springs\","
         + "\"state\":\"Colorado\","
         + "\"postcode\":\"80903\","
         + "\"country_code\":\"us\"}"
         + "}";
      AddressRetriever retriever = new AddressRetriever(http);

      Address address = retriever.retrieve(38.0,-104.0);
      
      assertThat(address.houseNumber, equalTo("324"));
      assertThat(address.road, equalTo("North Tejon Street"));
      assertThat(address.city, equalTo("Colorado Springs"));
      assertThat(address.state, equalTo("Colorado"));
      assertThat(address.zip, equalTo("80903"));
   }
```

이제 요렇게 테스트가 가능하다.

근데 테스트땜에 시스템 코드 설계를 변경하게되었다. 하지만 이는 나쁜일이 아니고 더 좋은 설계로 나아간것이다. Http객체에 대한의존성이 더 깔끔하게 선언되었고 결합도도 낮아졌으므로 더 좋아진거니까 걱정은 ㄴㄴ! 

## 4. parameter 검증

근데 우리가 작성한 Stub객체는 넘겨진 파라미터(위도,경도)와는 무관하게 항상 동일하게 하드코딩된 JSON을 반환한다. 이건 테스트 구멍이 수 있다. 부정확한 파라미터가 들어오면 결함이 발생한다. 

따라서, 기대하는 파라미터를 포함하지 않으면 그 시점에 명시적으로 테스트가 실패하도록 해야한다. 

```java
public class AddressRetrieverTest {
   @Test
   public void answersAppropriateAddressForValidCoordinates() 
         throws IOException, ParseException {
      Http http = (String url) -> 
         { 
           if (!url.contains("lat=38.000000&lon=-104.000000")) 
              fail("url " + url + " does not contain correct parms");
           return "{\"address\":{"
                 + "\"house_number\":\"324\","
                 + "\"road\":\"North Tejon Street\","
                 + "\"city\":\"Colorado Springs\","
                 + "\"state\":\"Colorado\","
                 + "\"postcode\":\"80903\","
                 + "\"country_code\":\"us\"}"
                 + "}";
         };
      AddressRetriever retriever = new AddressRetriever(http);
      // ...

      Address address = retriever.retrieve(38.0,-104.0);
      
      assertThat(address.houseNumber, equalTo("324"));
      assertThat(address.road, equalTo("North Tejon Street"));
      assertThat(address.city, equalTo("Colorado Springs"));
      assertThat(address.state, equalTo("Colorado"));
      assertThat(address.zip, equalTo("80903"));
   }
}
```

이런식으로 url이 내가 원하는 인자를 포함했는지 if문을 걸어줘서 인자를 검증할 수 있게 되었다. 

이런식으로 인자를 검증할수 있게 된 Stub은 Mock과 가깝다.

### Mock 이란?

**Mock**은 위에서 인자를 검증할수 있게 된 Stub 처럼, 의도적으로 흉내 낸 동작을 제공하고 수신한 인자가 모두 정상인지 여부를 검증하는 일을 하는 테스트 구조물이다. 

## 5. Mock을 사용한 테스트 단순화

이제 똑똑한 Stub을 Mock 으로 변환해보자. 아래와 같은 기능들이 필요하다.

- 테스트에 서 어떤 인자를 기대하는지 명시
- `get()` 메서드에 넘겨진 인자들을 저장
- `get()` 메서드에 저장된 인자들이 기대하는 인자들인지 테스트가 완료될때 검증

이런 기능을 해주는 Mock객체를 우리가 직접 만들려면 머리가 아프지만 범용 목적으로 설계해놓은게 있다. 바로 Mockito(모키토) 이다. 모키토에서 잘 만들어준 목 객체를 우리는 잘 가져다 쓰도록 하자 ㅎㅎ 

```java
// ...
import static org.mockito.Mockito.*;

public class AddressRetrieverTest {
   @Test
   public void answersAppropriateAddressForValidCoordinates() 
         throws IOException, ParseException {
      Http http = mock(Http.class);
      when(http.get(contains("lat=38.000000&lon=-104.000000"))).thenReturn(
            "{\"address\":{"
            + "\"house_number\":\"324\","
           // ...
            + "\"road\":\"North Tejon Street\","
            + "\"city\":\"Colorado Springs\","
            + "\"state\":\"Colorado\","
            + "\"postcode\":\"80903\","
            + "\"country_code\":\"us\"}"
            + "}");
      AddressRetriever retriever = new AddressRetriever(http);

      Address address = retriever.retrieve(38.0,-104.0);
      
      assertThat(address.houseNumber, equalTo("324"));
      // ...
      assertThat(address.road, equalTo("North Tejon Street"));
      assertThat(address.city, equalTo("Colorado Springs"));
      assertThat(address.state, equalTo("Colorado"));
      assertThat(address.zip, equalTo("80903"));
   }
}
```

Http인터페이스를  구현하는 목 인스턴스를 선언했다. 이 목객체는 이제 모든 자질구레한 검증작업을 해준다. 

`when()` 메서드로는 테스트의 기대사항을 설정한다. 

`thenReturn()` 메서드로 기대사항이 충족되었을때 처리를 한다. 

즉, 기대사항(ex.원하는파라미터)이 충족되었을때 Mock은지정된 값을 반환한다. 

위 코드에서는, `lat=38.000000&lon=-104.000000` 가 들어왔을때만 지정된 json 을 반환한다. 

`verify()` 메서드를 사용해서 내가 원하는 메서드가 호출되었는지 검증할수도있음. 

## 6.  Injection 으로 단순화

위 방법처럼 목 인스턴스를 선언할수도있고, 모키토의 내장 DI(Dependency Injection:의존성주입) 을 활용하는 방법도 있음. 모키토의 DI는아래와 같이 사용할수있다.

```java
public class AddressRetrieverTest {
   @Mock private Http http;
   @InjectMocks private AddressRetriever retriever;
   
   @Before
   public void createRetriever() {
      retriever = new AddressRetriever();
      MockitoAnnotations.initMocks(this);
   }

   @Test
   public void answersAppropriateAddressForValidCoordinates() 
         throws IOException, ParseException {
      when(http.get(contains("lat=38.000000&lon=-104.000000")))
         .thenReturn("{\"address\":{"
                        + "\"house_number\":\"324\","
         // ...
                        + "\"road\":\"North Tejon Street\","
                        + "\"city\":\"Colorado Springs\","
                        + "\"state\":\"Colorado\","
                        + "\"postcode\":\"80903\","
                        + "\"country_code\":\"us\"}"
                        + "}");

      Address address = retriever.retrieve(38.0,-104.0);
      
      assertThat(address.houseNumber, equalTo("324"));
      assertThat(address.road, equalTo("North Tejon Street"));
      assertThat(address.city, equalTo("Colorado Springs"));
      assertThat(address.state, equalTo("Colorado"));
      assertThat(address.zip, equalTo("80903"));
   }
```

1. `@Mock` 어노테이션을 사용해서 Mock인스턴스를생성. 
2. 생성한 Mock객체를 주입할 대상 인스턴스 변수를 `@InjectMocks` 어노테이션을붙여서 생성.
3. 대상인스턴스를 생성한 후 `MockitoAnnotations.initMocks(this)` 를호출. 이걸 호출하면 `@Mock` 어노테이션이 붙은 필드를 찾아서 목 인스턴스를 합성하고 (= `mock(Http.class)` 와 동일), `@InjectMocks`가붙은 필드에 생성한 목 객체를 주입한다. 

목객체를 사용해서 테스트하면 되므로, AddressRetriever 클래스에서 아래와같이 http주입 코드는 빼버려도됨.

```java
public class AddressRetriever {
   private Http http = new HttpImpl();

   public Address retrieve(double latitude, double longitude)
         throws IOException, ParseException {
      String parms = String.format("lat=%.6f&lon=%.6f", latitude, longitude);
      String response = http.get(
         "http://open.mapquestapi.com/nominatim/v1/reverse?format=json&"
         + parms);

      JSONObject obj = (JSONObject)new JSONParser().parse(response);
      // ...

      JSONObject address = (JSONObject)obj.get("address");
      String country = (String)address.get("country_code");
      if (!country.equals("us"))
         throw new UnsupportedOperationException(
               "cannot support non-US addresses at this time");

      String houseNumber = (String)address.get("house_number");
      String road = (String)address.get("road");
      String city = (String)address.get("city");
      String state = (String)address.get("state");
      String zip = (String)address.get("postcode");
      return new Address(houseNumber, road, city, state, zip);
   }
}
```

## 7. 올바른 Mock 사용법

Mock을 사용한 테스트는 진행하길 원하는 내용을 분명하게 기술해야함

예를들면 위에서는 `when()` 절에 테스트 메서드가 기대하는 `lat=38.000000&lon=-104.000000` 문자열을넣었고 이걸 보면 '아, 38.0과 -104.0 인수를 원하는구나' 라고 바로 알 수 있음.

테스트 독자가 코드를 깊이 파지 않아도 이러한 관련성을 쉽게 파악할수록 좋은 테스트 코드임. 

Mock이실제 동작을 대신한다는것을 잊지말자. 아래 내용을 항상 고려하자.

- Mock이 프로덕션 코드의 동작을 올바르게 묘사하고있는가?
- 프로덕션 코드가 생각지 못한 다른 형식으로 반환할수도있는가?
- 프로덕션 코드가 예외를 던지는가?
- 프로덕션 코드가 null을반환하는가?

이들 각 조건에 대해 다른 테스트가 필요할 수 있음. 

마지막으로, 목객체를 사용하는 테스트코드는 프로덕션 코드를 직접 테스트하는것은 아니라는걸 인지하고있어야함. 실제 프로덕션 코드와 gap은 있을수밖에없음. 

실제 클래스의 종단간 사용성을 보여주는 적절한 상위테스트(=통합테스트)가 있는지 확인해야함.

## 8. 마치며

Stub과 Mock을통해 의존하는 개체의 행동을 흉내내는 방법을 배웠음. 테스트는 api,file,db 등 다른 번거로운 의존성들과 상호작용 할 필요가 없음. 

적절한 도구(ex.Mockito)를사용하여 목생성/주입을 쉽게 할 수 있음.

이제 이를 활용하여 의존성없이 빠른 테스트코드를 생성해보도록 하자.