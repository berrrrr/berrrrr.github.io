---
layout: post
title: 'Lombok @Data 와 @Builder 기능'
subtitle: 'Lombok @Data 와 @Builder 기능'
categories: programming
tags: spring
comments: true
---

# Lombok @Data 와 @Builder 기능
Lombok의 @Data가 @Builder가 어떤 코드를 알아서 선언해주는지 알아보자

## @Data
가장 기본적인, getter setter 메소드를 선언해줌.

Lombok 사용 전
```java
public class User {
  private String name;
  private int age;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getAge() {
    return age;
  }

  public void setAge(int age) {
    this.age = age;
  }
}
```

Lombok 사용 후
```java
@Data
public class User {
  private String name;
  private int age;
}

```

## @Buider
Builder 패턴을 선언해줌. (Builder패턴은 객체 생성을 점층적으로 할 수 있게 해주는 디자인패턴임)

Lombok 사용 전
```java
public class User {
  private String name;
  private int age;

  public static UserBuilder builder() {
    return new UserBuilder();
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getAge() {
    return age;
  }

  public void setAge(int age) {
    this.age = age;
  }
}

//Builder Class
public class UserBuilder {
  private String name;
  private int age;

  public User build() {
    User user = new User();
    user.setName(this.name);
    user.setAge(this.age);
    return user;
  }

  public UserBuilder name(String name) {
    this.name = name;
    return this;
  }

  public UserBuilder age(int age) {
    this.age = age;
    return this;
  }
}
```

Lombok 사용 후
```java
@Data
@Builder
public class User {
  private String name;
  private int age;
}
```
