
reandomseed 고정해서 항상 동일한 군집을 이루게하기

sklearn의 k-means 클러스터링 함수는 같은 모델로 predict를 하고 동일한 군집으로 나눠도 군집에 대한 라벨링이 달라질수있다.
이는 k-means클러스터 모델에 random seed를 아래와 같이 고정하면된다.

특이한게 상수로 seed를 주는게 아니라 numpy의 random state instace를 생성해서 줘야하는데 이 random state instacance의 seed를 고정하면된다.