---
layout: post
title: "[ONNX] exporting transformers to ONNX"
subtitle: "[ONNX] exporting transformers to ONNX"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

> huggingface transforemr를 onnx로 export하는 새로운 방법에대해 정리


### 1. optimum 설치

```bash
pip install optimum[exporters]
# 설치안되면 pip install 'optimum[exporters]'
```

### 2. export

```bash
# model에는 모델의 종류, 마지막 파라미터로는 target 파일명을 적어준다
optimum-cli export onnx --model distilbert-base-uncased-distilled-squad distilbert_base_uncased_squad_onnx/
```

이때 특정 task를 명시해줘야하는경우도있음

```bash
RuntimeError: Cannot infer the task from a local directory yet, please specify the task manually.
```

이런경우 아래와같이 task를 명시해준다

```bash
optimum-cli export onnx --model ./trained_model hate_char --task token-classification
```


task와같은parameter에 어떤값을 넣어줘야할지는 아래와 같이 `--help` 명령어를 참고하자

```bash
optimum-cli export onnx --help

usage: optimum-cli <command> [<args>] export onnx [-h] -m MODEL [--task TASK] [--monolith] [--device DEVICE] [--opset OPSET] [--atol ATOL]
                                                  [--framework {pt,tf}] [--pad_token_id PAD_TOKEN_ID] [--cache_dir CACHE_DIR] [--trust-remote-code]
                                                  [--no-post-process] [--optimize {O1,O2,O3,O4}] [--batch_size BATCH_SIZE]
                                                  [--sequence_length SEQUENCE_LENGTH] [--num_choices NUM_CHOICES] [--width WIDTH] [--height HEIGHT]
                                                  [--num_channels NUM_CHANNELS] [--feature_size FEATURE_SIZE] [--nb_max_frames NB_MAX_FRAMES]
                                                  [--audio_sequence_length AUDIO_SEQUENCE_LENGTH]
                                                  output

optional arguments:
  -h, --help            show this help message and exit

Required arguments:
  -m MODEL, --model MODEL
                        Model ID on huggingface.co or path on disk to load model from.
  output                Path indicating the directory where to store generated ONNX model.

Optional arguments:
  --task TASK           The task to export the model for. If not specified, the task will be auto-inferred based on the model. Available tasks depend on the model, but are among: ['default', 'fill-mask', 'text-generation', 'text2text-generation', 'text-classification', 'token-classification', 'multiple-choice', 'object-detection', 'question-answering', 'image-classification', 'image-segmentation', 'masked-im', 'semantic-segmentation', 'automatic-speech-recognition', 'audio-classification', 'audio-frame-classification', 'automatic-speech-recognition', 'audio-xvector', 'image-to-text', 'stable-diffusion', 'zero-shot-object-detection']. For decoder models, use `xxx-with-past` to export the model using past key values in the decoder.
  --monolith            Force to export the model as a single ONNX file. By default, the ONNX exporter may break the model in several ONNX files, for example for encoder-decoder models where the encoder should be run only once while the decoder is looped over.
  --device DEVICE       The device to use to do the export. Defaults to "cpu".
  --opset OPSET         If specified, ONNX opset version to export the model with. Otherwise, the default opset will be used.
  --atol ATOL           If specified, the absolute difference tolerance when validating the model. Otherwise, the default atol for the model will be used.
  --framework {pt,tf}   The framework to use for the ONNX export. If not provided, will attempt to use the local checkpoint's original framework or what is available in the environment.
  --pad_token_id PAD_TOKEN_ID
                        This is needed by some models, for some tasks. If not provided, will attempt to use the tokenizer to guess it.
  --cache_dir CACHE_DIR
                        Path indicating where to store cache.
  --trust-remote-code   Allows to use custom code for the modeling hosted in the model repository. This option should only be set for repositories you trust and in which you have read the code, as it will execute on your local machine arbitrary code present in the model repository.
  --no-post-process     Allows to disable any post-processing done by default on the exported ONNX models. For example, the merging of decoder and decoder-with-past models into a single ONNX model file to reduce memory usage.
  --optimize {O1,O2,O3,O4}
                        Allows to run ONNX Runtime optimizations directly during the export. Some of these optimizations are specific to ONNX Runtime, and the resulting ONNX will not be usable with other runtime as OpenVINO or TensorRT. Possible options:
                            - O1: Basic general optimizations
                            - O2: Basic and extended general optimizations, transformers-specific fusions
                            - O3: Same as O2 with GELU approximation
                            - O4: Same as O3 with mixed precision (fp16, GPU-only, requires `--device cuda`)
```

<br>

### 3. custom model export

```python
import torch
from torch import nn
from transformers import RobertaModel


class Classification(nn.Module):
    def __init__(self, path: str, label_count: int):
        super(Classification, self).__init__()

        self.plm = RobertaModel.from_pretrained(path)

        hidden_size = self.plm.config.hidden_size
        self.linear = nn.Linear(hidden_size, label_count)

    def forward(self, input_ids, attention_mask):
        hidden_states = self.plm(
            input_ids=input_ids,
            attention_mask=attention_mask,
        ).last_hidden_state

        hidden_states = hidden_states * attention_mask.unsqueeze(-1)
        embeddings = torch.sum(hidden_states, dim=1) / torch.sum(attention_mask, dim=-1).unsqueeze(-1)

        return self.linear(embeddings)

```

```python
import os

import torch
from transformers import BertTokenizerFast

from export_model.categorize_model.modeling import Classification

os.environ["TOKENIZERS_PARALLELISM"] = 'false'
sample_text = ['원화 입출금 어떻게 하나유?ㄴ']
model = Classification(path="example_project/categorize/pt", label_count=16)
model.load_state_dict(torch.load("example_project/categorize/pt/state_dict.pt"), strict=False)
model.eval()
tokenizer = BertTokenizerFast.from_pretrained('example_project/categorize/pt')
sample_input = tokenizer(
    sample_text,
    padding='longest',
    return_tensors='pt',
    truncation=True,
    add_special_tokens=False,
    max_length=512,
    return_attention_mask=True,
    return_token_type_ids=False
)
sample_input_feed = (sample_input["input_ids"], sample_input["attention_mask"])
torch.onnx.export(
    model,
    sample_input_feed,
    "model.onnx",
    verbose=True,
    input_names=['input_ids', 'attention_mask'],
    output_names=['output'],
    dynamic_axes=dict(input_ids={0: "batch", 1: "sequence"}, attention_mask={0: "batch", 1: "sequence"}),
)

```

이렇게 custom model도 export 가능하다
이때 fine tuning한 state 불러와서 model.eval()로 고정한 뒤 변환하는거 잊지말기..(변환모델이 계속 랜덤하게 값이 다르게나와서 뭔가했네..)
참고로 `dynamic_axes` 설정은 batch inference를 위한 설정이다.
`dynamic_axes={'img': [2, 3],}` 가령 이렇게 되어있다면 인풋의 두번째와 세번째 차원이 동적임을 의미한다.
