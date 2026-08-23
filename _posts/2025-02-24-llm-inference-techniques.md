---
layout: post
title: "[MLOps] LLM technique 마스터하기"
subtitle: "[MLOps] LLM technique 마스터하기"
categories: programming
tags: mlops
comments: true
---

> LLM이 빠르고 효율적으로 inference 하기 위해 어떤 테크닉들이 사용되는지 아래 블로그를 통해 정리해보았다 <br>[https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)


## Understanding LLM

### Batching

이미 dynamic batching으로도 잘 알려져있지만, 여러 request를 묶어서 처리해야 gpu 리소스를 효율적으로 활용할 수 있다.
그런데 요 전통적인 배치방식의 치명적인 단점이 뭐냐면 긴 request의 response를 다른 request들 전부 기다려야한다는것이다. ㅜㅜ
그래서 뒤에서 후술할 inflight-batching이라는 방식이 나오게된다.

### Key-value caching

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/01.png?raw=true)

decoder를 생각해보면, 이녀석은 매 시간 새로운 토큰을 생성해내지만 사실 이 새로운 토큰이라는 녀석은 이전에 계산된 토큰의 key-value tensor에 의존성을 가지고있다. 즉 이미 계산한녀석을 또 계산하게되는셈..!
그래서 기존 계산한값을 gpu메모리에 캐싱해두고 다음 순번에 그걸 가져다 쓰는 기법이다.

### LLM memory requirements

결국 LLM메모리의 주 소비자는 두가지 녀석이 된다.
- model wieght
- Key-value cache
**Size of KV cache per token in bytes = 2 \* (num_layers) \* (num_heads \* dim_head) \*  precision_in_bytes**
일케 계산하게되는디 llama 7B짜리 기준으로 캐시만 2GB 먹는다고함.

## Scaling up LLMs with model parallelization

GPU가 한정되어있으니.. 모델을 병렬화해서 큰 request를 처리하는것도 중요한 테크닉 중 하나!
모델 weight를 나눠서 병렬화하는 몇 가지 방법이 있음

### Pipeline parallelism

모델을 수직적 쪼개서 각기 다른 디바이스에서 실행하는것.
모델의 층을 여러 GPU에 분산
한 디바이스의 결과물이 다른 디바이스로 전달되어서 inference를 계속하게됨.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/02.png?raw=true)

근데 어쨌든 다음디바이스가 이전디바이스의 입력을 받기위해 기다리는 약간의 텀이 존재함. micro batching으로 이를 줄일순있찌만 없앨순없음.. 무조건존재함.

### Tensor parallelism

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/03.png?raw=true)

모델을 수평적으로 작게 쪼개는것. 하나의 연산을 여러 GPU에 분산. 어케가능하지?했는데 multi-head attention에서 각 head 를 다른 device에 넣어서 병렬로 실행하는게 가능하다고함.

### Sequence parallelism

tensor paralleism은 layernorm이나 dropout할수없다는 한계점이 있음.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/04.png?raw=true)

근데 이 작업들은 읿력 시퀀스에 따라 독립적이므로 위 그림과 같이 시퀀스에 따라 병렬로 처리하면 layernorm이나 dropout 도 적용 가능함.

<details>

