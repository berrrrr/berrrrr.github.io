---
layout: post
title: "[MLOps] AWS Neuron SDK 사용해보기"
subtitle: "[MLOps] neuron SDK 사용해보기"
categories: programming
tags: mlops
comments: true
---

> AWS inferentia 타입 인스턴스에 서빙하기 위해서는 neuron <br>SDK를 사용하여 모델을 한번 컴파일 해야한다


### onnx to neuron

불가능.
onnx2pytorch로 모델을 한번 pytorch로 변환한뒤에 `torch_neuron.trace()` 로 컴파일하는것을 권장하고있음.


### pytorch to neuron

코드몇줄로 가능.

```bash
# Python 가상 환경 생성
conda create -n neuron_compile python=3.7
conda acitvate neuron_compile

# 컴파일 대상 모델이 필요로 하는 의존성 설치
pip install -r requirements.txt

# PyTorch를 위한 Neuron SDK와 torchvision 설치
pip install \
  torch-neuron==1.8.1.* \
  neuron-cc[tensorflow] \
  torchvision==0.9.1.* \
  --extra-index-url https://pip.repos.neuron.amazonaws.com
```

#### Install Dependencies

- `torch-neuron`
- `neuron-cc[tensorflow]`
- `transformers`

#### NLP Example

```python
import tensorflow  # to workaround a protobuf version conflict issue
import torch
import torch.neuron
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
import transformers
import os
import warnings

# Setting up NeuronCore groups for inf1.6xlarge with 16 cores
num_cores = 16 # This value should be 4 on inf1.xlarge and inf1.2xlarge
os.environ['NEURON_RT_NUM_CORES'] = str(num_cores)

# Build tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("bert-base-cased-finetuned-mrpc")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-cased-finetuned-mrpc", return_dict=False)

# Setup some example inputs
sequence_0 = "The company HuggingFace is based in New York City"
sequence_1 = "Apples are especially bad for your health"
sequence_2 = "HuggingFace's headquarters are situated in Manhattan"

max_length=128
paraphrase = tokenizer.encode_plus(sequence_0, sequence_2, max_length=max_length, padding='max_length', truncation=True, return_tensors="pt")
not_paraphrase = tokenizer.encode_plus(sequence_0, sequence_1, max_length=max_length, padding='max_length', truncation=True, return_tensors="pt")

# Run the original PyTorch model on compilation exaple
paraphrase_classification_logits = model(**paraphrase)[0]

# Convert example inputs to a format that is compatible with TorchScript tracing
example_inputs_paraphrase = paraphrase['input_ids'], paraphrase['attention_mask'], paraphrase['token_type_ids']
example_inputs_not_paraphrase = not_paraphrase['input_ids'], not_paraphrase['attention_mask'], not_paraphrase['token_type_ids']

# Run torch.neuron.trace to generate a TorchScript that is optimized by AWS Neuron
model_neuron = torch.neuron.trace(model, example_inputs_paraphrase)

# Verify the TorchScript works on both example inputs (inf 환경 아니면 실행 x)
# paraphrase_classification_logits_neuron = model_neuron(*example_inputs_paraphrase)
# not_paraphrase_classification_logits_neuron = model_neuron(*example_inputs_not_paraphrase)

# Save the TorchScript for later use
model_neuron.save('bert_neuron.pt')
```

```bash
INFO:Neuron:Number of arithmetic operators (post-compilation) before = 565, compiled = 555, percent compiled = 98.23%
INFO:Neuron:The neuron partitioner created 1 sub-graphs
INFO:Neuron:Neuron successfully compiled 1 sub-graphs, Total fused subgraphs = 1, Percent of model sub-graphs successfully compiled = 100.0%
INFO:Neuron:Compiled these operators (and operator counts) to Neuron:
INFO:Neuron: => aten::Int: 96
INFO:Neuron: => aten::add: 36
INFO:Neuron: => aten::contiguous: 12
INFO:Neuron: => aten::div: 12
INFO:Neuron: => aten::dropout: 38
INFO:Neuron: => aten::gelu: 12
INFO:Neuron: => aten::layer_norm: 25
INFO:Neuron: => aten::linear: 74
INFO:Neuron: => aten::matmul: 24
INFO:Neuron: => aten::mul: 1
INFO:Neuron: => aten::permute: 48
INFO:Neuron: => aten::rsub: 1
INFO:Neuron: => aten::select: 1
INFO:Neuron: => aten::size: 96
INFO:Neuron: => aten::slice: 3
INFO:Neuron: => aten::softmax: 12
INFO:Neuron: => aten::tanh: 1
INFO:Neuron: => aten::to: 1
INFO:Neuron: => aten::transpose: 12
INFO:Neuron: => aten::unsqueeze: 2
INFO:Neuron: => aten::view: 48
INFO:Neuron:Not compiled operators (and operator counts) to Neuron:
INFO:Neuron: => aten::Int: 1 [supported]
INFO:Neuron: => aten::add: 2 [supported]
INFO:Neuron: => aten::add_: 1 [supported]
INFO:Neuron: => aten::embedding: 3 [not supported]
INFO:Neuron: => aten::size: 1 [supported]
INFO:Neuron: => aten::slice: 2 [supported]
```

