---
layout: post
title: "[MLOps] LLM as a retriever"
subtitle: "[MLOps] LLM as a retriever"
categories: programming
tags: mlops
comments: true
---

> DPR등 전통적으로 사용되어오던 retriever 방식이 아닌, LLM을 retriever로 사용하는 방식들도 많이 시도되고있음. 어떤 시도들이 있는지 알아보자


### Problem

기존 방식:
사용자의 query →biencoder (ex. pretrained-bert) →  embedding vector → similarity calcualate (ex. bm25) → retrieved document 반환

한계:
- retriever를 supervise training하기 위한 relevance labels 필요.
- retrieved document에는 query와 연관없는 정보가 포함될수있음
- long tail problem(일부단어는 너무 자주등장하고 많은 단어들은 너무 적게등장함) 에 취약함

### Solution

#### GenRead (2023 ICLR)

Generate rather than Retrieve: Large Language Models are Strong Context Generators
이 논문은 LLM을 retriever로 사용한다기보다는, retrieval한 document 대신 LLM이 generate한 document를 RAG의 context로 사용하겠다는 아이디어.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/01.png?raw=true)

- methods
  - Zeroshot setting
    1. generate : retrieval 모델을 사용하지 않고, LLM을 이용하여 question과 관련있는 문서 (contextual documents)를 생성하도록 함. → LLM이 자체 파라미터에 충분한양의 지식을 가지고있을것이다. 프롬프트 : `Generate a background document to answer the given question. {question placeholder}`
    2. Read : contextual documents를 generate model의 input 으로 제공하여 question에 대한 답을 생성하도록함. 프롬프트 : `Refer to the passage below and answer the following question. Passage: {background placeholder} Question: {question placeholder}`
  - supervised setting
    1. generate : 단순 LLM을 통해 생성하는경우 깊은지식의 document생성이 어렵고 텍스트가 반복될 가능성이 있어 아래와 같은 프롬프트를 사용함.
      - diverse human prompt : 사람이 직접 프롬프트 입력해서 문서생성
      - clustering-based prompt : clustering을 통해 다양한 context를 반영하는 문서 생성
        1. query-document pair를 임베딩한 후 k-meas clustering
        2. 각 cluster에서 n개 pair sampling
        3. sampling한 n개 pair를 LLM의 prompt로 사용하여 cluster의 document 생성 (qc1 ;dc1; qc2, dc2;… qcn;dcn)
        4. 각 cluster별로 반복하여 k개의 document 생성
    2. Read : question + k개 document를 통해 FiD reader모델 훈련

<details>

<summary>FiD (Fusion in Decoder) </summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/02.png?raw=true)

</details>

- experiments
  - zeroshot setting

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/03.png?raw=true)

    - 세가지 태스크들에서 GenRead 방식은 외부 지식을 사용하지 않았음에도 불구하고, 외부지식을 사용한 retriever 방식보다 더 높거나 비슷한 성능을 보임 (논문 작성 당시 Open-domain QA task SOTA 달성)
    - 외부 지식을 사용하지 않은 방법들(InstructGPT, FLAN, GLaM)과도 비교하였을 때 가장 높은 성능을 보여줌
  - Supervised Setting

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/04.png?raw=true)

- conclusion
  - dense retrieval을 LLM generator로 대체
  - 외부지식을 활용한 기존 retrieval-then-read 모델을 외부지식없이도 이김

#### HyDE (2023 ACL)

Precise Zero-Shot Dense Retrieval without Relevance Labels
지도학습 없이 dense retrieval을 하겠다는것.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/05.png?raw=true)

- methods
  - LLM을 사용하여 query에 대한 가상의 답변문서를 생성 (단, hallucination 포함될 수 있음)  → Hypothetical Document Embeddings (Hyde) 프롬프트 : `"write a document that answers<br>the question"`
  - 해당 문서를 contriever(contrastive learning한 encoder)로 인코딩하여 임베딩벡터를 만들고, 해당 벡터와 유사한 문서를 찾는 방식으로 retriever함.
  - 질문과 해당 질문에대한 답변을 포함하는 문서의 임베딩이 다른경우 retrieval이 잘 안되는 한계점을 잘 극복함
  - 지도학습이 필요없음
- experiments

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/06.png?raw=true)

  - 비지도학습모델들끼리는 가장 좋은 성능
  - MS MARCO데이터로 finetuning된 모델들과 비교했을때도 비슷한성능이 나왔음을 알수있음

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/07.png?raw=true)

  - low resource retrieval 에서도 HyDE는 비지도학습모델안에서는 압도적인 성능을 보여줌
  - fine-tuning된 모델들보다도 압도적이 ㄴ성능을 보여줌.
- conclusion
  - contriever만 썼을때보다 우수한 성능
  - fine-tuned retriever와 유사한 혹은 더 강력한 성능. (zero shot 인데도.)
  - langchain 에서도 쉽게 사용해볼수있음 [링크](https://python.langchain.com/v0.2/docs/templates/hyde/)

#### LameR (2024 ACL)

Large Language Models are Strong Zero-Shot Retriever<br>말그대로 LLM을 retriever로 사용하겠다

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/08.png?raw=true)

- methods
  - non-parametric lexicon based retriever(용어기반검색기) : bm25를 거대한 문서에서 retrieval하는 용도로 사용.
  - candidate-prompted answer generation (후보문서 기반 쿼리 생성) : 주어진 쿼리 q를 LLM에 입력해 생성된 답변 a를 통해 augmented함. 프롬프트 : `Give a question “{q}” and its possible answering passages (most of these passages are wrong) enumerated as: \n 1.{cq1} \n 2.{cq2} \n 3.{cq3} . . . please write a correct answering passage.`  → 제시한 passage중에 gold document 가 있으면 LLM이 알아서 인용해 정확한 문서를 생성할것이고, 후보들ㄷ이 정확하지 않더라도 LLM은 정보수집도구로 도메인을 인식하는데 이를 활용할것이라는 계산.
  - answer-augmented large-scale retrieval : 이렇게 만들어진 답변들을 통해 새로운 쿼리 $`\overline{q}`$ 를 만든다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/09.png?raw=true)

    쿼리+답변1, 쿼리+답변2 … 쿼리+답변n 을 concat 한게 새로운 쿼리임.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/10.png?raw=true)

  - 새로운쿼리를 통해 bm25로 다시한번 retriver함.
- experiments

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/11.png?raw=true)

  - zeroshot setting에서 HyDE를 능가하는 성능을 보였다고함
  - 또한 DPR을 사용하는 HyDE와 다르게 BM25를 사용하기때문에 LameR이 훨씬 빠르다고함..
  - fewshot을 주는 Q2D BM25같은 방법이나 supervised 모델들과 비교해도 우수한 성능을 보임.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-as-retriever/12.png?raw=true)

  - TREC-COVID, TREC-NEWS 데이터셋에서 우수한 성능을 보임 → web information seeking task에 좋은 성능을 보장한다고함
  -
- results
