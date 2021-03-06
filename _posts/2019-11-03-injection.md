---
layout: post
title: 필드주입, setter 주입, 생성자주입
subtitle: 필드주입, setter 주입, 생성자주입
categories: programming
tags: spring
comments: true
---

필드주입(Field Injection), setter 주입(setter Injection), 생성자주입(Constructor Inject)에 대해 알아보고 장단점을 비교해보자.

## Constructor Injection
생성자에서 객체를 생성할때 주입.
```
public class ExampleCase{

	private final ChocolateService chocolateService;
	
	private final DrinkService drinkService;

	@Autowired
	public ExampleCase(ChocolateService chocolateService, DrinkService drinkService){
		this.chocolateService = chocolateService;
		this.drinkService = drinkService;
	}
}
```

## Filed Injection
`@Autowired` Annotaion을 사용하여 Filed에 선언하며 주입
```
public class ExampleCase{

	@Autowired
	private ChocolateService chocolateService;

	@Autowired
	private DrinkService drinkService;
}
```

## Setter Injection
setter함수에서 객체를 setting할때 주입
```
public class ExampleCase{
	private ChocolateService chocolateService;

	private DrinkService drinkService;

	@Autowired
	public void setChocolateService(ChocolateService chocolateService){
		this.chocolateService = chocolateService;
	}

	@Autowired
	public void setDrinkService(DrinkService drinkService){
		this.drinkService = drinkService;
	}

}
```

## Field Injection 대신 Constructor Injection을 사용하는 이유
사실 Field Injection이 사용하기 간편하고 코드도 심플해보인다. 그래도 추천하지 않는 이유는 무엇일까? 

### 단일 책임의 원칙 위반 
의존성을 주입하기가 지나치게 쉬워 단일책임의 원칙을 위반하기 쉽다.

### 의존성이 숨는다.
DI(Dependency Injection) 컨테이너를 사용한다는 것은 클래스가 자신의 의존성만 책임진다는게 아니다. 제공된 의존성 또한 책임진다. 그래서 클래스가 더이상 다른 객체를 의존하지 않아도 될때, public 메서드나 생성자를 통해(Setter나 Contructor) 확실히 표현되어야한다. 하지만 Field Injection은 의존성이 있는지 없는지 명확히 알수 없게 숨어버리게된다.

### DI 컨테이너의 결합성과 테스트 용이성
DI 프레임워크의 핵심 아이디어는 관리되는 클래스가 DI 컨테이너에 의존성이 없어야 한다. 즉, 필요한 의존성을 전달하면 독립적으로 인스턴스화 할 수 있는 단순 POJO여야한다. DI 컨테이너 없이도 유닛테스트에서 인스턴스화 시킬 수 있고, 각각 나누어서 테스트도 할 수 있다. 컨테이너의 결합성이 없다면 관리하거나 관리하지 않는 클래스를 사용할 수 있고, 심지어 다른 DI 컨테이너로 전환할 수 있다. 
하지만, Field Injection을 사용하면 필요한 의존성을 가진 클래스를 곧바로 인스턴스화 시킬 수 없다.

### 불변성(Immutability)
Constructor Injection과 다르게 Field Injection은 final을 선언할 수 없다. 그래서 객체가 변할 수 있다.

### 순환 의존성
Constructor Injection에서 순환 의존성을 가질 경우 BeanCurrentlyCreationExeption을 발생시킴으로써 순환 의존성을 알 수 있다.  

c.f  
순환 의존성이란? First Class가 Second Class를 참조하는데 Second Class가 다시 First Class를 참조할 경우 혹은 First Class가 Second Class를 참조하고, Second Class가 Third Class를 참조하고 Third Class가 First Class를 참조하는 경우 이를 순환 의존성이라고 부른다.

## Setter Injection Vs Contructor Injection 

### Setter Injection
Setter Injection은 선택적인 의존성을 사용할 때 유용하다. 상황에 따라 의존성 주입이 가능하다. 스프링 3.x 다큐멘테이션에서는 Setter Injection을 추천했었다.

### Constructor Injection
Constructor Injection은 필수적인 의존성 주입에 유용하다. 게다가 final을 선언할 수 있으므로 객체가 불변하도록 할 수 있다. 또한 위에서 언급했듯이 순환 의존성도 알 수 있다. 그로인해 나쁜 디자인 패턴인지 아닌지 판단할 수 있다. 
스프링 4.3버전부터는 클래스를 완벽하게 DI 프레임워크로부터 분리할 수 있다. 단일 생성자에 한해 @Autowired를 붙이지 않아도 된다.(완전 편한데?!) 이러한 장점들 때문에 스프링 4.x 다큐멘테이션에서는 더이상 Setter Injection이 아닌 Constructor Injection을 권장한다. 굳이 Setter Injection을 사용한다면, 합리적인 디폴트를 부여할 수 있고 선택적인(optional) 의존성을 사용할 때만 사용해야한다고 말한다. 그렇지 않으면 not-null 체크를 의존성을 사용하는 모든 코드에 구현해야한다.




>출처 https://zorba91.tistory.com/238