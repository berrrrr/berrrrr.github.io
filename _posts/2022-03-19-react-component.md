---
layout: post
title: "[React] 리액트 컴포넌트"
subtitle: "[React] 리액트 컴포넌트"
categories: programming
tags: frontend
comments: true
---

컴포넌트는 사용자가 보는 화면을 구성하는 구성요소이다.
컴포넌트들은 데이터가 주어졌을때 이를 맞추어 UI를 만들어주고, 
화면에서 나타날때, 사라질때, 변화가 일어날때 주어진 작업들을 처리할 수 있고,
임의 메서드를 만들어 특별한 기능을 붙여줄수있다.  
(⇒ 자바의 클래스같은놈들) 

컴포넌트가 어떤놈들인지 알아보자. 
(책의 최종형태만을 다룸)

## 1. 컴포넌트

### 1) 함수 컴포넌트

```jsx
import './App.css';

function App() {
  const name = '리액트';
  return <div className='react'>{name}</div>;
}

export default App;
```

기본적으로 위와같이 함수로 선언된놈은 **함수 컴포넌트**이다. 이놈은 기본형이라고볼수있다.

**장점**

- 선언하기가 편함
- 메모리를 덜먹음
- 결과물 파일크기가 작음

**단점**

- state 기능 사용불가
- 라이프사이클API 사용불가

근데 뒤에서 Hooks 기능이 도입되면서.. 단점이해결됨 

### 2) 클래스형 컴포넌트

```jsx
import { Component } from 'react/cjs/react.production.min';
import './App.css';

class App extends Component{
  render(){
    const name = 'react';
    return <div className='react'>{name}</div>;
  }
}

export default App;
```

**장점**

- state기능 사용가능
- 라이프사이클API 사용가능
- 임의메서드 사용가능

### 3) 어떤놈을 써야할까?

사실 리액트 공식매뉴얼에서는 컴포넌트를 새로 작성할때 함수컴포넌트 + Hooks 을 사용하는것을 권장

## 2. 첫 컴포넌트 생성

### 1) export

```jsx
const MyComponent = () => {
    return <div>내컴포넌트</div>;
};

export default MyComponent; // export
```

`export` 부분이 다른 파일에서 이 파일을 import할때 MyComponent클래스를 불러오도록 설정함 

### 2) import

```jsx
import MyComponent from "./MyComponent"; // import

const App = () => {
  return <MyComponent />;
};

export default App;
```

`import` 구문이 우리가 만든 MyComponent 컴포넌트를 불러옴 

## 3. props

`props` 는 컴포넌트의 속성으로 해당 컴포넌트를 사용하는 부모컴포넌트에서 설정가능

쉽게말해 컴포넌트 내부 존재하는 변수인데, 이걸 부모컴포넌트에서만 초기화 가능

```jsx
import MyComponent from "./MyComponent";

const App = () => {
  return <MyComponent name="react" favoriteNumber={3}>리액트</MyComponent>;
};

export default App;
```

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MyComponent extends Component {
    // props의 defalt값을 설정함
    static defaultProps = {
        name: '기본 이름'
    };

    // props의 type을 강제로 지정함
    static propTypes = {
        name: PropTypes.string,
        favoriteNumber: PropTypes.number.isRequired
    };

    render() {
        // 비구조화 할당
				// { key1, key2 } = { val1, val2 }
				// key1 = val1, key2 = val2 
        const { name, favoriteNumber, children } = this.props;
        return (
            <div>
                안녕하세요, 제 이름은 {name} 입니다. <br />
                children 값은 {children}
                입니다.
                <br />
                제가 좋아하는 숫자는 {favoriteNumber}입니다.
            </div>
        );
    }
}

export default MyComponent;
```

defaultProps와 propTypes는 꼭 사용할필요는 없지만, 협업을 위해서는 꼭 필요

## 4. state

state는 컴포넌트 내부에서 바뀔 수 있는 값. 

쉽게말해서 컴포넌트 내부에서 자유롭게 사용하는 변수들이라고 볼수있음. 

(부모만 바꿀수있던 props와는 다름) 

### 1) 클래스형 컴포넌트

```jsx
import Counter from "./Counter";

