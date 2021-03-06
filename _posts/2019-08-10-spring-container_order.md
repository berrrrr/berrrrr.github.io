---
layout: post
title: Log로 살펴보는 Spring Container Loading 순서
subtitle: Log로 살펴보는 Spring Container Loading 순서
categories: programming
tags: spring
comments: true
---

Spring Container Loading 순서를 알아보자

tomcat 서버 올라오는 로그를 살펴보면 spring container가 아래와 같은 순서로 올라오는 듯 하다. 

## 1. web.xml 로딩
root context servlet (일종의 전역변수 개념의 Bean을 등록..) 

### 1.1 ContextLoaderListener 로딩
```
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath*:spring/context-*.xml</param-value>
    </context-param>
    
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>  
    </listener>
```
context 설정파일(xml)들을 로딩하여 컨테이너를 구동.
aop context, property, datasource 등이 설정파일에 등록되어있으며 이들이 로딩됨.

```
정보: Initializing Spring root WebApplicationContext
[2019-08-07 09:26:16.227][INFO ][ContextLoader][initWebApplicationContext:307][] - Root WebApplicationContext: initialization started
[2019-08-07 09:26:16.491][INFO ][XmlWebApplicationContext][prepareRefresh:510][] - Refreshing Root WebApplicationContext: startup date [Wed Aug 07 09:26:16 KST 2019]; root of context hierarchy
[2019-08-07 09:26:16.647][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from file [\WEB-INF\classes\spring\context-aspect.xml]
[2019-08-07 09:26:16.864][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from file [\WEB-INF\classes\spring\context-common.xml]
[2019-08-07 09:26:17.330][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from file [\WEB-INF\classes\spring\context-datasource.xml]
[2019-08-07 09:26:17.346][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from file [\WEB-INF\classes\spring\context-security.xml]
[2019-08-07 09:26:17.355][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from file [\WEB-INF\classes\spring\context-transaction.xml]
[2019-08-07 09:26:17.406][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from URL [jar:file:/WEB-INF/lib/resources-0.0.1.jar!/spring/context-mapper.xml]
```

#### 1.1.1 main property Load
context 설정파일(xml) 중 main property 설정이 있다면 로딩
```
    <context:property-placeholder location="classpath*:*.properties" />
```
```
[2019-08-07 09:26:18.356][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from file [\WEB-INF\classes\config.properties]
[2019-08-07 09:26:18.357][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from file [\WEB-INF\classes\log4jdbc.log4j2.properties]
[2019-08-07 09:26:18.358][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from URL [jar:file:/WEB-INF/lib/ehcache-2.10.0.jar!/build-info.properties]
[2019-08-07 09:26:18.358][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from URL [jar:file:/WEB-INF/lib/resources-0.0.1.jar!/messages.properties]
[2019-08-07 09:26:18.359][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from URL [jar:file:/WEB-INF/lib/org.eclipse.paho.client.mqttv3-1.1.0.jar!/bundle.properties]
[2019-08-07 09:26:18.364][INFO ][PropertySourcesPlaceholderConfigurer][loadProperties:172][] - Loading properties file from URL [jar:file:/WEB-INF/lib/poi-3.13.jar!/font_metrics.properties]
```

### 1.1.2 autowired Bean Load
```
[2019-08-07 09:26:18.399][INFO ][AutowiredAnnotationBeanPostProcessor][<init>:153][] - JSR-330 'javax.inject.Inject' annotation found and supported for autowiring
[2019-08-07 09:26:18.569][INFO ][PostProcessorRegistrationDelegate$BeanPostProcessorChecker][postProcessAfterInitialization:309][] - Bean 'org.springframework.scheduling.annotation.ProxyAsyncConfiguration' of type [class org.springframework.scheduling.annotation.ProxyAsyncConfiguration$$EnhancerBySpringCGLIB$$b9e4c773] is not eligible for getting processed by all BeanPostProcessors (for example: not eligible for auto-proxying)
```

#### 1.1.3 Datasource Load
```
[2019-08-07 09:26:19.387][INFO ][EncryptedDriverManagerDataSource][setDriverClassName:133][] - Loaded JDBC driver: com.mysql.jdbc.Driver
```

#### 1.1.4 Initialize Config
```
[2019-08-07 09:26:19.394][INFO ][ConfiguratorFactory][initialize:95][] - Initialize Configuration [config.properties].
[2019-08-07 09:26:19.399][INFO ][ConfiguratorFactory][initialize:108][] - Initialize Configuration [config/config.loc.properties].
```


[2019-08-07 09:26:21.759][INFO ][ContextLoader][initWebApplicationContext:347][] - Root WebApplicationContext: initialization completed in 5524 ms

여기까지 root application context 로드 완료 

## 2. dispatcher-servlet.xml 로드
```
8월 07, 2019 9:26:21 오전 org.apache.catalina.core.ApplicationContext log
정보: Initializing Spring FrameworkServlet 'dispatcher'
[2019-08-07 09:26:21.812][INFO ][DispatcherServlet][initServletBean:485][] - FrameworkServlet 'dispatcher': initialization started
[2019-08-07 09:26:21.818][INFO ][XmlWebApplicationContext][prepareRefresh:510][] - Refreshing WebApplicationContext for namespace 'dispatcher-servlet': startup date [Wed Aug 07 09:26:21 KST 2019]; parent: Root WebApplicationContext
[2019-08-07 09:26:21.818][INFO ][XmlBeanDefinitionReader][loadBeanDefinitions:317][] - Loading XML bean definitions from ServletContext resource [/WEB-INF/dispatcher-servlet.xml]
```
Servlet Context(dispatcher-servlet) 로드. root application context와 달리 서블렛 자신안에서 사용되는 Bean 을 등록.. (지역변수의 개념)

### 2.1 RequestMapping Handler Mapping

이런식으로 request, handler mapping
```
[2019-08-07 09:26:22.571][INFO ][RequestMappingHandlerMapping][registerHandlerMethod:217][] - Mapped "{[/configuration/setservicedisturbance],methods=[POST]}" onto public hae.iot.core.valueobject.ValueObjectAssembler hae.iot.home.web.ConfigurationController.reqSetServiceDisturbance(hae.iot.core.valueobject.ValueObjectAssembler) throws java.lang.Exception
```

### 2.2 parent context 등록
parent context (root application context) 등록
```
[2019-08-07 09:26:23.404][INFO ][RequestMappingHandlerAdapter][initControllerAdviceCache:517][] - Looking for @ControllerAdvice: WebApplicationContext for namespace 'dispatcher-servlet': startup date [Wed Aug 07 09:26:21 KST 2019]; parent: Root WebApplicationContext
```

[2019-08-07 09:26:23.959][INFO ][DispatcherServlet][initServletBean:504][] - FrameworkServlet 'dispatcher': initialization completed in 2147 ms

여기까지 servlet context 로드 완료
