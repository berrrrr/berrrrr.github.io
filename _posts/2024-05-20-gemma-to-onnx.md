---
layout: post
title: "[ONNX] gemma → onnx"
subtitle: "[ONNX] gemma → onnx"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

### huggingface optimum

```python
import torch
from accelerate import Accelerator
from optimum.onnxruntime import ORTModelForCausalLM
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

pretrained_model = "/data/user/huggingface_models/gemma-2b/"
lora_model = "/data/user/example_project/summarization/models/gemma-2b/"
output_dir_merged = "/data/user/llmops/gemma-2b-merged"
output_dir_onnx = "/data/user/llmops/gemma-2b-onnx"

base_model = AutoModelForCausalLM.from_pretrained(
            pretrained_model,
            torch_dtype=torch.float16,
            use_cache=False,
            use_flash_attention_2=True,
            device_map={"": Accelerator().process_index}
        )

tokenizer = AutoTokenizer.from_pretrained(pretrained_model)
finetuned_model = PeftModel.from_pretrained(base_model, lora_model)

merged_model = finetuned_model.merge_and_unload()
merged_model.save_pretrained(output_dir_merged, save_adapter=True, save_config=True)

ort_model = ORTModelForCausalLM.from_pretrained(
    output_dir_merged,
    use_io_binding=True,
    export=True,
    use_cache=True,
    provider="CUDAExecutionProvider",
)

ort_model.save_pretrained(output_dir_onnx)
tokenizer.save_pretrained(output_dir_onnx)
```

하 근데 또 모델사이즈가 2배가되는현상이 있음.
(llama2때도 이래서 onnx 레포내에서 따로 컨버팅하는거 찾아서 변환했었음..)

### optimum사용

optimum에서 gemma 변환을 지원해서

```bash
optimum-cli export onnx --model gemma-2b-merged ./gemma-2b-onnx3 --task text-generation-with-past --dtype fp16 --device cuda
```

`dtype`만 fp16으로 명시해주면 양자화된 모델 그대로 잘 떨어짐..! 용량 그대로..!

### merge_and_unload 이슈

아니 근데 자꾸 원래모델이랑 미묘하게(아니 사실 대놓고) output차이가남 ㅜㅜㅜ
나는 사실 onnx변환하면서 문제인줄알았는데 계속 실험해보니 merge_and_unload로 떨군 onnx 변환 이전의 파일에서부터 원본모델(base+peft)과 inference 차이가 나는것임..!! <br>찾아보니 나만겪은문제가 아님.
basemodel이 gguf고 이걸 lora모델과 병합하는 순간 뭔가 잘못되는듯.

다들 토론중인거같긴한데 일단 나중에 천천히 읽어보자 어쩔수없는듯

### +

tensorRT LLM 쓰기?
[https://developer.nvidia.com/blog/nvidia-tensorrt-llm-revs-up-inference-for-google-gemma/](https://developer.nvidia.com/blog/nvidia-tensorrt-llm-revs-up-inference-for-google-gemma/)