<summary>gpt정리 </summary>

  **LLM 서빙 기술: Pipeline Parallelism vs. Tensor Parallelism**
  LLM(대규모 언어 모델)을 서빙할 때, 하나의 GPU에 모든 파라미터를 담기 어렵기 때문에 여러 개의 GPU를 활용하는 분산 기법이 필요합니다. 대표적인 방법으로 \*\*Pipeline Parallelism(파이프라인 병렬화)\*\*과 \*\*Tensor Parallelism(텐서 병렬화)\*\*이 있습니다.
  **1. Pipeline Parallelism (파이프라인 병렬화)**
  **📌 개념**
  •  LLM 모델을 여러 개의 층(layer) 단위로 나누고, 각 층을 서로 다른 GPU에서 실행하는 방식입니다.
  •  즉, **모델의 깊이(depth)를 GPU에 분산**하는 방식입니다.
  **🛠️ 동작 방식**
  1.  모델을 여러 개의 **Stage**(층 그룹)으로 나눔
  2.  각 Stage를 서로 다른 GPU에 배치
  3.  Forward 및 Backward 패스를 순차적으로 실행하여 결과를 전달
  **📈 장점**
  ✅ **메모리 효율적** → 한 개의 GPU에 전체 모델을 올릴 필요 없음
  ✅ **활용도 증가** → 더 큰 모델을 다룰 수 있음
  **⚠️ 단점**
  ❌ **레이턴시 증가** → 각 GPU가 순차적으로 연산하므로 병목이 생길 수 있음
  ❌ **최적화 필요** → 모델을 균등하게 나누지 않으면 일부 GPU가 유휴 상태가 될 수도 있음
  **🚀 대표적 프레임워크**
  •  **DeepSpeed (Microsoft)**
  •  **Megatron-LM (NVIDIA)**
  **2. Tensor Parallelism (텐서 병렬화)**
  **📌 개념**
  •  하나의 **레이어 내부의 텐서 연산을 여러 개의 GPU로 나누어 계산**하는 방식입니다.
  •  즉, **각 행렬 연산을 쪼개서 여러 GPU가 동시에 처리**하는 방식입니다.
  **🛠️ 동작 방식**
  1.  모델의 연산(예: 행렬 곱셈)을 여러 개의 GPU로 분할
  2.  각 GPU가 자신의 부분 연산을 수행한 후 결과를 통합
  **📈 장점**
  ✅ **낮은 레이턴시** → 모든 GPU가 동시에 연산하므로 빠름
  ✅ **대형 모델 가능** → 한 개의 레이어도 여러 GPU에서 실행 가능
  **⚠️ 단점**
  ❌ **통신 비용 증가** → GPU 간 데이터 교환(Collective Communication) 필요
  ❌ **최적화 난이도** → 연산을 잘게 나누는 과정이 복잡
  **🚀 대표적 프레임워크**
  •  **Megatron-LM (NVIDIA)**
  •  **DeepSpeed (Microsoft)**
  **3. Pipeline Parallelism vs. Tensor Parallelism 비교**
  <table>
<tr>
<td></td>
<td>**Pipeline Parallelism**</td>
<td>**Tensor Parallelism**</td>
</tr>
<tr>
<td>**기본 원리**</td>
<td>모델의 층을 여러 GPU에 분산</td>
<td>하나의 연산을 여러 GPU에 분산</td>
</tr>
<tr>
<td>**장점**</td>
<td>더 큰 모델을 처리 가능</td>
<td>빠른 연산 속도</td>
</tr>
<tr>
<td>**단점**</td>
<td>레이턴시 증가, 병목 가능</td>
<td>GPU 간 통신 오버헤드</td>
</tr>
<tr>
<td>**적용 사례**</td>
<td>GPT, BERT 등 대규모 모델</td>
<td>매우 큰 모델 (Exa-scale AI)</td>
</tr>
<tr>
<td>**사용 프레임워크**</td>
<td>DeepSpeed, Megatron-LM</td>
<td>Megatron-LM, DeepSpeed</td>
</tr>
  </table>
  **4. Pipeline + Tensor Parallelism 결합**
  대부분의 최신 LLM 서빙 시스템에서는 **두 가지 방법을 함께 사용**합니다.
  •  **Pipeline Parallelism**으로 모델을 여러 층으로 나누고,
  •  각 층 내부에서는 **Tensor Parallelism**을 적용하여 연산을 분산
  이러한 **Hybrid Parallelism** 방식을 사용하면, **더 큰 모델을 더 빠르게 서빙할 수 있습니다.**
  ✅ **예시**: NVIDIA의 **Megatron-LM**이 대표적인 하이브리드 병렬화 적용 사례!
  **🎯 정리**
  •  **Pipeline Parallelism** → 모델의 층을 여러 GPU에 나눠 실행 (메모리 효율적, 레이턴시 증가 가능)
  •  **Tensor Parallelism** → 하나의 연산을 여러 GPU가 나눠 처리 (연산 속도 빠름, 통신 비용 증가)
  •  **최적의 LLM 서빙**을 위해서는 **두 가지 기법을 함께 사용**하는 것이 일반적!
  이해가 잘 됐나요? 추가로 궁금한 부분이 있으면 질문 주세요! 😊

