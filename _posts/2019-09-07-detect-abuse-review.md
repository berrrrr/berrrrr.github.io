---
layout: post
title: Detection of Review Abuse via Semi-Supervised Binary Multi-Target Tensor Decomposition
subtitle: Detection of Review Abuse via Semi-Supervised Binary Multi-Target Tensor Decomposition
categories: datascience
tags: paper
comments: true
---

## Detection of Review Abuse via Semi-Supervised Binary Multi-Target Tensor Decomposition
Sime-Supervised Binary Multi-Target Tensor Decomposition(준지도학습) 으로 거짓 리뷰 검출하기

## ABSTRACT
Product reviews and ratings on e-commerce websites provide customers with detailed insights about various aspects of the product such as quality, usefulness, etc. Since they influence customers’ buying decisions, product reviews have become a fertile ground for abuse by sellers (colluding with reviewers) to promote their own products or to tarnish the reputation of competitor’s products. In this paper, our focus is on detecting such abusive entities (both sellers and reviewers) by applying tensor decomposition on the product reviews data. While tensor decomposition is mostly unsupervised, we formulate our problem as a semi-supervised binary multi-target tensor decomposition, to take advantage of currently known abusive entities. We empirically show that our multi-target semi-supervised model achieves higher precision and recall in detecting abusive entities as compared to unsupervised techniques. Finally, we show that our proposed stochastic partial natural gradient inference for our model empirically achieves faster convergence than stochastic gradient and Online-EM with sufficient statistics.
전자상거래 웹사이트에 대한 제품 리뷰와 등급은 고객에게 품질, 유용성 등 제품의 다양한 측면에 대한 상세한 통찰력을 제공한다. 고객의 구매 결정에 영향을 미치기 때문에, 제품 리뷰는 판매자가 자신의 제품을 홍보하거나 경쟁사 제품의 명성을 더럽히기 위해 악용하는 비옥한 토대가 되었다. 본 논문에서는, 제품 검토 데이터에 텐서 분해를 가함으로써, 그러한 남용되는 실체(판매자와 검토자 모두)를 검출하는 것에 초점을 맞추고 있다. 텐서 분해는 대부분 지도되지 않지만, 우리는 현재 알려진 남용 행위들을 이용하기 위해 우리의 문제를 semi-supervised binary multi-target tensor decomposition 로 푼다. 우리는 우리의 semi-supervised binary multi-target tensor decomposition 모델이 감독되지 않은 기술에 비해 남용되는 실체를 탐지하는 데 있어 더 높은 정밀도와 리콜을 달성한다는 것을 경험적으로 보여준다. 마지막으로, 우리는 모델에 대해 제안된 확률론적 부분 자연적 구배 추론을 경험적으로 충분한 통계를 가진 온라인-EM과 확률적 구배보다 더 빠른 수렴을 달성한다는 것을 보여준다.