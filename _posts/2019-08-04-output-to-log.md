---
layout: post
title: Java output, log를 파일로 저장하기
subtitle: Java output, log를 파일로 저장하기
categories: programming
tags: java
comments: true
---

stdout과 log (logger.log)를 저장하는방법이 다르다.  
몰랐는데 stdout은 그냥 리다이렉트해도되지만
logger.log는 콘솔 출력내용을 파일로 떨구는 처리를 해줘야한다. 

## java output를 파일로 저장하기
```
java <filname>.jar > log.txt
```
stdout은 > 표시로 리다이렉트만 해주면 log.txt 에 저장된다.

## java log를 파일로 저장하기
```
java {filename}.jar > log.txt 2>&1 
```

2>&1 의 의미는 아래와 같다.  

`2` refers to the second file descriptor of the process, i.e. stderr.  
`>` means redirection.  
`&1` means the target of the redirection should be the same location as the first file descriptor, i.e. stdout.  