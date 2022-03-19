---
layout: post
title: "[React] 이벤트핸들링"
subtitle: "[React] 이벤트핸들링"
categories: programming
tags: frontend
comments: true
---

사용자가 웹 DOM 요소들과 상호작용하는것을 이벤트라고함 
리액트에서 이벤트를 사용하는방법에 대해 알아보자

## 1. 리액트의 이벤트 시스템

기본적으로 HTML 이벤트와 인터페이스가 동일. 사용법도 비슷.

```jsx
<button onClick={onClickEnter}>입장</button>
<button onClick={onClickLeave}>퇴장</button>
```

3장의 코드에서 `onClick` 처럼 사용자의 상호작용을 나타내는 요소가 바로 이벤트 

### 1) 이벤트를 사용할때 주의사항

- 이벤트이름은 카멜표기법으로 (ex. onClick, onKeyUp)
- 이벤트에는 ‘함수'를 전달해야함
- DOM 요소에만 이벤트를 설정 가능 (컴포넌트에 이벤트설정 불가능)
    - div, button, input, form 이런놈들에만 가능
    - MyComponent 불가능

### 2) 이벤트 종류

- Clipboard
- Touch
- Keyboard

등등...

나머지는 [https://facebook.github.io/react/docs/events.html](https://facebook.github.io/react/docs/events.html) 참고 

## 2. 예제로 이벤트핸들링 익히기

### 1) 클래스형 컴포넌트

```jsx
import React, { Component } from 'react';
class EventPractice extends Component {
  // state 초기화
  state = {
    username: '',
    message: ''
  };

  // 이벤트에 넣어줄 임의 메서드들 선언 
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  handleClick = () => {
    alert(this.state.username + ': ' + this.state.message);
    this.setState({
      username: '',
      message: ''
    });
  };
  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  };

  // 컴포넌트 정의 
  render() {
    return (
      <div>
        <h1>이벤트 연습</h1>
        <input
          type="text"
          name="username"
          placeholder="유저명"
          value={this.state.username}
          onChange={this.handleChange}
        />
        <input
          type="text"
          name="message"
          placeholder="아무거나 입력해보세요"
          value={this.state.message}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
        <button onClick={this.handleClick}>확인</button>
      </div>
    );
  }
}

export default EventPractice;
```

주의할 핵심코드 

```jsx
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
```

e 가 가지고있는 name 이 key,  e가 가지고있는 value가 값이 되는거임

유저명input에 걸린 handleChange함수는 ‘`username' : '유저명 input에 입력한 값'` 를 실행하게되어 username state를 설정

잘 이해가 안간다면 아래 예시를 보자.. 

```jsx
const name = 'variantKey';
const object = { [name] : 'value' } // { 'variantKey' : 'value' } 를 의미 
```

### 2) 함수 컴포넌트

```jsx
import React, { useState } from 'react';

const EventPractice = () => {
  const [form, setForm] = useState({
    username: '',
    message: ''
  });
  const { username, message } = form;

  const onChange = e => {
    setTimeout(() => console.log(e), 500);
    const nextForm = {
      ...form, // 기존의 form 내용을 이 자리에 복사 한 뒤
      [e.target.name]: e.target.value // 원하는 값을 덮어씌우기
    };
    setForm(nextForm);
  };
  const onClick = () => {
    alert(username + ': ' + message);
    setForm({
      username: '',
      message: ''
    });
  };
  const onKeyPress = e => {
    if (e.key === 'Enter') {
      onClick();
    }
  };

  return (
    <div>
      <h1>이벤트 연습</h1>
      <input
        type="text"
        name="username"
        placeholder="유저명"
        value={username}
        onChange={onChange}
      />
      <input
        type="text"
        name="message"
        placeholder="아무거나 입력해보세요"
        value={message}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
      <button onClick={onClick}>확인</button>
    </div>
  );
};
export default EventPractice;
```