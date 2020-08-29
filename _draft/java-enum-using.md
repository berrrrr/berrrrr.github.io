

java enum의 아주 기본적인 내용만 활용하기

상태값들을 enum을 통해서 관리하려고하는데 enum 사용의 국룰이 뭔지 명확치 않아 찾아보고 거기서 기본적인 내용만 정제해서 활용해보았다.  
활용할때는 java enum을 검색했을때 나오는 아래 블로그들 내용을 참고했으며 아마 현시점에서 enum관련해서 제일 상위로노출되는 사람들이 제일 많이 참고하는 블로그일듯

>참고 : https://knight76.tistory.com/entry/enum-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EB%A6%AC%EC%8A%A4%ED%8A%B8list%EB%A1%9C-%EC%96%BB%EA%B8%B0  
https://woowabros.github.io/tools/2017/07/10/java-enum-uses.html  
https://jojoldu.tistory.com/122  


## enum 정의 

상태값 - 표출명으로 매핑시켜서 정의.  
code=상태값  
description=표출명  
으로 정의하고 설명하도록하겠다. 
```java
public enum EventType {
    REGISTER("register", "등록"),
    MODIFY("modify", "수정"),
    VERIFY("verify", "인증"),
    DELEGATE("delegate", "위임");

    private String code;
    private String description;

    EventType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
```

## enum 상태값으로 표출명 뽑기 

뭐 여러 방법이 있을 것 같지만.. 코드를 좀 더 가시적으로 짤 수 있게 하기 위해 아래와같이 enum 내에 lookup용 map을 static으로 선언하고 그걸 활용해서 of 메소드로 뽑아오게 작성햇다.
```java
    private static final Map<String, EventType> lookup = new HashMap<>();

    static {
        for(EventType e : EnumSet.allOf(EventType.class)) {
            lookup.put(e.getCode(), e);
        }
    }

    public static EventType of(String code) {
        return lookup.get(code);
    }
```

그럼 나중에 이런식으로 상태값을 통해서 표출명을 뽑을 수 있다. 
```java
    String eventTypeName = EventType.of(this.eventType).getDescription();
```

참고로 of 메소드는 꼭 표출명을 뽑는데 쓴다기보단 코드 내에서 상태값으로 Enum타입 가져올때 더 유용하게쓰임. 

## enum map 리턴받기 

```java
    public Map<String, String> getEventTypeEnum(){
        Map<String, String> eventTypeEnum = Stream.of(EventType.values())
                .collect(Collectors.toMap(e-> e.getCode(), e-> e.getDescription()));
        return eventTypeEnum;
    }
```
view단에 뿌릴때 상태값 리스트를 표기하는 니즈가있어서 좀 고민하다가  
api로 enum list를 돌려받는 코드를 stream을 활용해 아래와같이 작성했다.  
list형식 아니고 map형식으로.. 
(아마 이런 니즈는 다른데서도 많을거같음)

```json
{delegate: "위임", modify: "수정", verify: "인증", register: "등록"}
```

이렇게 map형식으로 리턴시켜서 vue에서 v-modal로 select box에 꽃으니까 내가 원하던대로 key는 상태값으로, value는 표출명으로 인식하고 동작했다. 
(이벤트에서 전달할때는 key(상태값)이 전달되고 ui상에서는 value(표출명)으로 표기됨)

javascript가 해준건지 vue가해준건진 모르겟지만 똑똑하게 key-value값 가려서 원하는대로 동작해서 기분좋다 ㅎㅎㅎ 

참고로 이런식으로 Enum의 values를 사용하면 런타임에서 api호출시마다 객체를 생성한다고한다. 위에 참고한 우형 기술블로그에서는 이걸 Bean으로 등록하는방식으로 해결하던데 나는 거기까지는 안했다. 