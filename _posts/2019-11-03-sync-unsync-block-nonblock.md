---
layout: post
title: 동기(sync), 비동기(unsync), 블락(block), 논블락(non-block)
subtitle: 동기(sync), 비동기(unsync), 블락(block), 논블락(non-block)
categories: programming
tags: java
comments: true
---


## sync / unsync
| 구분 | 설명 |
|:---:|:---|
| 동기(sync) | system call이 끝날때까지 기다리고 결과물을 가져온다.  | 
| 비동기(unync) | system call 완료여부를 기다리지 않고 call back이 오면 결과물을 가져온다. | 


## block / non-block


| 구분 | 설명 |
|:---:|:---|
| block | 어떤 일을 요청하고, 작업이 끝날 때 까지 다른 일을 할 수 없다.  시스템 call이 끝날때까지 대기해야하고 system call이 완료되면 return한다. | 
| non-block | 어떤 일을 요청하고, 작업이 끝날때 까지 다른 일을 할 수 있다. system call이 완료되지 않아도 대기하지 않고 return한다. | 


## 치킨으로 알아보기
### sync/block(동기/블록)
치킨을 시키고 가게에서 기다린다. (block)  
주인이 지킨이 언제 완성되는지 알려주지 않기때문에 계속 치킨이 다 튀겨지는지 지켜본다. (sync)  
지켜보다가 다 튀겨지면 치킨을 가져온다. 

### sync/non-block
치킨을 시키고 집으로 돌아간다 (non-block)  
주인이 지킨이 언제 완성되는지 알려주지 않기때문에 치킨이 다 튀겨지는지 계속 전화해서 확인한다.(sync)
기다리다가 다 튀겨지면 치킨을 가지고 온다.  

### unsync/block
치킨을 시키고 가게에서 기다린다. (block)    
치킨이 완성되면 주인이 알려줄것이다. (unsync) 하지만 치킨집에서 치킨이 나올때까지 대기해야한다. (block)    
주인이 다 튀겨졌다고 알려주면 치킨을 가지고 온다.  

### unsync/non-block
치킨을 시키고 집으로 돌아간다. (non-block)
치킨이 완성되면 치킨집에서 전화를 해줄것이므로 마음것 딴짓을 한다. (unsync)  
치킨집에서 전화가 오면 치킨을 가지고온다.  