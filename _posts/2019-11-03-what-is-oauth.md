---
layout: post
title: OAuth2 란?
subtitle: OAuth2 란?
categories: programming
tags: spring
comments: true
---

OAuth 2.0은 다양한 플랫폼 환경에서 권한 부여를 위한 산업 표준 프로토콜. 제3의 앱이 자원의 소유자인 서비스이용자를 대신하여 서비스를 요청할 수 있도록 자원 접근 권한을 위임하는 방법. 

1. resource owner
사용자. (ex. board를 사용하는 사용자)
2. client
권한을 받아 사용하려는 제 3의 앱. (ex. board)
3. authorization Server
인증하고 토큰을 발행하는 주체 (ex. kakao 인증api 서버 )
4. resource server 
filter 기능(토큰이 맞는지 확인) (ex. kakao 토큰을 저장하고있는 서버 )

## Grant Type
- Authorization Code Grant Type : 가장 일반적
- Implicit Grant Type
- Resource Owner Password Credential GrantType
- Client Credential Grant Type

### Flow (Authorization Code Grant Type)
![image](https://image.toast.com/aaaadh/alpha/2017/techblog/1%201%281%29.png?raw=true)
1. 기존 계정과 SNS 계정 연동 요청
2. 요청 SNS 로그인 페이지 출력 (Client ID 값이 포함된 로그인 페이지)
3. ID/PW 를 통해 SNS 계정에 로그인
4. 로그인 성공 시 인증 서버로부터 Authorization code를 발급 받음 (Authentication Server -> 사용자)
5. 발급 받은 code 값과 state 값을 Client 서버로 전송 (사용자 -> Client Server)
6. code 값과 state 값 검증 후 Client 서버에 로그인 되어있는 계정과 SNS 계정이 연동됨

## AccessToken과 Refresh Token
### Access Token
권한확인용으로 사용되는 토큰. 만료기간이 짧다. (-> 탈취당해도 만료가 금방되기때문에 보안강화) 
### Refresh Token
Access Token 만료시에 Refresh Token으로 다시 새 Access Token을 발급받을수있다. 