---
layout: post
title: "[MLOps] FlashAttention 이해하기"
subtitle: "[MLOps] Flash attention"
categories: programming
tags: mlops
comments: true
---

>


### flash attention이란?

transformer의 각 attention head 마다 memory I/O 최소화하는 기술을 적용함
fusing은 계산의 순서를 변경해서 gpu 메모리의 이점을 얻는 방식임. flash attention은 이 fusing 기법 중 하나.

### flash attention v1

[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/flash-attention/01.png?raw=true)

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/flash-attention/02.png?raw=true)

우선 벡터를 타일화 ([Tiling](https://www.intel.com/content/www/us/en/developer/articles/technical/efficient-use-of-tiling.html)) 하여 더 빠른 메모리에 올릴 수 있게함.
tiling하여 모든 데이터를 메모리에 가지고있는게 아니라, 일부만 가지고있고 계산결과는 필요시에 recomputation(재계산)하여 사용하기때문에 많은 메모리를 절약할수있음.
gpu 아키텍쳐를 보면, 메모리 계층별로 대역폭이랑 메모리사이즈가 다름. SRAM이 사이즈작은대신에 대역폭은 큼. HBM 사이즈큰대신에 대역폭 개구림.
저자들은 느린  GPU HBM(main memory)에서 N\*N attention 연산을 지양하게하여 속도를 높히고자함.
Q, K, V matrix를 SRAM으로 로드 한 다음에 attention 연산을 수행함.  그리고 그 결과를 HBM에 씀.
GPT-2 로 실험했을때, 결과적으로 7.6배의 빠른 결과를 얻었다고함.
이때 과정을 SW적으로 풀었을뿐이지 연산과정은 동일하여 기존 MHA와 결과가 완전히 동일하므로 아무런 수정없이 기존의 방식을 대체할수있음.

### flash attention v2

[FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691)
v1 보다  2배 더 빨라진 방식을 제안.
- non-matmul FLOPs를 최소화하고자함.
- attention 연산을 병렬로 처리하고자함
- shared memory 통신을 줄이고자함.

기존(v1?)에는 batch size \* number of heads 만큼 스레드를 만들어서 병렬처리하는 방식을 적용
→ 긴 시퀀스 (작은배치, 작은 헤드) 에는 병렬화가 잘 안됨..’
→ 시퀀스 길이에 걸친 병렬화 적용

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/flash-attention/03.png?raw=true)


Q를 쪼개서 병렬화시킴. (워프라는 스레드묶음단위로 쪼개짐)
K, V는 전체 접근 가능하게 메모리에 올라가고 쪼개진 Q 에 따라서 쪼개진 Q K\^T 가 계산되고, 그에따라 쪼개진 V가 최종 계산되는 방식.

MQA와 GQA도 지원한다고함. → K-V cache 사이즈를 줄일수있음

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/flash-attention/04.png?raw=true)

시퀀스 길이가 길수록 유의미한 속도이득을볼수있다고함.

> [https://towardsai.net/p/machine-learning/understanding-flash-attention-and-flash-attention-2-the-path-to-scale-the-context-lenght-of-language-models](https://towardsai.net/p/machine-learning/understanding-flash-attention-and-flash-attention-2-the-path-to-scale-the-context-lenght-of-language-models)<br>[https://huggingface.co/docs/text-generation-inference/conceptual/flash_attention](https://huggingface.co/docs/text-generation-inference/conceptual/flash_attention)