</details>

<details>

<summary>수직적/수평적 분할</summary>

  네, **Pipeline Parallelism은 “수직적 분할”**, \*\*Tensor Parallelism은 “수평적 분할”\*\*이라고 표현하는 것이 일반적으로 맞는 비유입니다. 하지만 이 표현을 좀 더 직관적으로 설명하면 더 이해하기 쉬울 것 같아요.
  **✅ Pipeline Parallelism = “수직적 분할”**
  •  **수직적으로 쪼갠다**는 것은 **모델의 층(layer) 단위로 나눈다**는 의미입니다.
  •  즉, **모델의 깊이(depth)를 따라 분할**하여 각 GPU가 특정 층을 담당합니다.
  🖼 **비유:**
  •  레스토랑에서 요리를 만드는 과정과 비슷합니다.
  •  1번 요리사가 재료 손질 (입력층)
  •  2번 요리사가 조리 (중간층)
  •  3번 요리사가 플레이팅 (출력층)
  •  요리가 하나 완성되면 순차적으로 전달됨 (Forward & Backward Pass 진행)
  ⚠️ **문제점:**
  •  하나의 요리가 끝나야 다음 요리가 진행되므로 **레이턴시가 발생**할 수 있음 → **“파이프라이닝” 기법을 적용하여 이를 완화**할 수 있음!
  **✅ Tensor Parallelism = “수평적 분할”**
  •  **수평적으로 쪼갠다**는 것은 **각 층 내부의 연산(특히 행렬 곱셈)을 여러 GPU가 분산 처리**한다는 의미입니다.
  •  즉, 모델의 **너비(width)** 방향으로 연산을 분배합니다.
  🖼 **비유:**
  •  같은 음식을 여러 명이 동시에 요리한다고 생각해보세요.
  •  엄청나게 큰 피자를 만들 때, 한 명이 혼자 반죽을 다 만들면 오래 걸리지만
  •  여러 명이 반죽을 나누어 만들면 동시에 작업하여 빠르게 끝낼 수 있음!
  ⚠️ **문제점:**
  •  분할한 결과를 서로 **합쳐야 하므로 GPU 간 통신 비용이 증가**함 → 효율적인 통신 기법이 필요함!
  **🎯 비유 정리**
  <table>
<tr>
<td></td>
<td>**Pipeline Parallelism (수직 분할)**</td>
<td>**Tensor Parallelism (수평 분할)**</td>
</tr>
<tr>
<td>**어떻게 쪼개나?**</td>
<td>층(layer) 단위로 GPU에 배분</td>
<td>하나의 행렬 연산을 GPU 여러 개에 배분</td>
</tr>
<tr>
<td>**비유**</td>
<td>레스토랑에서 요리를 단계별로 넘기는 것</td>
<td>피자를 여러 명이 나누어 만드는 것</td>
</tr>
<tr>
<td>**장점**</td>
<td>더 큰 모델을 다룰 수 있음</td>
<td>계산 속도가 빠름</td>
</tr>
<tr>
<td>**단점**</td>
<td>순차 처리로 인해 지연 가능</td>
<td>GPU 간 통신 비용 증가</td>
</tr>
  </table>
  이제 더 이해가 잘 되셨나요? 😊

</details>

## **Optimizing the attention mechanism**

LLM도 수많은 attention 메커니즘으로 이루어져있음

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/05.png?raw=true)

### **Multi-query attention**