컴파일 결과를 볼 수 있다

### Dockerfile

debian 이 기본인 패키지라서 좀 헤맸는데 기본적으로는 ubuntu 22.02 버전이라고 생각하고 레퍼런스 찾아서 아래와 같이 설정하니 됨.

```docker
FROM registry.example.com/base/python:3.11.7

# WORKDIR 설정
WORKDIR /usr/src/app

# 프로젝트 패키지 복사
COPY pyproject.toml .
COPY poetry.lock .
COPY ./api ./api
COPY ./common ./common

# 프로젝트 의존성 설치
RUN pip install --upgrade pip
RUN poetry config virtualenvs.create false && poetry install

# set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo Asia/Seoul > /etc/timezone
ENV TZ="Asia/Seoul"

# set env
ENV PYTHONPATH="/usr/src/app"
ENV TOKENIZERS_PARALLELISM=false
ENV VERSION_CODENAME=jammy

# 기본 패키지 업데이트 및 필요 도구 설치
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    && rm -rf /var/lib/apt/lists/*

# GPG 키 추가 및 저장소 설정
RUN wget -qO - https://apt.repos.neuron.amazonaws.com/GPG-PUB-KEY-AMAZON-AWS-NEURON.PUB | gpg --dearmor > /usr/share/keyrings/neuron-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/neuron-archive-keyring.gpg] https://apt.repos.neuron.amazonaws.com ${VERSION_CODENAME} main" | tee /etc/apt/sources.list.d/neuron.list

# Installing Neuron Tools
RUN apt-get update \
 && apt-get install -y \
      aws-neuron-tools \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /tmp/tmp* \
 && apt-get clean

# Sets up Path for Neuron tools
ENV PATH="/opt/bin/:/opt/aws/neuron/bin:${PATH}"

# Install Neuron PyTorch
RUN pip install \
    torch-neuron \
    --extra-index-url=https://pip.repos.neuron.amazonaws.com

CMD ["python", "api/src/main.py"]

```


### Lesson Learned

무지성 `pip install torch-neuron` 했더니

```bash
Traceback (most recent call last):
  File "/home/user/neuron_test.py", line 2, in <module>
    import torch_neuron
  File "/home/user/miniconda3/lib/python3.12/site-packages/torch_neuron/__init__.py", line 1, in <module>
    raise ImportError("WRONG PACKAGE. Please install the package from Neuron Repository - pip.repos.neuron.amazonaws.com")
ImportError: WRONG PACKAGE. Please install the package from Neuron Repository - pip.repos.neuron.amazonaws.com
```

이 에러가 남..

```bash
python -m pip config set global.extra-index-url https://pip.repos.neuron.amazonaws.com/
```

여기서 다운받아줘야함.
---

```python
import torch.neuron
from transformers import BertModel, BertTokenizer

# Build tokenizer and model
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained("bert-base-uncased")
model.eval()

text = "hi"
encoded_input = tokenizer.encode_plus(text, return_tensors='pt')
neuron_input = encoded_input['input_ids'], encoded_input['attention_mask'], encoded_input['token_type_ids']
model_neuron = torch.neuron.trace(model, neuron_input)

# Verify the TorchScript works on both example inputs
#output = model_neuron(*neuron_input)

# Save the TorchScript for later use
model_neuron.save('model_neuron.pt')
```

이 코드로 계속 모델변환하는데

```docker
RuntimeError: Encountering a dict at the output of the tracer might cause the trace to be incorrect, this is only valid if the container structure does not change based on the module's inputs. Consider using a constant container instead (e.g. for `list`, use a `tuple` instead. for `dict`, use a `NamedTuple` instead). If you absolutely need this and know the side effects, pass strict=False to trace() to allow this behavior.
```

계속 이 에러가남..

```python
model_neuron = torch.neuron.trace(model, neuron_input, strict=False)
```

`strict=False` 옵션을 주니까 이제 안남.
