---
layout: post
title: "[ONNX] lesson-learned"
subtitle: "[ONNX] lesson-learned"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

### 1. libcudnn.so.8: cannot open shared object file: No such file or directory

```javascript
 [E:onnxruntime:Default, provider_bridge_ort.cc:1745 TryGetProviderInfo_CUDA] /onnxruntime_src/onnxruntime/core/session/provider_bridge_ort.cc:1426 onnxruntime::Provider& onnxruntime::ProviderLibrary::Get() [ONNXRuntimeError] : 1 : FAIL : Failed to load library libonnxruntime_providers_cuda.so with error: libcudnn.so.8: cannot open shared object file: No such file or directory
```

일단 쿠다 라이브러리 패스 잡아봄

```javascript
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
```

그래도 안되면 이 페이지 참고해서 cuda 와 cudnn버전을 맞춰보자
[https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html#requirements](https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html#requirements)

### 2. cuda out of memory

```python
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 576.00 MiB. GPU
```

계속 oom이나서고통받았는데
pynvml 로 task별로 memory 찍게했더니, 갑자기 oom이 안나게됨 (⇒ .,.??????)
뭔가 cuda에 신호를 줘서 정리할 그런게 필요했던건가..??뭐지?

### 3.  Non-zero status code returned while running

```python
[1;31m2024-08-26 05:59:16.948868025 [E:onnxruntime:, sequential_executor.cc:514 ExecuteKernel] Non-zero status code returned while running Softmax node. Name:'/encoder/blocks/blocks.0/attn/Softmax' Status Message: /onnxruntime_src/onnxruntime/core/framework/bfc_arena.cc:376 void* onnxruntime::BFCArena::AllocateRawInternal(size_t, bool, onnxruntime::Stream*, bool, onnxruntime::WaitNotificationFn) Failed to allocate memory for requested buffer of size 1775665152
[m
onnxruntime.capi.onnxruntime_pybind11_state.RuntimeException: [ONNXRuntimeError] : 6 : RUNTIME_EXCEPTION : Non-zero status code returned while running MatMul node. Name:'/encoder/blocks/blocks.0/attn/MatMul' Status Message: /onnxruntime_src/onnxruntime/core/framework/bfc_arena.cc:376 void* onnxruntime::BFCArena::AllocateRawInternal(size_t, bool, onnxruntime::Stream*, bool, onnxruntime::WaitNotificationFn) Failed to allocate memory for requested buffer of size 2500263936
```

이에러가 나를 괴롭게했는데 parseq 모델(text recognition model)에서 나는거였음.
나는 혹시 배치처리하면 빠르지않을까해서 dynamic axis를 설정하고 batch inference를 하고잇었는데 이걸 그냥 single inference로 변경하니.. 해결됨

### libcudnn_adv.so.9: cannot open shared object file: No such file or directory

미니콘다의 site-packages/nvidia/cudnn/lib 을 넣어줘야합니다
/home/user/.local/lib/python3.11/ 이 아래에 있거나
/home/user/miniconda3/envs/\{env_name\}/lib/python3.11/  이 아래에 있지 않을까 하는데요
→ poetry의경우 생성한 가상환경

```python
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cudnn/lib"
```

위와같이추가해줌

### libnvrtc.so.12: cannot open shared object file: No such file or directory

이거는 뜬금없지만
`/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib` 이 위치에 있었음. path 또 추가해줌.

```python
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib"
```


gpt가 제안한 해결방법 아래와같음
1. **CUDA Toolkit 버전 확인**

  ```bash
nvcc --version
  ```

  여기서 CUDA 버전이 12.x 라면 `libnvrtc.so.12` 가 있어야 합니다.
2. **라이브러리 위치 확인**

  ```bash
locate libnvrtc.so

  ```

  혹은

  ```bash

find /usr -name "libnvrtc.so*"
  ```

3. **환경 변수 등록**
  찾은 경로가 `/usr/local/cuda-12.x/lib64/` 라면:

  ```bash
export LD_LIBRARY_PATH=/usr/local/cuda-12.x/lib64:$LD_LIBRARY_PATH
  ```

4. **패키지 설치 (Ubuntu)**
  만약 파일이 아예 없다면:

  ```bash
sudo apt-get install nvidia-cuda-toolkit
  ```

  또는 CUDA 12.x 런타임 패키지 설치:

  ```bash
sudo apt-get install cuda-libraries-12-*-nvrtc
  ```


### example-model lesson-learned

#### 1. inference 정확도의 차이

- 이건 결과적으로는 cuda-toolkit과 cudnn버전, GPU종류의 문제였음 (라이브러리 버전은 전부 동일하다는기준)
- 서빙환경과 학습환경이 동일한 gpu base image를 쓰기에 동일 버전이라고 생각했는데, 학습하면서 추가로 깔린 cuda toolkit과 cudnn버전이 차이가 있었음.
- 아래 명령어로 확인된 버전이 동일하게 맞춰주는것이 중요

  ```python
import torch
print("cuda toolkit:", torch.version.cuda)
print("cudnn:", torch.backends.cudnn.version())
  ```

- 심지어 위의 환경까지 모두 맞춰도 물리적 gpu 종류가 다르면 (ex. L4 와 A10G) 결과 다름

#### 2. inference 속도의 차이

- 첫번째로는, onnx가 적합한 cudnn library를 물지 못해서 제 성능을 내지 못함. (아래 에러를 뱉음)

  ```python
libcudnn_adv.so.9: cannot open shared object file: No such file or directory
libnvrtc.so.12: cannot open shared object file: No such file or directory
  ```

- 강제로 설치한 cuda 라이브러리 path를 `LD_LIBRARY_PATH` 에 설정해줘야 온전한 성능을 낼 수 있음
- 참고로 아래 path의 경우 poetry로 생성한 가상환경이기때문에 해당 path인것이고, 구성한 환경에 따라 라이브러리 위치가 달라지므로 주의. 환경에 맞게 설정해줘야함.

  ```python
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cudnn/lib"
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib"
  ```

- 두번째로는 cpu자원의 이슈였음. 모든 버전을 다 맞췃는데도 성능이 서빙환경에서 훨씬 느리게 나와서 영문을 몰랐는데 모델 그래프 내에서 cpu를 활용하는 부분이 있을 수 있으므로 cpu자원량도 무척 중요함. 학습환경에는 190개 코어가 잡혀있어서 0.02초 수준으로 나오는데 서빙환경에는 4개코어가 잡혀있어서 0.2초 수준으로 확연히 느려지는 부분을 확인함. 서빙환경의 cpu코어를 48개로 늘려주니, 유사한 속도로 inference되는것을 확인함
