---
layout: post
title: "[ONNX] llama2 with lora onnx변환후 서빙"
subtitle: "[ONNX] llama2 with lora onnx변환후 서빙"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

LlamaTokenizerFast라는녀석을 쓸수있을지도?

```python
import os
import time

import numpy as np
import onnxruntime as ort
from optimum.onnxruntime import ORTModelForCausalLM
from transformers import BertTokenizer, RobertaForTokenClassification, BertTokenizerFast, AutoTokenizer, \
    LlamaTokenizerFast

from common.config import config
from common.util.model_util import download_and_extract_model

# load pretrained model
os.environ["TOKENIZERS_PARALLELISM"] = 'false'
model_bucket_name = config.model_bucket_name

# onnx model download
# download_and_extract_model(model_bucket_name, "example_project/summarization/model.tar.gz")

model = ORTModelForCausalLM.from_pretrained("example_project/summarization/model")
tokenizer = AutoTokenizer.from_pretrained("example_project/summarization/model")
tokenizer2 = LlamaTokenizerFast.from_pretrained("example_project/summarization/model")
ort_session = ort.InferenceSession("example_project/summarization/model/model.onnx")

start = time.time()
inference_prompt = f"### 상담 내용: \n- 고객: 예시 서비스 출금이 안됩니다. - 상담원: 은행에서 상담하세요.\n\n ### 요약: \n"
inference_tokens = tokenizer(inference_prompt, return_tensors="pt")
output_tokens = model.generate(**inference_tokens, max_new_tokens=24)
output_chars = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
print("Inference after ONNX conversion")
print(output_chars)
end = time.time()
print(f"Elapsed time1: {end - start}")

start = time.time()
inference_tokens2 = tokenizer2(inference_prompt, return_tensors="pt")
output_tokens = model.generate(**inference_tokens2, max_new_tokens=24)
output_chars = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
print("Inference after ONNX conversion")
print(output_chars)
end = time.time()
print(f"Elapsed time2: {end - start}")

```


오.. 이렇게해서 cpu에서 inference 날렸더니 <br>`LlamaTokenizerFast`가 훨씬 빠른 inference속도를 보임.

```bash
Inference after ONNX conversion
### 상담 내용:
- 고객: 예시 서비스 출금이 안됩니다. - 상담원: 은행에서 상담하세요.

 ### 요약:
- 고객: 예시 서비스 출금이 안되어서 문의
- 상담원: 은행에서 상담하세요.
Elapsed time1: 31.974740982055664


Inference after ONNX conversion
### 상담 내용:
- 고객: 예시 서비스 출금이 안됩니다. - 상담원: 은행에서 상담하세요.

 ### 요약:
- 고객: 예시 서비스 출금이 안되어서 문의
- 상담원: 은행에서 상담하세요.
Elapsed time2: 9.557683944702148
```