multi-head attention의 최적화 기법 중 하나.
[fast transformer decoding](https://arxiv.org/abs/1911.02150)이라는 논문에 자세히 설명되어있다함 (요건 나중에 봐볼만할듯)
여러 attention간 key-value를 공유함. 다만 query vector는 이전과같이 여러번 계산.
key-value를 메모리에서 읽어오는 횟수를 줄임으로서 메모리대역폭에서의 이점을 누릴수있음.
또한 key-value cache 사이즈도 줄어들게됨. → 더 큰 배치사이즈가 가능.
근데 이거 잠재적인 정확도 하락의 위험성이 있다고함 ㄷㄷ

### **Grouped-query attention**

MHA와 MQA 사이의 균형적인 방법. 쿼리수보다는 적지만, 여러개의 key-value를 가지고있게됨. 하지만 어쨌든 MHA보다는 캐시사이즈를 줄일수있음.

### Flash attention

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/06.png?raw=true)

또다른 최적화기법중 하나로, 계산의 순서를 변경해서 gpu 메모리의 이점을 얻는 방식임.
여러 레이어의 연산을 결합(fusing)하여 gpu 메로리의 I/O를 줄이고 다른계층에있는 동일데이터를 묶어서 처리할수있게함.
[flash attention](https://arxiv.org/abs/2205.14135)은 이 fusing 기법 중 하나이며 기존 MHA와 결과가 완전히 동일하므로 아무런 수정없이 기존의 방식을 대체할수있음.
메모리 계층별로 대역폭이랑 메모리사이즈가 다른데 이점을 이용해서 일부계산을 GPU SRAM계층에서 빠르게 수행하여 이득을 보는것으로 이해함.

## **Efficient management of KV cache with paging**

간혹 KV cache는 static하게 과다할당되는 경우가있음. 예를들면 모델의 최대길이가 2048이면 request 당 일단 2048 할당을 박아놓고 시작함. → 메모리가 필연적으로 낭비됨

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/07.png?raw=true)

paged attention알고리즘은 os의 페이징시스템에 영향을받아 본디 연속된 key-value캐시를 비연속적인 공간에 저장할 수 있게만들어줌.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/08.png?raw=true)

가상메모리사용방식이랑 동일한데, 메모리블록을 나누고 중간에 매핑테이블을 사용하여 비연속적인 공간에 저장하는것임.

## **Model optimization techniques**

그외에도 다양한 모델 최적화기법들이있다. 유구한..녀석들

### Quantization

보통 모델은 16bit\~32bit precision(single-precision floating point)으로 훈련되는데 이걸 정밀도를 낮춰서 (ex. int8로 조정) 메모리적 이득을 보는 방식임.

### Sparsity

모델 특징 중 하나가 0에 가까운 sparsit 녀석들은 pruning해버려도 충분히 robust하다는것임. 이런애들은 압축해서 표현할수있는데 그럼 속도향상도 이룰수있고 모델 크기도 줄일수있음.

### **Distillation**

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/09.png?raw=true)

지식전수하는방법.
큰 모델(선생님)의 행동을 모방하도록 작은모델(학생)을 학습시키는 방법임. [DistilBERT](https://arxiv.org/abs/1910.01108) 가 가장 좋은 예.

## Model serving techniques

모델 서빙시에는 메모리 대역폭의 한계도 고려를 해야한다.

### In-flight batching

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/10.png?raw=true)

동시에 여러 다른 요청을 실행.
전체 배치가 완료될때까지 기다리지 않고 완료된 sequence는 즉시 배치에서 제거함. 그 다음 새로운 요청을 시작함. → GPU를 놀리지않고 활용도를 올릴수있음.

### Speculative inference

시간을 절약하기위해 일련의 다양한 단계를 병렬로 실행
보통 GPT스타일 모델은 autoregressive모델임. 즉, 먼저 생성된 토큰이 그 다음 생성될 토큰에 영향을 미침. 따라서 n+1번째 토큰은 n번째 토큰이 생성되길 기다려야됨.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-inference-techniques/11.png?raw=true)

위와 같은 방식으로 해결할 수 있는데, 더 저렴한 모델은 초안(draft)을 생성해내고, verification 모델이 이 초안을 accept하거나 reject하는 방식으로 병렬처리를 진행하게된다.
reject당한녀석은 새 draft를 반복해서 생성하게된다.


[https://dytis.tistory.com/59](https://dytis.tistory.com/59)
