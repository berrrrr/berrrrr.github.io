---
layout: post
title: "[ONNX] optimum.onnxruntime으로 quantization하기"
subtitle: "[ONNX] optimum.onnxruntime으로 quantization하기"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

<br><br>`ORTModelForSequenceClassification` 과 `ORTModelForSeq2SeqLM` 모델은 onnx runtime에서 quantization 함수를 제공하지만, `OrtModelForCasualLM` 은 아직 제공하지 않는듯하다….
onnx로 서빙하려면 어쩔수없이… 모델용량이 좀 큰 상태로 할수밖에없는듯

### lesson learned

```python
from optimum.onnxruntime import ORTModelForCausalLM, ORTQuantizer
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from transformers import AutoTokenizer


ort_model = ORTModelForCausalLM.from_pretrained(
    output_dir_merged,
    use_io_binding=True,
    export=True,
    use_cache=True,
    provider="CUDAExecutionProvider",  # Change this to "CPUExecutionProvider" using CPU for inference
)
ort_model = ORTModelForCausalLM.from_pretrained(output_dir_onnx, provider="CUDAExecutionProvider")
tokenizer = AutoTokenizer.from_pretrained(output_dir_onnx)
ort_model.save_pretrained(output_dir_onnx)
tokenizer.save_pretrained(output_dir_onnx)

quantizer = ORTQuantizer.from_pretrained(output_dir_onnx)
dqconfig = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)
model_quantized_path = quantizer.quantize(
    save_dir=output_dir_quantize,
    quantization_config=dqconfig,
    use_external_data_format=True,
)

```

요 코드로 quantization 시도해봤는데 모델 용량이 8GB로 줄어서 읭..?! 한상태로 테스트해보니까 속도도 엄청 오래걸리고, output도 다 망가져있었음 ㅜㅜ
일단 `OrtModelForCasualLM` 에 대한 quantization 을 지원할때까지 기다려봐야겠따.
