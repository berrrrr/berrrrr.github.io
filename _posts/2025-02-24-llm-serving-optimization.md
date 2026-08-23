---
layout: post
title: "[MLOps] LLM 서빙 최적화 기법들"
subtitle: "prefill과 decode의 병목부터 batching, KV cache, speculative decoding까지"
categories: programming
tags: mlops
comments: true
---

LLM 서빙 최적화 자료를 보다 보면 `FlashAttention`, `PagedAttention`, `Continuous Batching` 같은 용어가 계속 나온다. 처음에는 전부 GPU를 빠르게 쓰기 위한 비슷한 기법처럼 보였는데, 다시 정리해보니 각각 해결하려는 병목이 달랐다.

가장 먼저 기억할 것은 **LLM 요청이 한 번의 연산으로 끝나지 않는다**는 점이다. 입력 prompt를 한꺼번에 처리하는 단계와, 다음 token을 하나씩 생성하는 단계의 특성이 다르다. 따라서 무엇을 최적화할지 결정하려면 먼저 어느 단계가 느린지 봐야 한다.

## 먼저 볼 지표

서빙 성능을 말할 때 단순히 `tokens/s` 하나만 보면 실제 사용자 경험을 놓치기 쉽다.

- **TTFT(Time To First Token)**: 요청을 보낸 뒤 첫 token을 받을 때까지 걸린 시간
- **TPOT(Time Per Output Token)** 또는 **ITL(Inter-Token Latency)**: 첫 token 이후 token 사이의 지연 시간
- **Throughput**: 초당 처리한 요청 수 또는 output token 수
- **Queue time**: 요청이 실행되기 전에 scheduler에서 기다린 시간
- **GPU memory/KV cache utilization**: 동시에 수용할 수 있는 요청 수와 직결되는 값
- **p95/p99 latency**: 일부 느린 요청까지 SLO를 만족하는지 보기 위한 tail latency

throughput을 최대화하려고 batch를 크게 만들면 개별 요청의 대기 시간이 늘 수 있다. 반대로 latency만 낮추려고 요청을 하나씩 처리하면 GPU가 놀게 된다. 그래서 운영에서는 **목표 latency 안에서 완료한 유효 요청량(goodput)**을 기준으로 보는 편이 더 현실적이다.

## Prefill과 Decode

LLM inference는 크게 두 단계로 나눌 수 있다.

### Prefill

입력 prompt의 모든 token을 한 번에 처리하고 각 layer의 Key/Value를 cache에 저장하는 단계다. prompt가 길수록 연산량이 커지고 TTFT가 길어진다. 행렬 연산의 비중이 높아 GPU의 계산 성능을 비교적 잘 활용할 수 있다.

이 단계에는 다음 기법들이 주로 영향을 준다.

- FlashAttention과 최적화된 attention kernel
- kernel fusion
- 공통 prompt의 prefix caching
- 긴 prompt를 나눠 실행하는 chunked prefill

### Decode

이전까지 생성한 token과 KV cache를 이용해 다음 token 하나를 만들고, 이 과정을 종료 조건을 만날 때까지 반복한다. 한 번의 step에서 계산하는 token 수가 적고 기존 KV cache와 model weight를 계속 읽어야 해서, 작은 batch에서는 계산량보다 **memory bandwidth**가 병목이 되기 쉽다.

이 단계에는 다음 기법들이 중요하다.

- continuous/in-flight batching
- 효율적인 KV cache 관리
- quantization
- speculative decoding
- 적절한 종료 조건

결국 “어떤 기법이 제일 빠른가?”보다는 “현재 workload에서 prefill, decode, queue 중 어디가 병목인가?”를 먼저 물어야 한다.

## GPU Kernel Fusion

GPU 연산은 kernel을 실행할 때마다 launch overhead가 생기고, 중간 결과를 HBM에 썼다가 다음 kernel이 다시 읽기도 한다. 연속된 작은 연산을 하나의 kernel로 합치면 이 비용을 줄일 수 있다.

예를 들면 다음과 같은 연산을 함께 처리할 수 있다.

- bias addition과 activation
- residual addition과 normalization
- QKV projection
- RoPE 적용과 attention 전후의 일부 연산

