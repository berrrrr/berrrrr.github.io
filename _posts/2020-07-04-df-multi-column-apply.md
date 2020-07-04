---
layout: post
title: pandas Dataframe multi column apply
subtitle: pandas Dataframe multi column apply
categories: programming
tags: python
comments: true
---


논문준비로 전처리하면서 유용했던 기능 시리즈1.  
stack overflow에 치면 바로 나오는 기능이긴 한데 차후에도 종종 써먹을거같아서 정리해놓는다.  

## multi column에 apply 함수 적용하기
apply 함수는 dataframe에서 컬럼단위로 함수를 적용해서 일괄적으로 값을 변환할때 유용하게 쓰인다.   
그런데 컬럼 여러개를 불러와서 함수로 가공해서 값을 반환하고싶다면?  
아래와 같이 apply 를 적용하고자하는 컬럼만으로 구성된 dataframe을 새로 만든다음에 배열불러오듯이 index로 데이터를 불러와서 함수를 적용해준다. 
```python
phone_dataset = new_dataset.loc[:, ['phonelist1', 'phonelist2']]
new_dataset['phone_features'] = phone_dataset.apply(get_phone_feature, axis=1)
# axis=1 을 지정해야 세로축(column) 단위로 함수가 적용됨 

def get_phone_feature(phonelist):
    #인덱스로 각 컬럼값을 불러오면된다. 
    phonelist1 = phonelist[0] # phonelist1 컬럼값이 들어옴
    phonelist2 = phonelist[1] # phonelist2 컬럼값이 들어옴 
    if phonelist1 == phonelist2:
        return true
    else:
        return false
```

이렇게하면 결론적으로 new_dataset['phone_features']  에는 phonelist1과 phonelist2가 같으면 true, 다르면 false값이 들어가게된다. 