---
layout: post
title: '[vue] VUEX 사용하기'
subtitle: '[vue] VUEX 사용하기'
categories: programming
tags: frontend
comments: true
---


vuex란??  
모든 컴포넌트가 공통으로 접근할 수 있는 전역변수를 만들어놓는것.. 

## State

state는 변수를 의미한다.

## Mutations

mutations는 변수를 조작하는 함수를 의미한다.

특정 state를 조작하고 싶다면 변수를 사용해야한다.

state를 직접 조작하면 원하지 않는 사이드 이펙트가 생길수 있다.

## Actions

mutations를 호출해 state를 조작함. 

비동기로직인 actions이 동기로직인 mutations을 호출해 state를 조작함. 

외부에서는 mutations를 직접호출하면 안되고 actions 함수를 호출해야함. 

## Getters

여러 Components에서 특정state에 동일한 조작을 해야한다면? 

매 components에 해당 state를 조작하는 동일한 함수를 추가하는건  낭비.

vuex의 해당 state를 조작하여 리턴하는 getter를 추가하면 여러 component에서 공통으로 쉽게 사용할 수 있음. 

## 예제 

### store.js
```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
  user: {
    isAuthenticated: false,
    information: null
  }
};

const mutations = {
  LOGIN_USER(state, username) {
    state.user.isAuthenticated = true;
    state.user.information = { username };
  },
  LOGOUT_USER(state) {
    state.user.isAuthenticated = false;
    state.user.information = null;
  }
};

const actions = {
  login(context, username) {
    context.commit("LOGIN_USER", username);
  },
  logout(context) {
    context.commit("LOGOUT_USER");
  }
};

const getters = {
  isAuthenticated(state) {
    return state.user.isAuthenticated;
  },
  currentUser(state) {
    return state.user.information;
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
});

```

### Login.vue
```javascript
<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(['login']),
    doLogin() {
      if(this.username && this.password){
        this.login(this.username)
      }
    }
  }
};
</script>
```

### Navigation.vue
헤더에있는 네비게이션바에 로그인 사용자 정보를 표시한다고하자
```javascript
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['currentUser', 'isAuthenticated'])
  },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    ...mapActions(['logout'])
  }
};
</script>
```

> [https://joshua1988.github.io/web-development/vuejs/vuex-start/](https://joshua1988.github.io/web-development/vuejs/vuex-start/)

> [https://codesandbox.io/s/vuex-store-yhyj4](https://codesandbox.io/s/vuex-store-yhyj4)