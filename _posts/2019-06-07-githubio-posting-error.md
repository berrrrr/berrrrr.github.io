---
layout: post
title: github page에 포스팅이 안되는 경우
subtitle: github page에 포스팅이 안되는 경우
categories: etc
tags: blog
comments: true
---
> github page에 포스팅이 안되는 경우

## 문제점

모든것을 다 정상적으로 설정하고 _post에 포스팅을 올렸는데도
github page 에 포스팅이 정상적으로 되지 않는 경우


## 발생 원인

여러가지 이유가 있을 수 있겠지만,
내 경우에는 모든게 다 정상이었는데도 포스팅이 되지 않아
원인이 뭔지 길게 삽질을 했는데
결국 원인은 인코딩문제였다.. 

md파일의 인코딩이 euckr로 되어있었는데 github에서 포스팅을 안해주더라. 
utf8로 인코딩 변경하니까 정상적으로 올라갔다.

## 해결방법 

vscode에서 아래와 같이 쉽게 인코딩을 변경할 수 있다.


![image](https://www.moongchi.dev/wp-content/images/2019-06-07.png)

하단에 UTF-8이라고 써있는 부분을 누르면 Selection Action에 
1. Reopen with Encoding
2. Save with Encoding

두가지 메뉴가 뜨는데 
`Reopen with Encoding` 로 euckr로 파일을 오픈 한 뒤
`Save with Encoding` 로 utf8로 저장해주면 된다. 
