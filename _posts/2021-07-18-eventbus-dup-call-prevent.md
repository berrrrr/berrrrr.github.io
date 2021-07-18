---
layout: post
title: "eventBus 사용시 중복호출방지"
subtitle: "eventBus 사용시 중복호출방지"
categories: programming
tags: frontend
comments: true
---

A컴포넌트의 버튼을 눌러 B 컴포넌트(모달)의 이벤트를 호출하는 코드를 짰는데, 버튼누를때마다 B컴포넌트의 이벤트가 2번씩 (어쩔때는 4번씩 ㅡㅡ) 호출되는 현상이 있었다. 

도대체 왜이러는지 이해가 안갔는데 조금 서치해보니 작업이 끝나서 B컴포넌트(모달)이 삭제되어도 이벤트버스가 남아있기때문에 중복호출이 될수있다고한다. 

이러한 중복호출을 막으려면 eventbus.off를 같이 정의해줘야한다.

eventbus.off는 컴포넌트 삭제시 이벤트버스도 삭제하겠다는 의미이다.

아래와 같이 off/on 메소드를 동시에 정의했더니 중복호출되는 현상을 막을수있었다... 

```java
this.$eventBus.$off('set-demo-event');
this.$eventBus.$on('set-demo-event', this.setDemoEvent);
```

이때 중요한건, 반드시 **off 가 먼저** 정의되어야한다!!!