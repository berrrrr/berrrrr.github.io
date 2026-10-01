---
title: "ONNX Runtime Troubleshooting: CUDA, cuDNN, Memory, and Inference Performance"
subtitle: "Practical lessons from debugging ONNX Runtime in GPU serving environments"
description: "Solutions for missing CUDA and cuDNN libraries, ONNX Runtime memory allocation errors, and performance differences between training and serving environments."
date: 2025-09-19
categories: programming
tags: mlops
comments: true
translation_url: /programming/2025/09/19/onnx-runtime-lessons-learned/
---

> This article is part of my **ONNX series**. It collects practical lessons from troubleshooting ONNX Runtime in GPU serving environments.

### 1. `libcudnn.so.8: cannot open shared object file`

```text
[E:onnxruntime:Default, provider_bridge_ort.cc:1745 TryGetProviderInfo_CUDA]
/onnxruntime_src/onnxruntime/core/session/provider_bridge_ort.cc:1426
onnxruntime::Provider& onnxruntime::ProviderLibrary::Get()
[ONNXRuntimeError] : 1 : FAIL : Failed to load library
libonnxruntime_providers_cuda.so with error: libcudnn.so.8:
cannot open shared object file: No such file or directory
```

First, add the CUDA library directory to `LD_LIBRARY_PATH`:

```bash
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
```

If the error remains, check that your CUDA and cuDNN versions match the versions supported by ONNX Runtime. The [CUDA Execution Provider requirements](https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html#requirements) contain the compatibility table.

### 2. CUDA out of memory

```text
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 576.00 MiB. GPU
```

I kept encountering this OOM error. Oddly, after adding per-task memory logging with `pynvml`, the error stopped occurring. I could not establish a clear causal relationship, so this observation needs further verification rather than being treated as a fix.

### 3. `Non-zero status code returned while running`

```text
[E:onnxruntime:, sequential_executor.cc:514 ExecuteKernel]
Non-zero status code returned while running Softmax node.
Name:'/encoder/blocks/blocks.0/attn/Softmax'
Status Message: /onnxruntime_src/onnxruntime/core/framework/bfc_arena.cc:376
Failed to allocate memory for requested buffer of size 1775665152

onnxruntime.capi.onnxruntime_pybind11_state.RuntimeException:
[ONNXRuntimeError] : 6 : RUNTIME_EXCEPTION : Non-zero status code returned
while running MatMul node. Name:'/encoder/blocks/blocks.0/attn/MatMul'
Status Message: /onnxruntime_src/onnxruntime/core/framework/bfc_arena.cc:376
Failed to allocate memory for requested buffer of size 2500263936
```

In my case, this occurred in a PARSeq text recognition model. I had configured dynamic axes and enabled batch inference, expecting it to improve throughput. Switching from batch inference to single-item inference resolved the allocation failure.

### 4. `libcudnn_adv.so.9: cannot open shared object file`

The directory containing the cuDNN libraries installed in the virtual environment must be included in the library path. Depending on the environment, it may be under one of these locations:

```text
/home/user/.local/lib/python3.11/
/home/user/miniconda3/envs/{env_name}/lib/python3.11/
```

For a Poetry-created virtual environment in my container, I added this path:

```bash
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cudnn/lib"
```

### 5. `libnvrtc.so.12: cannot open shared object file`

In my environment, `libnvrtc.so.12` was located here:

```text
/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib
```

I added that directory as well:

```bash
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib"
```

You can diagnose the problem in the following order.

1. Check the CUDA Toolkit version:

   ```bash
   nvcc --version
   ```

   If CUDA 12.x is installed, `libnvrtc.so.12` should be available.

2. Find the library:

   ```bash
   locate libnvrtc.so
   ```

   Or:

   ```bash
   find /usr -name "libnvrtc.so*"
   ```

3. Add its directory to the environment. For example:

   ```bash
   export LD_LIBRARY_PATH=/usr/local/cuda-12.x/lib64:$LD_LIBRARY_PATH
   ```

4. If the file is missing on Ubuntu, install the appropriate CUDA package for your environment. For example:

   ```bash
   sudo apt-get install nvidia-cuda-toolkit
   ```

   Or install the matching CUDA 12.x runtime library package:

   ```bash
   sudo apt-get install cuda-libraries-12-*-nvrtc
   ```

Package names and installation methods vary by CUDA repository and Ubuntu version, so confirm them against the NVIDIA installation documentation for your system.

### Model-serving lessons

#### Differences in inference accuracy

The accuracy difference ultimately came from the CUDA Toolkit version, cuDNN version, and GPU model, even though the other library versions were identical.

The training and serving environments used the same GPU base image, so I initially assumed their CUDA stacks were identical. However, extra CUDA Toolkit and cuDNN packages had been installed during training. Check the versions that PyTorch actually uses:

```python
import torch

print("cuda toolkit:", torch.version.cuda)
print("cudnn:", torch.backends.cudnn.version())
```

Matching these versions is important. Even after aligning the software environment, different physical GPUs—for example, an NVIDIA L4 and an A10G—can still produce small numerical differences.

#### Differences in inference speed

First, ONNX Runtime could not load the required cuDNN libraries and therefore did not reach its expected performance. The relevant errors were:

```text
libcudnn_adv.so.9: cannot open shared object file: No such file or directory
libnvrtc.so.12: cannot open shared object file: No such file or directory
```

The directories containing the installed CUDA libraries had to be added to `LD_LIBRARY_PATH`:

```bash
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cudnn/lib"
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/src/app/.venv/lib/python3.12/site-packages/nvidia/cuda_nvrtc/lib"
```

These paths belong to a Poetry-created virtual environment in this particular container. Locate the libraries and use the paths that match your own environment.

The second bottleneck was CPU capacity. Even with all library versions aligned, inference was much slower in the serving environment. Parts of an ONNX graph can execute on the CPU, so the number of CPU cores still matters.

The training environment exposed 190 CPU cores and completed inference in roughly 0.02 seconds. The serving environment exposed only four cores and took about 0.2 seconds. Increasing the serving environment to 48 cores brought inference time close to the training environment.
