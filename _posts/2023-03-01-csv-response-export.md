---
layout: post
title: "[Vue] ‘text/csv’타입의 api response를 csv파일로 다운로드하기"
subtitle: "[Vue] ‘text/csv’타입의 api response를 csv파일로 다운로드하기"
categories: programming
tags: frontend
comments: true
---

chat gpt느님이 아래와 같이 알려주셧고.. 매우잘된다

```jsx
<template>
  <div>
    <button @click="downloadCSV">Download CSV</button>
  </div>
</template>

<script>
export default {
  methods: {
    async downloadCSV() {
      try {
        const response = await axios.get('your api endpoint');
        const csvData = response.data;

        const blob = new Blob([csvData], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'file.csv');
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
```

In this example, we make a GET request to an API endpoint using the **`axios`**library and retrieve the CSV data from the response. We then create a new Blob object with the CSV data and set the MIME type to **`text/csv`**. We then create a new **`a`**element and set its **`href`**to a URL created from the Blob, and set the **`download`**attribute to the desired filename. Finally, we append the **`a`**
 element to the body and trigger a click event to initiate the download.