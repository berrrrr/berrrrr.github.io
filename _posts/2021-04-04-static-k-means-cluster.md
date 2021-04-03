---
layout: post
title: reandomseed 고정해서 항상 동일한 군집을 이루게하기
subtitle: reandomseed 고정해서 항상 동일한 군집을 이루게하기
categories: datascience
tags: ml
comments: true
---

reandomseed 고정해서 항상 동일한 군집을 이루게하기

sklearn의 k-means 클러스터링 함수는 같은 모델로 predict를 하고 동일한 군집으로 나눠도 군집에 대한 라벨링이 달라질수있다.
(예를들면, a군집=1, b군집=2, c군집=3 으로 라벨링했던게 그 다음에는 a군집=2, b군집=3, c군집=1 이런식으로 완전히 달라짐)
이는 k-means클러스터 모델에 random seed를 아래와 같이 고정하면된다.
```python
def unsupervised_learning(data, n=30):
    km_tt_model = km(n_clusters=n, algorithm='auto', random_state=np.random.RandomState(seed=1))
    km_tt_model.fit(data)  # 학습
    pickle.dump(km_tt_model, open('../model/static_tt_model', 'wb')) # 저장
    predict_list = km_tt_model.predict(data)  # clustering
    return
```

특이한게 상수로 seed를 주는게 아니라 numpy의 random state instace를 생성해서 줘야하는데 이 random state instacance의 seed를 고정하면된다.