---
layout: post
title: "[vue] 컴포넌트간 데이터 전달하기"
subtitle: "[vue] 컴포넌트간 데이터 전달하기"
categories: programming
tags: frontend
comments: true
---

Vue에서 컴포넌트간에 데이터를 와리가리하고싶으면 어떻게해야할까?

# 1. Props 속성

상위컴포넌트에서 하위컴포넌트로 데이터를 전달할때 사용.

❗️ 하위에서 상위컴포넌트로 데이터전달은 안됨.. 하고싶으면 아래에서 소개하는 이벤트버스 사용해야함.

```jsx
<child-component v-bind:props 속성이름="상위컴포넌트에서 전달하고자하는 data">
</child-component>
```

```jsx
Vue.component('child-component', { props: ['props 속성이름']}); 
```

이렇게 짜면 상위컴포넌트에서 전달하고자하는 data가 하위컴포넌트의 props로 전달된다.

# 2. EventBus

서로 전혀 상관없는 컴포넌트간 데이터 전달이 가능. 

보내는 컴포넌트에서는 `.$emit()` 을, 받는 컴포넌트에서는 `.$on()`을 사용하면 된다. 

```jsx
var eventBus = new Vue();
```

```jsx
methods: {
	sendDataToComonentB: function(){
		eventBus.$emit('이벤트명', data);
	}
}
```

```jsx
methods : {
	getDataFromComponentA: function(){
		eventBus.$on('이벤트명', function(data){ console.log(data); });
	}
}
```