다만 연산을 합친다고 항상 빨라지는 것은 아니다. tensor shape, batch 크기, GPU architecture에 따라 최적의 kernel이 달라지고, fusion 때문에 register 사용량이 커져 오히려 성능이 떨어질 수도 있다. 직접 CUDA kernel부터 작성하기보다는 TensorRT-LLM, vLLM처럼 이미 최적화된 engine이나 compiler가 제공하는 fused kernel을 사용하고 실제 workload로 측정하는 편이 낫다.

## Early Stopping과 출력 길이 제한

autoregressive model은 output token 하나를 만들 때마다 decode step을 한 번 수행한다. 따라서 필요 없는 token을 생성하지 않는 것이 가장 단순하면서도 확실한 최적화다.

- EOS token을 정상적으로 생성하도록 학습하고 설정한다.
- API에서 `stop` sequence를 지정한다.
- 용도에 맞는 `max_tokens`를 둔다.
- 구조화된 응답이라면 문법이나 schema를 만족한 시점에 종료할 수 있는지 검토한다.

주의할 점은 일부 library의 `early_stopping` 옵션은 beam search 종료 규칙만 의미한다는 것이다. 일반적인 생성 중단과 같은 뜻이라고 생각하면 안 된다.

또한 출력 길이를 너무 짧게 제한하면 답이 잘리는 만큼 품질이 바뀐다. 채팅, 요약, 분류처럼 use case별 output token 분포를 확인한 뒤 제한값을 잡아야 한다.

## Key/Value Cache

self-attention에서 다음 token을 생성할 때 과거 token의 Key와 Value를 매번 다시 계산할 필요는 없다. 한 번 계산한 값을 GPU memory에 저장해 두고 새 token의 Query와 함께 사용하는 것이 **KV cache**다. 덕분에 decode의 중복 연산은 크게 줄지만, 동시 요청과 context가 늘수록 cache가 GPU memory를 많이 차지한다.

한 sequence의 대략적인 KV cache 크기는 다음과 같이 생각할 수 있다.

```text
2 × layer 수 × KV head 수 × head dimension
  × cached token 수 × element당 byte 수
```

앞의 `2`는 Key와 Value 두 개를 의미한다. 실제 서빙에서는 활성 요청 전체의 cached token 수를 합쳐야 하므로, 긴 context 요청 몇 개만으로도 수용 가능한 batch가 크게 줄 수 있다.

KV cache 부담을 줄이거나 효율적으로 쓰는 방법도 여러 가지다.

- **MQA/GQA**: Query head보다 KV head 수를 줄여 cache 크기와 읽기 양을 줄인다.
- **KV cache quantization**: FP8/INT8 등 낮은 정밀도로 저장한다. memory는 줄지만 model과 hardware별 품질·속도를 검증해야 한다.
- **Prefix caching**: system prompt처럼 여러 요청이 공유하는 prefix의 KV를 재사용한다.
- **PagedAttention**: KV cache를 고정된 연속 공간으로 미리 크게 잡는 대신 block 단위로 나눠 필요할 때 할당한다.

