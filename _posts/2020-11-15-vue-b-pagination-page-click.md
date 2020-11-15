---
layout: post
title: '[vue] b-pagination 의 page-click 페이징 구현'
subtitle: '[vue] b-pagination 의 page-click 페이징 구현'
categories: programming
tags: frontend
comments: true
---

vue bootstrap에는 `b-pagination` 이라는 페이징을 도와주는 컴포넌트가 있다. 페이징 이동 버튼이라는게 못할건 아니지만 내가 구현하려면 매우 귀찮은데 이 컴포넌트 하나 쓰면 매우 쉽게 해결 가능하다. 

그런데 처음에 vue-bootstrap `2.16`버전을 쓸 때, 이 컴포넌트에서 페이징하는 방식이

1. 데이터 전체를 불러옴
2. 데이터 row를 내가 원하는 갯수 (per-page) 에 따라 나눔
3. per-page 갯수만큼 테이블에 뿌리고 b-pagination 버튼을 누르면 이미 로딩된 데이터의 페이지를 바꿔가며 이동

이런식인것이 아닌가...?! 
데이터가 수십만건, 수천만건이 된다면..?? 페이지 진입할때마다 그 데이터를 다 로딩할순 없는데...;; 

api 에 limit, offset을 걸어 특정 페이지에서는 특정 offset부터 limit 갯수만큼을 가져와서 최대한 대량데이터 로딩을 피하고싶은게 인지상정.. 

아마 `b-pagination-nav`(b-pagination이랑 같은데, 버튼을 누르면 router 이동을 지원해주는 컴포넌트)를 이용하거나 뭔가 다른 커스텀방식을 이용하면 할 수 있었겠지만 나는 최대한 기존 bootstrap 컴포넌트를 안건드리고 쉽게 가고싶었다.

그런데..!! 두둥.. 페이징기능 구현을 미루다가 얼마전에 들어가보니 2.17+ 버전은 `page-click` 이라는 이벤트를 지원해주는것이 아닌가.. (참고> [vue bootstrap b-pagination > Events](https://bootstrap-vue.org/docs/components/pagination))

이 이벤트를 사용하면 페이징버튼을 누를때의 btEvt와 page번호를 argument로 전달해준다. 

```jsx
bvEvt - The `BvEvent` object. Call `bvEvt.preventDefault()` to cancel page selection
page - Page number to select (starting with `1`)
```

그럼 아래와 같이 무쟈게 쉽게 구현이 특정 페이지에서는 특정 limit-offset을 가지는 데이터만 불러오기 쌉가능.

(코드 전문 아니고 페이징관련된부분만 떼왔음) 

```jsx
<template>
	<b-pagination v-model="currentPage" :total-rows="totalRows" align="center" @page-click="pageClick"></b-pagination>
</template>

<script>
	data() {
		return {
				currentPage: 1
		}
	},
	methods: {
			pageClick: function (button, page){
			                this.currentPage = page;
			                this.getNoticeListByPage(page);
			},
			getNoticeListByPage: function (page) {
                var limit = 20;
                var offset = (page - 1) * limit;

                this.loading = true;
                this.$http
                    .get('/notice/list' + `?offset=${offset}&limit=${limit}`)
                    .then(response => {
                        this.items = response.data;
                    })
                    .catch(error => {
                        console.log(error);
                    })
                    .finally(() => this.loading = false);
			}
	}
</script>
```

참고로 /notice/list' + `?offset=${offset}&limit=${limit}` 이부분은 특정 offset-limit을 가지는 공지사항을 긁어오는 rest api 임.

이런식으로 구현하면 엄청쉽게 페이징 구현이 가능하다.