const App = () => {
  return <Counter></Counter>;
}

export default App;
```

```jsx
import React, { Component } from 'react';

class Counter extends Component {
    state = {
        number: 0,
        fixedNumber: 0
    };

    render() {
				// state 를 조회 할 때에는 this.state 로 조회. 비구조화.
        const { number, fixedNumber } = this.state; 
        return (
            <div>
                <h1>{number}</h1>
                <h2>바뀌지 않는 값: {fixedNumber}</h2>
                <button
                    // onClick 을 통하여 버튼이 클릭됐을 때 호출 할 함수를 지정합니다.
                    onClick={() => {
                        this.setState(
                            {
                                number: number + 1
                            },
                            () => {
                                console.log('방금 setState 가 호출되었습니다.');
                                console.log(this.state);
                            }
                        );
                    }}
                >
                    +1
                </button>
            </div>
        );
    }
}

export default Counter;
```

버튼을 클릭하면(onClick), (첫번째 파라미터함수) setState로 내부 변수를 업데이트하고,(두번째 파라미터 콜백함수) 그 다음에 특정작업 수행 

### 2) 함수 컴포넌트

함수컴포넌트에서도 useState라는 함수를 사용해서 state를 사용할수있다

```jsx
import React, { useState } from 'react';

const Say = () => {
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('black');

  const onClickEnter = () => setMessage('안녕하세요!');
  const onClickLeave = () => setMessage('안녕히 가세요!');

  return (
    <div>
      <button onClick={onClickEnter}>입장</button>
      <button onClick={onClickLeave}>퇴장</button>
      <h1 style={{ color }}>{message}</h1>
      <button style={{ color: 'red' }} onClick={() => setColor('red')}>
        빨간색
      </button>
      <button style={{ color: 'green' }} onClick={() => setColor('green')}>
        초록색
      </button>
      <button style={{ color: 'blue' }} onClick={() => setColor('blue')}>
        파란색
      </button>
    </div>
  );
};

export default Say;
```

useState의 인자로는 상태의 초깃값을 넣어주면됨

useState는 배열이 반환되는데 각 원소는 다음과같다

- 첫번째 원소 : 현재상태 (변수)
- 두번째 원소 : 상태를 바꿀수있는 함수 (setter 함수)

또 한 컴포넌트에서 여러번 사용가능하니까, 사용할 여러 변수를 선언하고 위와같이 자유롭게 사용하면된다 

## 5. state 사용시 주의사항

state 업데이트시 반드시 setter 함수를 사용해야함

- 클래스형 컴포넌트 : setState
- 함수 컴포넌트 : useState가 반환하는 세터함수

그 외 초기화방법은 다 안됨

```jsx
// 클래스형 컴포넌트
this.state.number = this.state.number + 1
this.state.array = this.array.push(2);
this.state.object.value = 5;

// 함수 컴포넌트
const [object, setObject] = useState({a:1, b:1});
object.b = 2;
```

배열이나 객체 업데이트시에는 객체 사본을만들고 (깊은복사) 그 사본을 업데이트한 후, 그 사본을 세터함수를 통해 업데이트해야함

```jsx
// 객체
const object = { a:1, b:2, c:3};
const nextObject = { ...object, b:4}; // ... 연산자로 사본을 만들어 b값만 덮어쓰기

// 배열
const array = [
	{id:1, value:true},
	{id:2, value:true},
	{id:3, value:false}
] 

let nextArray = array.concat({id:4}); // 새항목 추가
nextArray.filter(item => item.id !== 2); // id=2 제거
nextArray.map(item => (item.id ===1 ? {...item, value: false} : item)); // id=1 : false 로 설정 
```

일케한뒤 setState나 useState의 setter 함수사용