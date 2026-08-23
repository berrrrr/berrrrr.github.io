---
layout: post
title: "[ONNX] llama2 with lora to onnx"
subtitle: "[ONNX] llama2 with lora to onnx"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

[https://github.com/microsoft/Llama-2-Onnx](https://github.com/microsoft/Llama-2-Onnx)
→ 이건 basemodel을 onnx로..


[https://github.com/onnx/onnx/issues/5326](https://github.com/onnx/onnx/issues/5326)
[https://github.com/huggingface/optimum/issues/1171](https://github.com/huggingface/optimum/issues/1171)
→ 여기서 나온것처럼 lora weight를 base model에 merge하고 onnx로 바꾸면 되는듯

이 코드를 사용했다

```bash
from optimum.onnxruntime import ORTModelForCausalLM
from peft import LoraConfig, PeftModelForCausalLM
from transformers import AutoModelForCausalLM, AutoTokenizer

# First: Finetuning with PEFT / LoRA. Save PEFT layers to disk.
# https://huggingface.co/docs/peft/task_guides/seq2seq-prefix-tuning

# ...

# After finetuning:

# ----------------------------------------------------------------------------------
# *** Load base model

base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    cache_dir=model_cache_dir,
    load_in_8bit=load_in_8bit,
    torch_dtype=torch_dtype,
    device_map="auto",
)

tokenizer = AutoTokenizer.from_pretrained(
    base_model_name,
    cache_dir=model_cache_dir,
)

# ----------------------------------------------------------------------------------
# *** Load PEFT layers

config = LoraConfig(
    r=lora_param_r,
    lora_alpha=lora_param_alpha,
    lora_dropout=lora_dropout,
    bias=train_bias,
    task_type="CAUSAL_LM",
    modules_to_save=modules_to_save,
)

finetuned_model = PeftModelForCausalLM.from_pretrained(
    base_model,
    path_finetuned_model,
    load_in_8bit=load_in_8bit,
    torch_dtype=torch_dtype,
    device_map="auto",
)

# ----------------------------------------------------------------------------------
# *** Merge LoRA weights into base model

# Merge LoRA weights into the base model.
merged_model = finetuned_model.merge_and_unload()

# We first need to merge the LoRA weights into the base model, and save the
# resulting merged model to disk, before we can convert the merged model to ONNX.
merged_model.save_pretrained(output_dir_merged, save_adapter=True, save_config=True)

# ----------------------------------------------------------------------------------
# *** ONNX conversion

ort_model = ORTModelForCausalLM.from_pretrained(
    output_dir_merged,
    use_io_binding=True,
    export=True,
    use_cache=True,
    from_transformers=True,
    provider="CUDAExecutionProvider",  # Change this to "CPUExecutionProvider" using CPU for inference
)

ort_model.save_pretrained(output_dir_onnx)
tokenizer.save_pretrained(output_dir_onnx)

```


onnx로 변경하고 혹시 성능이 degraded된다면 . 이이슈를 참고하자
[https://github.com/huggingface/optimum/issues/1171](https://github.com/huggingface/optimum/issues/1171)


일단 변환했을때 모델 크기가 줄어들질 않음..
base model (llama-2-ko-7b-fp16) : 13G
lora model : 74M
이고..
둘이 merge model : 13G
인데
onnx 변환 모델 : 26G 뜸..
default fp32로 모델이 export되는거같고 huggingface optimum에서 quantization지원을 아직 안하는듯하다 ㅜㅜ
[https://huggingface.co/docs/optimum/onnxruntime/usage_guides/quantization](https://huggingface.co/docs/optimum/onnxruntime/usage_guides/quantization)
요 페이지를 참고해서 ORTQuantizer를 써봤는데 일단 아웃풋이 다 망가지고..
정확히는 `ORTModelForSequenceClassification` 과 `ORTModelForSeq2SeqLM` 만 지원하는거같다.
해당 페이지를 참고해서 `ORTModelForCausalLM` 을 지원하면 하는게 좋을거같다

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from optimum.onnxruntime import ORTModelForCausalLM

input_model_name = "bigscience/bloom-560m"

base_model = AutoModelForCausalLM.from_pretrained(input_model_name)

tokenizer = AutoTokenizer.from_pretrained(input_model_name)

inference_prompt = "### Human: Tell me where is Gandalf, for I much desire to speak with him.\n\n### Assistant:"
inference_tokens = tokenizer(inference_prompt, return_tensors="pt")

base_model = base_model.eval()

onnx_path = "/path/to/bloom_onnx"
ort_model = ORTModelForCausalLM.from_pretrained(onnx_path)

output_tokens = ort_model.generate(**inference_tokens, max_new_tokens=24)

output_chars = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
print("Inference after ONNX conversion")
print(output_chars)

with torch.no_grad():
    output_tokens = base_model.generate(**inference_tokens, max_new_tokens=24)
output_chars = tokenizer.decode(output_tokens[0], skip_special_tokens=True)
print("Inference before ONNX conversion")
print(output_chars)
```

요런식으로 가져와서 쓰면됨
[https://github.com/huggingface/optimum/issues/1171](https://github.com/huggingface/optimum/issues/1171)


fp32 기반으로 모델이 export되어서 메모리에 모델 올릴수가 없… (모델사이즈 26기가, 메모리올라가면 30기가이상먹음..)
huggingface optimum에서 안해준다면 onnx 에서 제공해주는 api 없는지 길을 떠나보자..

오 근데 optimum써서도 양자화 한 사례가 있긴함.
[https://github.com/huggingface/optimum/issues/1399](https://github.com/huggingface/optimum/issues/1399)
여기서 optimum-cli로 16bit 양자화한거있길래 동일하게 해봄

```bash
optimum-cli export onnx --model ./merged_model2 --task text-generation-with-past --fp16 --for-ort --device cuda quantized_onnx
```

아 근데.. 결과로 떨어진 모델용량은 확실히 작아졌는데 속도가 4배이상 느려졌다..

onnx에서 제공하는버전으로..
결국 fp16으로 한번 더 양자화해줘야하는데 드디어 방법을 찾았다..!
[https://github.com/microsoft/onnxruntime/tree/main/onnxruntime/python/tools/transformers/models/llama](https://github.com/microsoft/onnxruntime/tree/main/onnxruntime/python/tools/transformers/models/llama)
삽질끝에 메모리도 덜쓰고 속도도 더 빨라지는 변환법 찾음 ㅜㅜ 방법은 아래와 같다
우선 기존 llama2 base model에 lora model을 merge해서 저장한것까지는 같다.
→ 이녀석을 merged_model 폴더에 저장한 뒤,
깃헙에 나와있는대로 양자화를 진행해주면된다.

1. onnxruntime github을 clone한다
2. `/onnxruntime/python/tools/transformers/models/llama` 경로로 들어가준다
3. `requirements.txt` 와 `requirements-cuda.txt` 를 설치해준다.
  - 주의할점은, requirements에 torch버전이 2.2 이상이므로 파이토치 환경은 해당 링크의 가이드에 따라 설치해준다.<br>[https://pytorch.org/get-started/previous-versions/](https://pytorch.org/get-started/previous-versions/)

    ```bash
# CUDA 11.8 -> 나는 이녀석 설치함
conda install pytorch==2.2.0 torchvision==0.17.0 torchaudio==2.2.0 pytorch-cuda=11.8 -c pytorch -c nvidia
# CUDA 12.1
conda install pytorch==2.2.0 torchvision==0.17.0 torchaudio==2.2.0 pytorch-cuda=12.1 -c pytorch -c nvidia
# CPU Only
conda install pytorch==2.2.0 torchvision==0.17.0 torchaudio==2.2.0 cpuonly -c pytorch
    ```

4. `/onnxruntime/python/tools/transformers` 경로로 가서 아래 명령어를 실행한다

  ```bash
python3 -m models.llama.convert_to_onnx -m /merged_model --output /onnx_fp16_model --precision fp16 --execution_provider cuda
  ```


이렇게하면 `--ouput` 에 지정한 `onnx_fp16_model` 폴더에 양자화된 모델이 떨궈져있고,
이녀석을 `ORTModelForCausalLM` 에서 불러와서 inference해주면 끝!
단, pytorch 라이브러리들 버전이 위 변환 환경과 동일해야 정상적으로 동작했다.
