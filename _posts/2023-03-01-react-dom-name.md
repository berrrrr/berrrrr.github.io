---
layout: post
title: "[React] DOM에 이름달기"
subtitle: "[React] DOM에 이름달기"
categories: programming
tags: frontend
comments: true
---
💡 ref 를 통해 DOM에 이름을 다는 방법을 알아보자!


일반 HTML에서 DOM 요서에 이름을 달 때는 id를 사용

```python
<div id="my-element"></div>
```

리액트에서도 이와 같이 DOM에 이름을 달 수 있음. `ref` 개념.

## 1. ref는 어떤 상황에서 사용해야 할까?

DOM을 꼭 직접적으로 건드려야할  때 `ref` 를 사용한다. 

## 2. ref 사용

### 1) 콜백 함수를 통한 ref 설정

`ref` 를 만드는 가장 기본적인 방법은 **콜백함수**를 이용하는 것이다. ref를 달고자 하는 요소에 `ref`  라는 콜백함수를 props 로 전달해주면 된다.

```jsx
<input ref={(ref) => {this.input=ref}} />
```

이 콜백함수는 ref값을 파라미터로 전달받고, 함수 내부에서 전달받은 ref를 컴포넌트의 멤버 변수로 설정한다.

`this.input` 은 input DOM을 가르키게 된다.

## 2) createRef를 통한 ref 설정

```jsx
import React, { Component } from "react";

class RefSample extends Component{
    input = React.createRef();

    handleFocus= () =>{
        this.input.current.focus();
    }

    render(){
        return(
            <div>
                <input ref={this.input} />
            </div>
        );
    }
}

export default RefSample;
```

멤버변수에 `React.createRef()` 를 담아주고, 그 멤버변수를 ref를 달고자하는 요소의 ref props로 넣어주면 ref 설정이 완료된다. 

위와 같이 설정하면 `this.input.current` 로 해당 DOM에 접근할 수 있다.

## 3. 컴포넌트에 ref 달기

react component에도 직접 ref를 달 수 있다. 주로 컴포넌트 내부에있는 DOM을 컴포넌트 외부에서 사용할 때 쓴다. 

```jsx
<MyComponent ref={(ref) => {this.myComponent=ref}} />
```

이렇게 하면 MyComponent 내부의 메서드 및 멤버변수에도 접근이 가능하다. 

(ex. `this.myComponent.input`)

## 4. 주의할점

서로 다른 컴포넌트끼리 데이터를 교류할때 ref를 사용하면 안됨. 컴포넌트끼리 데이터를 교류할 때는 언제나 데이터를 부모 ↔ 자식 흐름으로 교류해야함. → 나중에 배울 Redux, Context API를 사용해서 효율적으로 데이터를 교류하면 됨.