[vLLM의 PagedAttention](https://arxiv.org/abs/2309.06180)은 OS의 virtual memory와 비슷한 방식으로 KV block을 관리해 memory fragmentation과 과도한 사전 할당을 줄인다. 이것은 attention 계산식 자체를 바꾸는 FlashAttention과는 다른 문제를 해결한다.

## FlashAttention

일반적인 attention 구현은 큰 attention matrix를 GPU의 HBM에 기록하고 다시 읽는 과정에서 많은 memory I/O가 발생한다. [FlashAttention](https://papers.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html)은 attention을 작은 tile로 나누고 빠른 on-chip SRAM에서 처리해 HBM과 SRAM 사이의 읽기·쓰기를 줄인다. 근사 attention이 아니라 결과를 유지하는 exact attention algorithm이라는 점도 중요하다.

긴 prompt의 prefill처럼 여러 token의 attention을 계산할 때 특히 효과가 크다. 반면 decode에서는 새 Query 하나가 기존 KV cache를 읽는 구조라서 FlashAttention 하나만으로 모든 병목이 사라지지는 않는다. decode 성능은 batching과 KV cache layout, memory bandwidth의 영향도 크게 받는다.

## Batching

GPU는 요청 하나보다 여러 token을 함께 계산할 때 활용률이 높아지는 경우가 많다. 문제는 각 요청의 prompt와 output 길이가 제각각이라는 점이다.

### Static Batching

미리 정한 요청들을 하나의 batch로 묶고 전부 끝날 때까지 같은 batch로 실행한다. 구현은 단순하지만 짧은 요청이 끝나도 긴 요청을 기다려야 하고, 빈자리에 새 요청을 넣지 못한다. 길이를 맞추기 위한 padding도 낭비가 된다.

### Dynamic Batching

요청이 도착할 때마다 아주 짧은 시간 동안 queue에서 기다리며 비슷한 요청을 모아 batch를 만든다. traffic이 일정하지 않아도 batch 크기를 확보할 수 있지만, batch가 만들어진 뒤에는 static하게 끝까지 실행하는 구현도 있다. 대기 시간을 길게 잡으면 throughput은 좋아질 수 있지만 TTFT가 나빠진다.

### Iteration / Continuous / In-flight Batching

LLM은 decode를 여러 iteration에 걸쳐 실행하므로, 요청 단위가 아니라 **iteration 단위로 scheduling**할 수 있다. 한 요청이 끝난 자리에 기다리던 새 요청을 넣고, 새 요청의 prefill과 기존 요청의 decode를 scheduler가 함께 조정한다.

![Orca의 iteration-level scheduling 구조](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-serving-optimization/01.png?raw=true)

*출처: [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)*

`iteration-level batching`, `continuous batching`, `in-flight batching`은 engine마다 세부 구현과 용어가 조금씩 다르지만, 완료된 요청을 batch에서 내보내고 실행 중에도 새 요청을 받아 GPU의 빈자리를 줄인다는 큰 방향은 같다. NVIDIA 문서에서도 in-flight batching을 continuous 또는 iteration-level batching이라고 함께 설명한다.

batch가 크면 항상 좋은 것도 아니다. 긴 prefill이 decode 요청을 오래 막거나, 너무 많은 token을 한 step에 넣어 latency가 튈 수 있다. 다음 설정을 workload에 맞게 조절해야 한다.

- scheduler가 한 번에 처리할 최대 sequence 수와 token 수
- batch를 만들기 위해 기다릴 수 있는 시간
- prefill과 decode 중 어느 쪽을 우선할지
- 긴 prefill을 여러 조각으로 나눌지
- KV cache가 부족할 때 요청을 대기, swap, recompute 중 어떻게 처리할지

## Quantization

weight와 activation을 BF16/FP16보다 낮은 정밀도로 표현하면 model이 차지하는 memory와 읽어야 하는 byte 수를 줄일 수 있다. 같은 GPU에 더 큰 model이나 더 많은 KV cache를 올릴 수 있고, 지원되는 kernel과 hardware에서는 연산도 빨라진다.

- **Weight-only INT8/INT4**: 작은 batch에서 weight를 읽는 비용을 줄이는 데 유리할 수 있다.
- **Weight + activation quantization**: FP8, W8A8처럼 연산 자체의 처리량까지 높이는 방식이다.
- **KV cache quantization**: 긴 context나 많은 동시 요청에서 cache memory를 줄인다.

하지만 낮은 bit 수가 곧바로 낮은 latency를 보장하지는 않는다. dequantization overhead와 kernel 지원 여부에 따라 이득이 달라지고, calibration 방식에 따라 품질이 떨어질 수 있다. 평균 benchmark 점수뿐 아니라 실제 prompt의 응답 품질, tail latency, memory 사용량을 함께 비교해야 한다.

## Speculative Decoding

큰 target model이 token을 하나씩 생성하는 대신, 작은 draft model이 다음 token 여러 개를 먼저 제안하고 target model이 이를 한 번에 검증하는 방식이다.

```text
draft model:   A → B → C → D 를 빠르게 제안
target model:  A, B, C, D를 병렬로 검증
               └ 받아들인 prefix까지 사용하고 불일치 지점부터 다시 생성
```

[Speculative Decoding 논문](https://proceedings.mlr.press/v202/leviathan23a.html)의 sampling algorithm처럼 target model의 원래 출력 분포를 유지하는 방식도 있다. 잘 맞으면 비싼 target model 호출 한 번으로 여러 token을 확정할 수 있어 latency가 줄어든다.

효과는 다음 조건에 크게 좌우된다.

- draft model이 target model보다 충분히 저렴한가
- 제안 token의 acceptance rate가 높은가
- draft model을 위한 추가 memory를 감당할 수 있는가
- 이미 큰 batch로 target GPU를 꽉 채운 상황인가

acceptance rate가 낮으면 draft 생성과 검증 비용만 추가된다. 높은 concurrency에서 throughput을 우선하는 상황에서는 target model의 batch 효율을 방해할 수도 있으므로, 낮은 latency가 중요한 workload를 따로 측정하는 편이 좋다.

## 여러 GPU에 model 나누기

model이 GPU 하나에 들어가지 않거나 latency·throughput 목표를 맞추기 어려우면 병렬화도 필요하다.

- **Tensor Parallelism**: layer 내부의 행렬 연산을 여러 GPU로 나눈다. GPU 간 collective communication 비용이 생긴다.
- **Pipeline Parallelism**: layer 묶음을 GPU별 stage로 나눈다. pipeline bubble과 stage 간 균형을 신경 써야 한다.
- **Data Parallelism**: model replica를 여러 개 두고 요청을 분산한다. model 하나가 GPU에 들어갈 때 전체 throughput을 늘리기 좋다.
- **Expert Parallelism**: MoE model의 expert를 여러 GPU에 나눈다.

GPU를 많이 붙인다고 요청 하나가 비례해서 빨라지는 것은 아니다. interconnect와 통신 overhead가 생기므로, 보통은 model과 목표 batch가 들어가는 범위에서 가장 작은 topology를 기준으로 시작해 비교하는 편이 낫다.

## 어떤 순서로 적용할까

내가 실제로 서빙 환경을 점검한다면 다음 순서로 접근할 것 같다.

1. 실제 input/output 길이, concurrency, streaming 여부와 latency SLO를 정의한다.
2. TTFT, TPOT, queue time, throughput, GPU memory를 baseline으로 기록한다.
3. 현재 model과 GPU를 잘 지원하는 serving engine의 기본 최적화를 먼저 사용한다.
4. 불필요하게 긴 출력을 막고 batching/scheduler 설정을 조절한다.
5. KV cache 사용률을 보고 PagedAttention, prefix caching, chunked prefill을 검토한다.
6. 품질 검증이 가능하다면 weight와 KV cache quantization을 비교한다.
7. model이 한 GPU에 들어가지 않을 때 병렬화 전략을 정한다.
8. 낮은 latency가 특히 중요하다면 speculative decoding의 acceptance rate를 측정한다.
9. synthetic benchmark가 아니라 실제 길이 분포와 동시성으로 부하 테스트한다.

증상별로 보면 시작점은 대략 이렇다.

| 증상 | 먼저 확인할 것 |
| --- | --- |
| 긴 prompt에서 첫 응답이 늦음 | FlashAttention, prefix caching, chunked prefill, queue time |
| token이 한 글자씩 느리게 나옴 | decode batch, KV cache bandwidth, quantization, speculative decoding |
| 동시 요청이 늘면 OOM | PagedAttention, KV cache 크기, context 제한, KV quantization |
| GPU 사용률은 낮고 queue가 김 | continuous batching, scheduler 제한, CPU 전처리 병목 |
| 처리량은 높은데 p99가 나쁨 | batch/token 상한, 긴 요청 격리, prefill/decode scheduling |

## 마무리

LLM 서빙 최적화는 하나의 빠른 kernel을 적용하는 문제가 아니었다. prefill에서는 attention과 긴 prompt 처리, decode에서는 반복 실행과 KV cache memory traffic, server 수준에서는 요청 scheduling이 서로 얽혀 있다.

그래서 기능 목록을 전부 켜는 것보다 **내 요청의 길이 분포와 SLO를 기준으로 병목을 찾고 하나씩 비교하는 것**이 중요하다. 같은 model과 GPU라도 batch 크기, context 길이, 출력 길이가 바뀌면 가장 좋은 설정도 달라진다.

## 참고 자료

- [Serving Architecture 3 - LLM Inference](https://tech.scatterlab.co.kr/serving-architecture-3/)
- [NVIDIA - Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
- [HyperCLOVA 서빙 시스템](https://engineering.clova.ai/posts/2022/03/hyperclova-part-3)
- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://papers.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)
- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
- [Fast Inference from Transformers via Speculative Decoding](https://proceedings.mlr.press/v202/leviathan23a.html)
- [TensorRT-LLM - Paged Attention, In-flight Batching, and Request Scheduling](https://nvidia.github.io/TensorRT-LLM/1.1.0rc4/features/paged-attention-ifb-scheduler.html)
