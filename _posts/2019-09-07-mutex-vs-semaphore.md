---
layout: post
title: mutex와 semaphore 차이점
subtitle: mutex와 semaphore 차이점
categories: programming
tags: java
comments: true
---

# mutex와 semaphore 차이점
mutex와 semaphore는 동기화(syncronize)기법으로 동일 메모리 영역(자원)에 서로 다른 스레드가동시 접근할때 어떤것을 우선할지 접근 스레드의 실행 순서를 지정하는 방법이다. 두 동기화기법이 어떤 차이가 있는지 알아보자.

## mutex
key를 이용해 critical section의 문을 잠그는 방식.

```
pthread_mutex_lock(&mutex);
// 임계영역 시작
// ...
// 임계영역 끝
pthread_mutex_unlock(&mutex);
```
mutex가 특정 thread의 소유가 되면 해당 thread가 mutex를 반납할때까지 다른 thread는 임계영역에 접근할 수 없고 block상태를 유지한다.

## semaphore
semaphore는 리소스의 상태를 나타내는 카운터라고 할수 있다. 
지정된 개수만큼 스레드를 접근시키거나 순번을 정한다.
binary semaphore의 경우 mutex와 동일하게 기능한다. 

## 차이점
- semaphore는 mutex가 될 수 있지만 mutex는 semaphore가 될 수 없다. 
- semaphore는 소유할수 없지만 mutex는 소유할 수 있고 소유주가 책임을 진다.
- mutex는 mutex를 소유한 thread만이 mutex를 해제할 수 있다. semaphore는 semaphore를 해제하지 않은 thread도 semaphore를 해제할 수 있다.
- semaphore는 시스템 범위에 걸쳐있고 파일시스템 형태로 존재한다. mutex는 process범위를 가지며 process 종료시 자동으로 clean up 된다. 