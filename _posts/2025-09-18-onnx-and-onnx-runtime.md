---
layout: post
title: "[ONNX] ONNX와 ONNX Runtime"
subtitle: "[ONNX] ONNX와 ONNX Runtime"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

> onnx 모델만 쓰면 자동으로 최적화 먹는거 아닌가? 꼭 ort.inferencesession형태로 서빙해야지만 onnx의 최적화기법들을 적용가능한건가? 등의 의문이 생겨서 서치하다가 매우 잘 정리된 중국사이트(ㄷㄷ)를 발견함


### onnx란

ML모델을 저장하는데 사용되는 파일형식(format)을 지칭함.
다양한 프레임워크 모델이 동일한방식으로 실행될 수 있도록 ‘통합된’ 형식을 제공함.

### onnx-runtime이란

ONNX Runtime은 onnx format의 모델을 실행하는데 사용되는 ‘실행단계’ 라이브러리임.
여러 플랫폼, 프로그래밍 언어, 하드웨어 아키텍처를 지원하고 다양한 하드웨어 가속방법(cpu, gpu)을 지원함.
8bit quantization도 지원함.

### optimum

onnx runtime 옵션을 포함하여 여러 가속 라이브러리를 통합하는 hugging face 제품군.
optimum 라이브러리를 통해 transformer모델을 onnx형식으로 쉽게 변환 및 실행이 가능하다

```bash
pip install optimum accelerate

optimum-cli export onnx \
    --model facebook/opt-125m \
    --task text-generation-with-past \
    opt-125m-onnx
```


OrtModelForCasualLM 을 사용해서 모델을 로드할수있음.
GPT2TokenizerFast로 tokenizer를 로드할 수 있음

```bash
from optimum.onnxruntime import ORTModelForCausalLM
from transformers import GPT2TokenizerFast

model_path = "opt-125m-onnx"
model = ORTModelForCausalLM.from_pretrained(model_path)
tokenizer = GPT2TokenizerFast.from_pretrained(model_path)
```

혹은 `pipeline` 사용.

```bash
from optimum.pipelines import pipeline

generate = pipeline(
    "text-generation",
    model=model,
    tokenizer=tk,
    accelerator="ort",
)

outputs = generate("Hello, ", max_new_tokens=32)
```

### ORT

`InferenceSession` 으로 pretrained 모델을 로드해서 사용 가능

```bash
from onnxruntime import InferenceSession

sess = InferenceSession(
    "opt-125m-onnx/decoder_model.onnx",
    providers=["CUDAExecutionProvider"], # cpu는 CPUExecutionProvider
)
```


inference수행 전에 입력 node의 이름을  확인할수있음. 다음과같은 함수로 얻을수 있음.

```bash
for node in sess.get_inputs():
    print(node)
```


참고로 input형태는 다음과 같이 넣어줘야함

```bash
from transformers import GPT2TokenizerFast

tk = GPT2TokenizerFast.from_pretrained("opt-125m-onnx")
tokens = tk("Hello, ")

inputs = {
    "input_ids": [tokens["input_ids"]],
    "attention_mask": [tokens["attention_mask"]],
}
```


추론은 다음과 같이 진행

```bash
outputs = sess.run(None, inputs)
```


ouput을 합쳐서 decoding하면된다

```bash
for _ in tqdm(range(32)):
    outputs = sess.run(None, inputs)

    new_tokens = outputs[0].argmax(-1)[:, -1:]

    inputs["input_ids"] = np.concatenate(
        (inputs["input_ids"], new_tokens),
        axis=1,
    )

    inputs["attention_mask"] = np.concatenate(
        (inputs["attention_mask"], [[1]]),
        axis=1,
    )

print(tk.decode(inputs["input_ids"][0]))
```
