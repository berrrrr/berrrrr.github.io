---
layout: post
title: pandas에서 day of year 타입을 date타입으로 convert 하기
subtitle: pandas에서 day of year 타입을 date타입으로 convert 하기
categories: programming
tags: python
comments: true
---

분석해야하는 데이터에서 date index가 day of year로 되어있어서 난감하던차에.. date로 변경이 쉽게 될까 고민했는데 찾아보니 무척 쉽게 변경가능했다. 

## 변경방법
```
df['Date'] = pd.to_datetime(df['doy'], format='%j').dt.strftime('%m-%d')
```

## 코드해설
바로바로.. day of year를 나타내는 포맷형이 있었던것.. `%j` 가 day of year의 포맷형이다. (month가 `%m`, day가 `%d` 인 것 처럼.. )  
위와 같이 아주 쉽게 변형이 가능하다.  
무척 생소하지만 `%j`는 다른 언어나 플랫폼에서도 사용되는 day of year의 포맷형인듯하다..  