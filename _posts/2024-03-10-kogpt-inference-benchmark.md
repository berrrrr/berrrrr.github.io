---
layout: post
title: "[MLOps] KoGPT 추론 속도 실험"
subtitle: "[MLOps] kogpt inference 속도 실험"
categories: programming
tags: mlops
comments: true
---

## 실험 1. 모델을 8bit로 로딩

<details markdown="1">

<summary>code</summary>

  ```python
# pip install transformers accelerate bitsandbytes

# -*- coding: utf-8 -*-
import time
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("kakaobrain/kogpt", revision="KoGPT6B-ryan1.5b-float16", load_in_8bit=True, torch_dtype=torch.bfloat16)
tokenizer = AutoTokenizer.from_pretrained('kakaobrain/kogpt', revision='KoGPT6B-ryan1.5b-float16')
model.eval()


def inference(prompt):
  start = time.time()
  tokens = tokenizer.encode(prompt, return_tensors='pt').to(device='cuda', non_blocking=True)
  gen_tokens = model.generate(tokens, do_sample=False, max_length=64)
  generated = tokenizer.batch_decode(gen_tokens)[0]
  end = time.time()
  print(generated.strip())
  print(f"it takes {end-start} seconds")


if __name__ == "__main__":
  prompt = '인간처럼 생각하고, 행동하는 \'지능\'을 통해 인류가 이제까지 풀지 못했던'
  inference(prompt)
  inference(prompt)
  inference(prompt)
  ```

</details>

- 학습과 제일 유사한 환경에서의 테스트

#### g4dn.xlarge

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 11.030531644821167 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 9.844014644622803 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 9.85619068145752 seconds
```

#### p3.2xlarge

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 13.593952894210815 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 11.567946195602417 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 11.565444707870483 seconds
```

#### g5.xlarge

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 8.977914810180664 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 7.46333122253418 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 7.541332960128784 seconds
```

## 실험 2. fp16 테스트

- fp16을 활용하면, 전용의 tensor core가 동작할 수 있어서 int8보다 오히려 빨라짐
- `load_in_8bit=True` 옵션 제거

#### g4dn.2xlarge

- g4dn.xlarge에서는 memory가 부족해서 실행 불가능

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 4.417008399963379 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 3.5028903484344482 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 3.500816822052002 seconds
```

#### p3.2xlarge

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 4.876116752624512 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 3.0571510791778564 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 3.0621068477630615 seconds
```

#### g5.2xlarge

```python
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 3.47536563873291 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 2.3292360305786133 seconds
인간처럼 생각하고, 행동하는 '지능'을 통해 인류가 이제까지 풀지 못했던 난제를 해결할 수 있을 것으로 기대된다.
it takes 2.3290302753448486 seconds
```

## 실험. Batch Size 테스트

<details markdown="1">

<summary>code</summary>

**base**

```python
# -*- coding: utf-8 -*-
import time
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("kakaobrain/kogpt", revision="KoGPT6B-ryan1.5b-float16", load_in_8bit=True, torch_dtype=torch.bfloat16)
tokenizer = AutoTokenizer.from_pretrained('kakaobrain/kogpt', revision='KoGPT6B-ryan1.5b-float16')
model.eval()


def batch_inference(prompts):
    start = time.time()
    encoded_inputs = tokenizer(prompts, return_tensors='pt')
    print(encoded_inputs)
    encoded_inputs.to(device='cuda')

    generated_tokens = model.generate(input_ids=encoded_inputs['input_ids'], do_sample=False, max_length=64)
    results = tokenizer.batch_decode(generated_tokens)
    end = time.time()
    print(f"it takes {end-start} seconds")


if __name__ == "__main__":
  prompt = '인간처럼 생각하고, 행동하는 \'지능\'을 통해 인류가 이제까지 풀지 못했던'
  batch_size = 1
  while 1:
      print(f"batch size: {batch_size}")
      batch_inference([prompt]*batch_size)
      batch_size = batch_size * 2
```

**vLLM**

```python
import time
from vllm import LLM, SamplingParams

sp = SamplingParams(max_tokens=64)
llm = LLM(model="kakaobrain/kogpt", revision="KoGPT6B-ryan1.5b-float16")
prompt = '인간처럼 생각하고, 행동하는 \'지능\'을 통해 인류가 이제까지 풀지 못했던'


batch_size = 1
while 1:
    start = time.time()
    print(f"batch size: {batch_size}")
    prompts = [prompt] * batch_size
    outptus = llm.generate(prompts, sp)
    end = time.time()
    print(f"it takes {end-start} seconds")
    batch_size = batch_size * 2
