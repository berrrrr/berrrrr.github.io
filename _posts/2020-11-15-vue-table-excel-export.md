---
layout: post
title: '[vue] 테이블 데이터 Excel Export 하기'
subtitle: '[vue] 테이블 데이터 Excel Export 하기'
categories: programming
tags: frontend
comments: true
---

Vue에서 테이블 데이터 Excel Export 하기

## 1. 사용 라이브러리

일단 뭐 여러가지 npm 라이브러리들이 존재한다..

그중에 나는 이걸 사용함 

[https://www.npmjs.com/package/xlsx](https://www.npmjs.com/package/xlsx)

(근데 사용하고 보니 제일 major한 라이브러리같음)

```jsx
npm install --save xlsx
```

## 2. json을 excel export하기

처음에는 json raw data를 그대로 export 사용했는데 아래와같이하면 json형식을 그대로 예쁘게 excel로 뽑아줌 

```jsx
downloadExcel(){
      var excelData = XLSX.utils.json_to_sheet(this.items); // this.items 는 json object 를 가지고있어야함 
      var workBook = XLSX.utils.book_new(); // 새 시트 생성 
      XLSX.utils.book_append_sheet(workBook, excelData, '가입자 현황'); // 시트 명명, 데이터 지정
      XLSX.writeFile(workBook, 'account_statistics.xlsx'); // 엑셀파일 만듬
    }
```

## 3. table 그대로 excel export하기

근데 내 경우에는 json raw data 받은다음에 테이블 colpan, rowspan써가면서 필요한애들은 병합하기도 하고 api를 2번 받아서 통계를 내거나 pretty print로 가공하는 등의;; 작업을 했기 때문에 json을 뽑는건 정확한 니즈에 맞지않았음. 자바스크립트로 한번 가공한 테이블형태를 그대로 뽑고싶었는데 이 라이브러리에서 html table dom을 input으로 넣으면 그것도 그대로 뽑아주는 메서드가 있었다. 아래와 같이 하면된다.

```jsx
downloadExcel(){
      var excelData = XLSX.utils.table_to_sheet(document.getElementById('account-statistic-table')); // table id를 넣어주면된다
      var workBook = XLSX.utils.book_new(); // 새 시트 생성 
      XLSX.utils.book_append_sheet(workBook, excelData, '가입자 현황');  // 시트 명명, 데이터 지정
      XLSX.writeFile(workBook, 'account_statistics.xlsx'); // 엑셀파일 만듬
    }
```

이러면 테이블 모양 그대로 (colspan, rowspan한것도 반영되서) 뽑힌다