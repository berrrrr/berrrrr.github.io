---
layout: post
title: Spring xml 설정
subtitle: Spring xml 설정
categories: programming
tags: spring
comments: true
---

# Spring xml 설정
Spring xml 설정에 대해 알아보자

## <beans> root element
Spring 컨테이너는 bean 저장소에 해당하는 xml설정파일을 참조해 bean 생명주기를 관리하고 여러 서비스를 제공한다.
이 설정 파일을 정확하게 작성하고 관리하는것이 무엇보다 중요하다.  
이름은 상관없지만 `<beans>`를 root element로 사용해야한다.  
`<beans>` element 시작 태그에 네임스페이스를 비롯한 xml 스키마 관련 정보가 설정된다. 

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:util="http://www.springframework.org/schema/util"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
	<bean id="tv" class="polymorphism.SamsungTV" />
</beans>
```

spring-beans.xsd가 등록되어있으므로 `<beans>, <description>,<alias>,<import>` 등 4개 엘리먼트를 자식엘리먼트로 사용할 수 있다.

## <import> element
spring 설정파일 하나에 모든 클래스를 bean으로 등록하고 관리해도 되지만 spring기반의 app은 transaction처리, 다국어 처리 등 다양한 설정이 필요하다. 
이런 모든 설정을 하나의 파일로 처리하는 것 보다는 기능별로 여러 xml파일로 나눠서 설정하는것이 더 효율적이다.  
이 분리하여 작성한 여러 설정파일을 하나로 통합할 때 `<import>` element를 사용한다.

예>
context-datasource.xml --> datasource 관련 설정 beans
context-transaction.xml --> transaction 관련 설정 beans

=> applicationContext.xml에서 아래와 같이 통합
```
<beans>
    <import resource="context-datasource.xml">
    <import resource="context-transaction.xml">
</beans>
```
## <bean> element
spring 설정파일에 class를 등록하려면 `<bean>` element를 사용한다. id와 class속성을 사용하는데 class속성은 mandatory이다.  
class 속성에 정확한 패키지 경로와 클래스 이름을 지정해야한다. (`Ctrl+Space`자동완성기능 이용하면 정확하게 등록 가능)  
id는 bean객체를 식별하기 위한 이름으로 사용되며 중복될 수 없다. 자바식별자 작성 규칙(CamelCase표기법)으로 표기해야하며 특수문자가 들어갈 수 없다.  
name 은 id와 동일한 역할을 하지만 자바식별자 작성규칙을 따르지 않아도 된다. 식별자에 특수문자가 포함되어야하면 id 말고 name을 사용하면 된다.

## <bean> element properties
### (1) init-method
Servlet Container 는 web.xml파일에 등록된 Servlet class의 객체를 생성할때 default생성자만을 인식한다.  
이 말인 즉슨 생성자로 Servlet 객체의 멤버변수를 초기화 할 수 없다. (보통 Custom 생성자에서 멤버변수 초기화하니까)  
그래서 Servlet은 init() 메소드를 overide해서 멤버변수를 초기화한다.  

Spring container 역시 Spring 설정파일에 등록된 class 객체 생성할때 default 생성자를 호출한다.
따라서 객체 생성 후 멤버변수 초기화 작업이 필요하면 아래와 같이 init-method 속성을 사용해야한다.
```
<bean id="tv" class="polymorphism.SamsungTV" init-method="initMethod" />
```
이렇게 지정하면 스프링컨테이너는 객체 생성 후 class 에 정의된 initMethod라는 method를 찾아 호출한다. 

### (2) destroy-method
init-method처럼 스프링컨테이너가 객체를 삭제하기 직전에 호출될 임의의 메소드를 지정한다.
```
<bean id="tv" class="polymorphism.SamsungTV" destroy-method="destroyMethod" />
```

### (3) lazy-init
본래 ApplicationContext를 이용해 컨테이너를 구동하면 컨테이너 구동 시점에서 스프링 설정파일에 등록된 bean들이 생성 즉시 로딩된다.  
하지만 어떤 bean들은 자주사용되지 않은데 로딩되어 메모리를 많이 차지할 수 있다.  
이때 lazy-init="true"속성을 사용하면 스프링 컨테이너는 bean을 미리 생성하지 않고 client 요청 시점에 생성한다.
따라서 메모리관리를 더욱 효율적으로 할 수 있다. 
```
<bean id="tv" class="polymorphism.SamsungTV" destroy-method="destroyMethod" lazy-init="true" />
```

### (4) scope 속성
하나만 생성돼도 상관 없는 객체의 경우, 보통 싱글톤패턴을 사용하여 개발한다.  
이때 spring 컨테이너는 일일히 싱글톤패턴으로 개발할 필요 없이 scope 속성을 사용하면 하나만 생성되어 운용할수있게 해준다.  
```
<bean id="tv" class="polymorphism.SamsungTV" destroy-method="destroyMethod" lazy-init="true" scope="singleton"/>
```

scope의 기본값이 singleton 이므로 생략하면 singleton으로 객체가 생성된다고 보면 된다.

반대로 BEAN이 요청될때마다 새로운 객체를 생성하고자하면 아래와 같이
```
<bean id="tv" class="polymorphism.SamsungTV" destroy-method="destroyMethod" lazy-init="true" scope="prototype"/>
```
`scope="prototype"` 으로 지정해주면 된다. 