```

</details>

- g5.2xlarge에서 모두 비교하였음
- batch size를 2배씩 증가하면서, max batch size를 확인

#### 8bit

```python
batch size: 1
it takes 7.397524118423462 seconds
batch size: 2
it takes 7.403080224990845 seconds
batch size: 4
it takes 7.556253671646118 seconds
batch size: 8
it takes 7.440000534057617 seconds
batch size: 16
it takes 7.497692346572876 seconds
batch size: 32
it takes 7.78251838684082 seconds
batch size: 64
it takes 9.030970811843872 seconds
batch size: 128
it takes 10.161896467208862 seconds
batch size: 256
GPU Out Of memory Error
```

#### fp16

```python
batch size: 1
it takes 2.3142383098602295 seconds
batch size: 2
it takes 2.3519957065582275 seconds
batch size: 4
it takes 2.351057767868042 seconds
batch size: 8
it takes 2.381054639816284 seconds
batch size: 16
it takes 2.4842803478240967 seconds
batch size: 32
it takes 2.7864227294921875 seconds
batch size: 64
it takes 4.3793816566467285 seconds
batch size: 128
GPU Out Of memory Error
```

#### fp16 + vllm

```python
batch size: 1
it takes 1.831343412399292 seconds
batch size: 2
it takes 1.9201066493988037 seconds
batch size: 4
it takes 2.0918827056884766 seconds
batch size: 8
it takes 2.4617953300476074 seconds
batch size: 16
it takes 3.232037305831909 seconds
batch size: 32
it takes 4.86451530456543 seconds
batch size: 64
it takes 7.75148606300354 seconds
batch size: 128
it takes 13.946491479873657 seconds
batch size: 256
it takes 29.273810625076294 seconds
batch size: 512
it takes 58.2059121131897 seconds
batch size: 1024
it takes 115.87804746627808 seconds
batch size: 2048
it takes 234.07658767700195 seconds
```

#### Results

<table>
<colgroup>
<col width="100">
<col width="79">
<col>
<col width="78">
<col>
<col width="91">
<col>
</colgroup>
<tr>
<td></td>
<td>8bit</td>
<td></td>
<td>fp16</td>
<td></td>
<td>fp16 + vllm</td>
<td></td>
</tr>
<tr>
<td></td>
<td>seconds</td>
<td>request/second</td>
<td>seconds</td>
<td>request/second</td>
<td>seconds</td>
<td>request/second</td>
</tr>
<tr>
<td>batch: 1</td>
<td>7.4</td>
<td>0.14</td>
<td>2.3</td>
<td>0.43</td>
<td>1.8</td>
<td>0.56</td>
</tr>
<tr>
<td>batch: 2</td>
<td>7.4</td>
<td>0.27</td>
<td>2.4</td>
<td>0.83</td>
<td>1.9</td>
<td>1.05</td>
</tr>
<tr>
<td>batch: 4</td>
<td>7.5</td>
<td>0.53</td>
<td>2.4</td>
<td>1.67</td>
<td>2.0</td>
<td>2.00</td>
</tr>
<tr>
<td>batch: 8</td>
<td>7.4</td>
<td>1.08</td>
<td>2.4</td>
<td>3.33</td>
<td>2.5</td>
<td>3.20</td>
</tr>
<tr>
<td>batch: 16</td>
<td>7.6</td>
<td>2.11</td>
<td>2.5</td>
<td>6.40</td>
<td>3.2</td>
<td>5.00</td>
</tr>
<tr>
<td>batch: 32</td>
<td>7.8</td>
<td>4.10</td>
<td>2.8</td>
<td>11.43</td>
<td>4.9</td>
<td>6.53</td>
</tr>
<tr>
<td>batch: 64</td>
<td>9</td>
<td>7.11</td>
<td>4.4</td>
<td>14.55</td>
<td>7.7</td>
<td>8.31</td>
</tr>
<tr>
<td>batch: 128</td>
<td>10</td>
<td>12.8</td>
<td>Error</td>
<td>-</td>
<td>14</td>
<td>9.14</td>
</tr>
<tr>
<td>batch: 256</td>
<td>Error</td>
<td>-</td>
<td></td>
<td></td>
<td>29</td>
<td>8.83</td>
</tr>
<tr>
<td>batch: 512</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>58</td>
<td>8.83</td>
</tr>
<tr>
<td>batch: 1024</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>115</td>
<td>8.90</td>
</tr>
<tr>
<td>batch: 2048</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>234</td>
<td>8.75</td>
</tr>
</table>

## Appendix

### Instance Spec

#### g4dn.xlarge

CPU: 4 core
memory: 16GB
GPU: T4 16GB (tensor core: 320)

#### g4dn.2xlarge

CPU: 8 core
memory: 32GB
GPU: T4 16GB (tensor core: 320)

#### p3.2xlarge

CPU: 8 core
memory: 61GB
GPU: V100 16GB (tensor core: 640)

#### g5.xlarge

CPU: 4 core
memory: 16GB

GPU: a10g 24G (tensor core: 320)

#### g5.2xlarge

CPU: 8 core
memory: 32GB

GPU: a10g 24G (tensor core: 320)
