---
layout: post
title: "[MLOps] LLM Hallucination을 해결하는 방법"
subtitle: "[MLOps] LLM Hallucination을 해결하는 방법"
categories: programming
tags: mlops
comments: true
---

> LLM의 대표적인 문제로 지적되는 hallucination 과 logical inconsistency 를 해결하는 방법에 대해 알아보자\~


### Background

limitation of LLM
- knowledge cutoff
  - RAG
  - Text2SQL
- hallucination
- logical inconsistency

### Fine-tuning Language Models for Factuallity

#### background

- RLHF
  - 여러 답변 랭킹을매겨 강화학습
  - 하이퍼파라미터에 민감함
- DPO
  - 랭킹데이터로 바로 파인튜닝 (강화학습 X)
  - 더 쉽고, HP도 민감하지않음

#### introduction

- human labeling없이 llm을 finetuning하겠다..
- estimate truthfulness w/o human
  - reference-based 팩첵
  - reference-free 모델자체의 confidence로 평가 ,
- 자동생성된 답변으로 파인튜닝

#### approach

- reference based
  - FactScore
    - atomic claim 뽑고
    - wikipedia같은애들이랑 일관적인지 스코어평가
  - 더 사실에 근거한 답변을 하게됨
  - limitation
    - reference찾기가 어려움
    - base model에 dependent함
- reference free
  - llm confidence와 답변의 사실 여부가 밀접함
  - 마찬가지로 atomic claim 뽑고
  - 각 claim을 gpt3.5로 질문으로 바꿈
  - 질문에대해 20개 답변을 뽑음
  - 같은 답변군에대해 카운트를 뽑아서 점수를 매김
  - 일관된 답변을 낼수록 사실일확률이 높다고 판단
  - SELFCHECKGPT와 방법이 매우 유사함
    - gpt한테 이 context끼리 유사해? 하고 물어보는게 제일 정확하게 판단해준다고함..
    - bertscore등이랑 비교해봐도 걍 gpt한테 물어보는게 굳
- 이제 두가지를 기반으로 dpo 학습 가능!
- evaluation
  - baseline들은 truthful QA데이터셋을 사용했는데
  - 이 넌ㅁ문은 갑자기 자기네들이 만든 medical QA라는 데이터샛으로 evaluation

### DOLA (Decoding by contrasting layers)

LLM finetuning 할필요없이 decoding하는 단계에만 작업을 하는 아이디어
higher layer로 갈수록 더 사실적인 내용이 학습되기때문에, 해당 레이어의 probability를 더 가중치를 줘서 decoding할때 반영하는 방식

### **Self-Contradictory Hallucinations of LLMs: Evaluation, Detection and Mitigation**

self contradiction = gpt들끼리 생성한 답변이 서로 모순되는상황
→ 이걸 어떻게 measure하고 어떻게 고칠것인가

- self-contradiction vs non-facuality
  - 둘이 관련이있다
  - 모순이면 적어도 하나는 틀린거니까..
  - self contradiction이 발생한경우 = 답변자체가 다 할루시네이션인가능성이 높았다
- self-contradiction vs knowledge retrieval
  - 문장의 사실여부를 판단하기위한 근거문서를 가져오는게 좀 어려움
  - 웹 텍스트(근거텍스트)와 함께 답변하기 어려운 질문이 대부분이었음
  - 프롬프트는 이런식
    - 두문장이 모순이냐?
    - (모순이면) 어디가모순이냐?
    - 모순인부분 빼고 답변해줘
  - 서로 비슷한데 모순일수도있는 context를 만들기위해 특별한 프롬프트를 사용함 (relation extraction 사용)

logical consistency한 모델을 만드는게 꽤나 좋은 연구주제이지않을까..
