---
layout: post
title: window NT 서버 원격접속이 안될경우
subtitle: window NT 서버 원격접속이 안될경우
categories: programming
tags: tips
comments: true
---

## window NT 서버 원격접속이 안될경우 
mstsc로 서버 원격접속 시도시 error : 
인증 오류가 발생했습니다. 
요청한 함수가 지원되지 않습니다.  
원격 컴퓨터 : {IP}  

## 문제 발생 원인
로그인 시도 중 리턴 되는 에러로 서버 인증서 만료 시 발생되는 것으로 추측됨

## 해결 방법
1. 실행창(윈도우키+R) 에서 gpedit.msc 실행
2. 컴퓨터 구성 > 관리 템플릿 > 시스템 > 자격 증명 위임 
3. Oracle 수정 암호화 클릭 후 수정
  - 수정 내용 : 상태 => 사용, 보호 수준 => 취약
