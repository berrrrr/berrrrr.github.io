---
layout: post
title: "[소프트웨어 설계 트레이드오프] 06. API 유지보수 비용 vs 단순함"
subtitle: "[소프트웨어 설계 트레이드오프] 06. API 유지보수 비용 vs 단순함"
categories: programming
tags: systemdesign
comments: true
---

> **소프트웨어 설계 트레이드오프 시리즈**의 글입니다.

> 유지보수 비용을 늘릴것인가? <br>코드를 단순하게 만들것인가?


- 시스템 config 설정방식 = 사용자에게 공개할 필요가 있는 entrypoint
- 컴포넌트들은 설정할 필요가 있는 config 형식을 외부에 공개함
- 두가지 선택지가 존재
  - 다운스트림 컴포넌트를 추상화해서 사용자에게 다운스트림 config공개하지 않기
  - 다운스트림 컴포넌트 config를 아예 사용자에게 공개하고 변경하도록하기
- 어떤 trade off가 있을까?

### 6.1 다른 도구에서 사용되는 기본 라이브러리

- 보통 시스템을 구성할때는 큐, db, cloude등을 통합해서 사용함
- 이때 sdk나 client library를 사용하게됨
- 이런 client library에 config를 전달할 필요가 있음.
  - auth
  - timeout
  - buffer size..
- client는 yaml 파일을 통해 config를 제공
- 이때 호출자는 2가지 방식으로 client에 config를 전달할수잇음.
  - configuration class를 전달
  - config path를 전달

### 6.2 의존성 라이브러리의 설정을 외부에 직접 공개하는 도구

- path를 전달받는 방식 = client library의 config를 외부에 직접 노출하는방식
- 우리가 개발하는 tool은 config가 변경되어도 유지보수 할 필요가 없음
- 그러나 sw에 미치는 영향이 있음
  - tool과 client library간 강결합이 생김
  - client library가 몇 구성 설정을 변경하거나 아예 제거하면 문제가 생길 수 있음
- 그러나 수십, 수백가지의 config를 제공하는 library의 경우, 그냥 이게 편리한 선택지가 될수있음
- 우리 tool호출자는 client library config에 대한 지식까지 가져야함.

### 6.3 의존성 라이브러리의 설정을 추상화하는 도구

- client의 config를 추상화 → 자신이 직접 구성한(추상화한) 설정만 외부에 공개
- 우리 tool호출자는 client library에 대해 전혀 알 필요가 없음
- 우리 tool에서 가이드하는 설정만 하면 되므로 사용성이 좋아짐.
- 그러나 config를 추상화할때, config를 mapping하는 과정이 필요한데 만약 설정값이 수십, 수백가지 존재한다면? 유지보수비용이 너무 높아짐
- 추상화 = 유지보수 비용을 선불로 지불하는 방식
- 그러나 client library가 설정을 변경하거나 제거해도 사용자에게는 그 영향이 미치지 않는다는 장점이있음

### 6.4 클라우드 클라이언트 라이브러리를 위해 새로운 설정 추가하기

- 새로운 기능을 추가하는경우, 하위호환성이 깨질수있음
- 기본설정을 추가하면 하위 호환성을 유지할수있음
- 6.2방식(직접공개방식) = 유저가 직접 추가된 config를 대응해야함. tool개발자는 유지보수 안해도됨.
- 6.3방식(추상화방식) = tool개발자가 유지보수해야함. 대신 유저는 대응할 필요 없음.

### 6.5 클라우드 클라이언트 라이브러리에서 설정을 제거하기

- 6.2방식 (직접공개방식) : 사용자는 크게 영향을 받음. tool에서는 호환성유지를 위한다면 비현실적인방법 (ex. config를 tool에서 강제로 덮어쓰기)으로 유지보수해야함
- 6.3방식(추상화방식) : 사용자는 영향받을 필요가없음. tool에서는 원래 mapping을해주고 있었으므로, 이 mapping을 조금 수정하면 됨.
