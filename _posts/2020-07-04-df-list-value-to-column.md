---
layout: post
title: pandas Dataframe에서 list value를 column으로 나누기
subtitle: pandas Dataframe에서 list value를 column으로 나누기
categories: programming
tags: python
comments: true
---

논문준비로 전처리하면서 유용했던 기능 시리즈2.  
stack overflow에 치면 바로 나오는 기능이긴 한데 차후에도 종종 써먹을거같아서 정리해놓는다.  

## pandas Dataframe에서 list value를 column으로 나누기

`new_dataset['phone_features']` 가 `[0,1,1,1]` 이런식으로 구성된 배열값이라고 했을때,  이를 datafreame column 4개 phone0 phone1, phone2, phone3 로 찢어서 넣고싶다면? 

```
new_dataset = pd.DataFrame(new_dataset['phone_features'].values.tolist()).add_prefix('phone').join(new_dataset)

```

위와 같이 작성해주면 `new_dataset['phone_features']` 의 배열값 `[0,1,1,1]` 이 
phone0=1, phone1=1, phone2=1,  phone3=1 로 찢어져서 들어간다.   
machine learning 입력값으로 one-hot encoding 이나 binary encoding 전처리 할때 사용하면 유용함. 