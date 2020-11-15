---
layout: post
title: '[vue] router 이동시 component load하기'
subtitle: '[vue] router 이동시 component load하기'
categories: programming
tags: frontend
comments: true
---

여러 자식 컴포넌트로 구성된 뷰 컴포넌트를 router push하면 부모컴포넌트만 로드되고 자식컴포넌트는 그대로일때가있다. 그럴때는 아래와 같이 router-view를 설정해주면 된다. 

```javascript
<router-view :key="$route.fullPath"></router-view>
```

이렇게하면 컴포넌트 전체가 다 리로드됨!