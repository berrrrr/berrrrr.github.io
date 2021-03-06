---
layout: post
title: "spring @async 어노테이션으로 비동기 구현하기"
subtitle: "spring @async 어노테이션으로 비동기 구현하기"
categories: programming
tags: spring
comments: true
---

spring에서는 비동기처리시 @async annotation으로 쉽게 구현할수있다. java에서 thread로 구현하는것과 어떻게 다른지 알아보자. 

## Java 비동기방식 처리
java에서 비동기처리를 하고자한다면, thread를 사용해야할것이다. 아래와같이.  
```
public class GreetingService {

    public void method1(final String message) throws Exception {
        new Thread(new Runnable() {
            @Override
            public void run() {
                // do something
            }            
        }).start();
    }

}
```
그리고 이러한 thread들을 관리하려면 executorService를 사용해야한다. 
```
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class GreetingService {

    static ExecutorService executorService = Executors.newFixedThreadPool(10);

    public void method1(final String message) throws Exception {
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                // do something
            }            
        });
    }

}
```

## Spring 비동기방식 처리 
Spring에서는 @async annotation을 붙여서 thread를 선언한것과 같이 class를 비동기처리할수있다.

```
@EnableAsync
@SpringBootApplication
public class Application {
    ...
}
```

```
public class GreetingService {

    @Async
    public void method1(String message) throws Exception {
        // do something
    }

}
```
스프링은 기본값으로 SimpleAsyncTaskExecutor 를 사용하여 thread들을 관리한다.  
이를 overide하여 method단, application단에서 thread pool을 관리할 수 있다.

### method레벨로 executor override하기
```
@Configuration
@EnableAsync
public class SpringAsyncConfig {
     
    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }
}
```
```
@Async("threadPoolTaskExecutor")
public void asyncMethodWithConfiguredExecutor() {
    System.out.println("Execute method with configured executor - "  + Thread.currentThread().getName());
}
```


### application 레벨로 executor override하기    
```
@Configuration
@EnableAsync
public class SpringAsyncConfig implements AsyncConfigurer {
     
    @Override
    public Executor getAsyncExecutor() {
        return new ThreadPoolTaskExecutor();
    }
     
}
```
AsyncConfigure interface를 구현해야한다.


출처 http://dveamer.github.io/java/SpringAsync.html  
https://springboot.tistory.com/38