---
layout: post
title: "[ONNX] MMDeploy로 MMDetection 모델을 ONNX로 변환하기"
subtitle: "[ONNX] exporting mmdetect to onnx using mmdeploy"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

> mmdetection fine-tuning모델을 서빙하게되었다. mmdetection은 중국에서 개발한 오픈소스 segmentation 모델이다. 이녀석을 어떻게 onnx로 변환하는지 알아보자


### mmdeploy

우선 mmdetection을 deploy할 수 있는 여러 방법을 제공하기 위해 개발사 openMMlab에서는 mmdeploy라는 툴을 따로 제공하고있었다.
[https://mmdeploy.readthedocs.io/en/latest/get_started.html](https://mmdeploy.readthedocs.io/en/latest/get_started.html)
end-to-end model deployment를 제공한다고해서 조금 의아했는데 우선 결론적로는 깔라는 환경만 잘 맞춰서 깔면 진짜 한번에 변환 잘 된다.

### prerequisites

일단 mmdetection과 동일한 conda 환경에서 진행했다.

python 3.9.12 버전 환경생성

```bash
conda create -n masking python=3.9.12
```

gpu 기반 torch 환경 세팅

```bash
# CUDA 11.8
conda install pytorch==2.0.1 torchvision==0.15.2 torchaudio==2.0.2 pytorch-cuda=11.8 -c pytorch -c nvidia
```

mmdetection 세팅

```bash
pip install -U openmim
mim install "mmengine>=0.7.0"
mim install "mmcv>=2.0.0rc4"

git clone https://github.com/open-mmlab/mmdetection.git
cd mmdetection

pip install -e .
```

mmdeploy세팅

```bash
git clone https://github.com/open-mmlab/mmdeploy.git
```


여기까지했으면 기본 mmdeploy세팅은끝났다

### convert model

나는 기본적으로는 이 문서대로 따라갔다
[https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/02-how-to-run/convert_model.md](https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/02-how-to-run/convert_model.md)

onnx변환을 해야하므로, onnx runtime 관련 installation을 진행한다.
[https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/05-supported-backends/onnxruntime.md](https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/05-supported-backends/onnxruntime.md)
해당 페이지를 참고하면되고, gpu기반환경이 필요햇던 나는 아래 설치를 수행했다

***onnxruntime\>=1.8.1**  *설치

```bash
pip install onnxruntime-gpu==1.8.1 # if you want to use gpu version
```

X64 GPU 기반 onnxruntime library 설치

```bash
wget https://github.com/microsoft/onnxruntime/releases/download/v1.8.1/onnxruntime-linux-x64-gpu-1.8.1.tgz

tar -zxvf onnxruntime-linux-x64-gpu-1.8.1.tgz
cd onnxruntime-linux-x64-gpu-1.8.1
export ONNXRUNTIME_DIR=$(pwd)
export LD_LIBRARY_PATH=$ONNXRUNTIME_DIR/lib:$LD_LIBRARY_PATH
```


다 깔았다면, 아래와 같이 입력해주면 된다

```bash
python ./tools/deploy.py \
    ${DEPLOY_CFG_PATH} \
    ${MODEL_CFG_PATH} \
    ${MODEL_CHECKPOINT_PATH} \
    ${INPUT_IMG} \
    --test-img ${TEST_IMG} \
    --work-dir ${WORK_DIR} \
    --calib-dataset-cfg ${CALIB_DATA_CFG} \
    --device ${DEVICE} \
    --log-level INFO \
    --show \
    --dump-info
```

파라미터는 아래 설명 참조
- `deploy_cfg` : The deployment configuration of mmdeploy for the model, including the type of inference framework, whether quantize, whether the input shape is dynamic, etc. There may be a reference relationship between configuration files, `mmdeploy/mmpretrain/classification_ncnn_static.py` is an example.
- `model_cfg` : Model configuration for algorithm library, e.g. `mmpretrain/configs/vision_transformer/vit-base-p32_ft-64xb64_in1k-384.py`, regardless of the path to mmdeploy.
- `checkpoint` : torch model path. It can start with http/https, see the implementation of `mmcv.FileClient` for details.
- `img` : The path to the image or point cloud file used for testing during the model conversion.
- `-test-img` : The path of the image file that is used to test the model. If not specified, it will be set to `None`.
- `-work-dir` : The path of the work directory that is used to save logs and models.
- `-calib-dataset-cfg` : Only valid in int8 mode. The config used for calibration. If not specified, it will be set to `None` and use the "val" dataset in the model config for calibration.
- `-device` : The device used for model conversion. If not specified, it will be set to `cpu`. For trt, use `cuda:0` format.
- `-log-level` : To set log level which in `'CRITICAL', 'FATAL', 'ERROR', 'WARN', 'WARNING', 'INFO', 'DEBUG', 'NOTSET'`. If not specified, it will be set to `INFO`.
- `-show` : Whether to show detection outputs.
- `-dump-info` : Whether to output information for SDK.

나는 `-calib-dataset-cfg` 이녀석 빼고는 다 넣어줬다.

```bash
export DEPLOY_CFG_PATH="configs/mmdet/detection/detection_onnxruntime_dynamic.py"
export MODEL_CFG_PATH="rtmdet-ins_x_8xb16-300e_coco_idcard_v3.py"
export MODEL_CHECKPOINT_PATH="epoch_300.pth"
export INPUT_IMG="source/20240314_133202.jpg"
export TEST_IMG="source/20240314_133202.jpg"
export DEVICE="cuda:0"
export WORK_DIR="mmdeploy_models/mmdet/ort"

python ./tools/deploy.py \
    ${DEPLOY_CFG_PATH} \
    ${MODEL_CFG_PATH} \
    ${MODEL_CHECKPOINT_PATH} \
    ${INPUT_IMG} \
    --test-img ${TEST_IMG} \
    --work-dir ${WORK_DIR} \
    --device ${DEVICE} \
    --log-level INFO \
    --show \
    --dump-info

```

`mmdeploy_models/mmdet/ort`폴더를 확인해보면, input img와 test img에 대한 inference결과와 변환된 onnx모델이 함께 들어있으므로, 정상적으로 변환되었는지 확인 가능하다.

### onnx inference

[https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/get_started.md](https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/get_started.md)
여기에도 잘 나와있고
[https://github.com/open-mmlab/mmdetection/blob/main/docs/en/user_guides/deploy.md](https://github.com/open-mmlab/mmdetection/blob/main/docs/en/user_guides/deploy.md)
여기에도 잘 나와있다.
두가지 방법이 존재한다.

#### 1) **Backend model inference**

mmdeploy util에서 제공하는 방식으로 모델을 로딩해서 inference하는 방식이다
일단 mmdeploy 레포를 다 가져와서 써야되고 방식도 깔끔하지가 않아서 나는 일단 맘에들진않았다..

```python
from mmdeploy.apis.utils import build_task_processor
from mmdeploy.utils import get_input_shape, load_config
import torch

deploy_cfg = '../mmdeploy/configs/mmdet/detection/detection_onnxruntime_dynamic.py'
model_cfg = 'configs/faster_rcnn/faster-rcnn_r50_fpn_1x_coco.py'
device = 'cpu'
backend_model = ['mmdeploy_models/mmdet/onnx/end2end.onnx']
image = 'demo/demo.jpg'

# read deploy_cfg and model_cfg
deploy_cfg, model_cfg = load_config(deploy_cfg, model_cfg)

# build task and backend model
task_processor = build_task_processor(model_cfg, deploy_cfg, device)
model = task_processor.build_backend_model(backend_model)

# process input image
input_shape = get_input_shape(deploy_cfg)
model_inputs, _ = task_processor.create_input(image, input_shape)

# do model inference
with torch.no_grad():
    result = model.test_step(model_inputs)

# visualize results
task_processor.visualize(
    image=image,
    model=model,
    result=result[0],
    window_name='visualize',
    output_file='output_detection.png')
```

그런데 sdk로 실행하는게 실패해서 결국 이 방법으로 선택하기로 ㅠㅠ

#### 2) **SDK model inference**

mmdeploy sdk가 존재한다. 이녀석을 설치해서 이용하는방법이다.
[https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/01-how-to-build/linux-x86_64.md](https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/01-how-to-build/linux-x86_64.md)
우선 sdk를 위한 dependency가 있다.
- openCV ≥ 3.0
- pplcv
위 링크에있는 녀석들을 설치해주자.

```bash
# 1. install MMDeploy model converter
pip install mmdeploy==1.3.1

# 2. install MMDeploy sdk inference
# you can install one to install according whether you need gpu inference
# 2.1 support onnxruntime
pip install mmdeploy-runtime==1.3.1
# 2.2 support onnxruntime-gpu, tensorrt
pip install mmdeploy-runtime-gpu==1.3.1

```

m1에서 설치가 안되서 무조건 리눅스환경에서 테스트가능함.. (후..ㅎ)
설치를 마쳤다면 아래와같이 `mmdeploy_runtime` 라이브러리를 import해서 사용할 수 있다.
코드는 backend 어쩌고 방법보다 훨씬 깔끔하다

```python
from mmdeploy_runtime import Detector
import cv2

img = cv2.imread('demo/demo.jpg')

# create a detector
detector = Detector(model_path='mmdeploy_models/mmdet/onnx',
                    device_name='cpu', device_id=0)
# perform inference
bboxes, labels, masks = detector(img)

# visualize inference result
indices = [i for i in range(len(bboxes))]
for index, bbox, label_id in zip(indices, bboxes, labels):
    [left, top, right, bottom], score = bbox[0:4].astype(int), bbox[4]
    if score < 0.3:
        continue

    cv2.rectangle(img, (left, top), (right, bottom), (0, 255, 0))

cv2.imwrite('output_detection.png', img)
```

깔끔한데 돌리는거 실패했다…
그냥 위에 backend 사용하는 모델로 실행하는걸로..
하나 넘기면 하나 에러나는식인데 최종에서는

```bash
loading libmmdeploy_ort_net.so ...
[2024-03-21 15:56:53.907] [mmdeploy] [info] [model.cpp:35] [DirectoryModel] Load model: "/home/user/masking/model"
[2024-03-21 15:56:56.022] [mmdeploy] [error] [instance_segmentation.cpp:78] invalid argument (1) @ /__w/mmdeploy/mmdeploy/csrc/mmdeploy/core/value.h:436
terminate called after throwing an instance of 'system_error2::status_error<mmdeploy::StatusDomain>'
  what():  unknown (6) @ /__w/mmdeploy/mmdeploy/csrc/mmdeploy/codebase/mmdet/instance_segmentation.cpp:79
Aborted (core dumped)
```

c/C++ 코어부분에서 에러나는거같은데 도저히 찾을 방법이 없다. 포기.

### docker

이제 도커환경에서 돌아가게 만들어야되는데..
기본적으로 도커환경에서 돌리기위해 필요한 패키지는 [이녀석](https://github.com/open-mmlab/mmdetection/tree/main/docker)을 많이 참조했다.

cpu 케이스

```docker
FROM registry.example.com/base/python:3.10.12

# Install the required packages
RUN apt-get update \
    && apt-get install -y ffmpeg libsm6 libxext6 git ninja-build libglib2.0-0 libsm6 libxrender-dev libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Api requirements
WORKDIR /usr/src/app
COPY ./api ./api
COPY ./common ./common

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r api/requirements.txt

# Install MMEngine and MMCV
RUN pip install openmim && \
    mim install "mmengine>=0.7.1" "mmcv>=2.0.0rc4"

# Install MMDetection
RUN git clone https://github.com/open-mmlab/mmdetection.git /mmdetection \
    && cd /mmdetection \
    && pip install --no-cache-dir -e .

# Install MMDeploy
RUN git clone https://github.com/open-mmlab/mmdeploy.git /mmdeploy


# Set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo Asia/Seoul > /etc/timezone
ENV TZ="Asia/Seoul"

# Set pythonpath
ENV PYTHONPATH="/usr/src/app"

CMD ["python", "api/src/main.py"]

```

요런식으로 mmdeploy와 mmdetection을 git으로 설치를좀해줬고

```docker
torch==2.0.1
torchvision==0.15.2
uvicorn==0.23.2
fastapi==0.104.1
sentry-sdk[fastapi]==1.38.0
boto3==1.33.11
mmdeploy==1.3.1
mmdeploy-runtime==1.3.1
onnxruntime==1.17.1
wheel==0.41.2
python-multipart==0.0.5
```

requirements는 위와같이 들어가게된다.
gpu의경우 환경이 좀더 달라져야하는데.. (골치아프다)

### cf. MAC Silicon 환경에서 돌리기

[https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/01-how-to-build/macos-arm64.md](https://github.com/open-mmlab/mmdeploy/blob/main/docs/en/01-how-to-build/macos-arm64.md)
뭐 자꾸 로컬에서 다 안되가지고 보니까 Silicon(arm64) 환경에서 돌리는 방법이 따로 정리되어있었음..

### gpu vs cpu

gpu 환경은
- `task_processor = build_task_processor(model_cfg, deploy_cfg, device="cuda")`

<details markdown="1">

<summary>requirements</summary>

  ```text
torch==2.0.1
torchvision==0.15.2
uvicorn==0.23.2
fastapi==0.104.1
sentry-sdk[fastapi]==1.38.0
boto3==1.33.11
mmdeploy==1.3.1
mmdeploy-runtime-gpu==1.3.1
onnxruntime-gpu==1.17.1
wheel==0.41.2
python-multipart==0.0.5
  ```

</details>

<details markdown="1">

<summary>dockerfile</summary>

  ```docker
FROM registry.example.com/base/gpu:latest

# Install the required packages
RUN apt-get update \
    && apt-get install -y ffmpeg libsm6 libxext6 git ninja-build libglib2.0-0 libsm6 libxrender-dev libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Api requirements
WORKDIR /usr/src/app
COPY ./api ./api
COPY ./common ./common

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r api/requirements.txt

# Install MMEngine and MMCV
RUN pip install openmim && \
    mim install "mmengine>=0.7.1" "mmcv>=2.0.0rc4"

# Install MMDetection
RUN git clone https://github.com/open-mmlab/mmdetection.git /mmdetection \
    && cd /mmdetection \
    && pip install --no-cache-dir -e .

# Install MMDeploy
RUN git clone https://github.com/open-mmlab/mmdeploy.git /mmdeploy


# Set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo Asia/Seoul > /etc/timezone
ENV TZ="Asia/Seoul"

# Set pythonpath
ENV PYTHONPATH="/usr/src/app"

CMD ["python", "api/src/main.py"]

  ```

</details>

<details markdown="1">

<summary>성능</summary>

  `20240322_110017` : 3.45s
  `20240314_133242` : 1.74s
  `20240314_133202` : 1.81s

</details>

cpu는
- `task_processor = build_task_processor(model_cfg, deploy_cfg, device="cpu")`

<details markdown="1">

<summary>requirements.txt</summary>

  ```docker
torch==2.0.1
torchvision==0.15.2
uvicorn==0.23.2
fastapi==0.104.1
sentry-sdk[fastapi]==1.38.0
boto3==1.33.11
mmdeploy==1.3.1
mmdeploy-runtime==1.3.1
onnxruntime==1.17.1
wheel==0.41.2
python-multipart==0.0.5
  ```

</details>

<details markdown="1">

<summary>dockerfile</summary>

  ```docker
FROM registry.example.com/base/python:3.10.12

# Install the required packages
RUN apt-get update \
    && apt-get install -y ffmpeg libsm6 libxext6 git ninja-build libglib2.0-0 libsm6 libxrender-dev libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Api requirements
WORKDIR /usr/src/app
COPY ./api ./api
COPY ./common ./common

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r api/requirements.txt

# Install MMEngine and MMCV
RUN pip install openmim && \
    mim install "mmengine>=0.7.1" "mmcv>=2.0.0rc4"

# Install MMDetection
RUN git clone https://github.com/open-mmlab/mmdetection.git /mmdetection \
    && cd /mmdetection \
    && pip install --no-cache-dir -e .

# Install MMDeploy
RUN git clone https://github.com/open-mmlab/mmdeploy.git /mmdeploy


# Set timezone
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && echo Asia/Seoul > /etc/timezone
ENV TZ="Asia/Seoul"

# Set pythonpath
ENV PYTHONPATH="/usr/src/app"

CMD ["python", "api/src/main.py"]

  ```

</details>

<details markdown="1">

<summary>성능</summary>

  `20240322_110017` : 4.91s
  `20240314_133242` : 3.40s
  `20240314_133202` : 3.59s

</details>

### lesson learned

#### cudnn 미설치

```bash
[ONNXRuntimeError] : 1 : FAIL : Failed to load library libonnxruntime_providers_cuda.so with error: libcudnn.so.8: cannot open shared object file: No such file or directory
```

cuda 관련 뭐가 잘 안깔려서그런듯.

```bash
conda install -c conda-forge cudnn
```

설치해준다.

```bash
export LD_LIBRARY_PATH=$ONNXRUNTIME_DIR/lib:$LD_LIBRARY_PATH
```

이 환경변수 제대로 다시 잡아주면 에러해결!

#### gpu 못잡는문제

cpu로는 inference 잘되는데 cuda:0로 device설정하면 안되는 문제가있었음.

```bash
/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/onnxruntime/capi/onnxruntime_inference_collection.py:53: UserWarning: Specified provider 'CUDAExecutionProvider' is not in available provider names.Available providers: 'CPUExecutionProvider'
  warnings.warn("Specified provider '{}' is not in available provider names."
Traceback (most recent call last):
  File "/home/user/masking/mmdeploy/demo.py", line 24, in <module>
    result = model.test_step(model_inputs)
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/mmengine/model/base_model/base_model.py", line 145, in test_step
    return self._run_forward(data, mode='predict')  # type: ignore
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/mmengine/model/base_model/base_model.py", line 361, in _run_forward
    results = self(**data, mode=mode)
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/torch/nn/modules/module.py", line 1501, in _call_impl
    return forward_call(*args, **kwargs)
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection_model.py", line 296, in forward
    outputs = self.predict(inputs)
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection_model.py", line 313, in predict
    outputs = self.wrapper({self.input_name: imgs})
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/torch/nn/modules/module.py", line 1501, in _call_impl
    return forward_call(*args, **kwargs)
  File "/home/user/masking/mmdeploy/mmdeploy/backend/onnxruntime/wrapper.py", line 95, in forward
    self.io_binding.bind_input(
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/onnxruntime/capi/onnxruntime_inference_collection.py", line 381, in bind_input
    self._iobinding.bind_input(name,
RuntimeError: Error when binding input: There's no data transfer registered for copying tensors from Device:[DeviceType:1 MemoryType:0 DeviceId:0] to Device:[DeviceType:0 MemoryType:0 DeviceId:0]
```

onnxruntime과 onnxruntime-gpu가 함께 깔려있으면 이렇게됨.
onnxruntime을 제거해준다.

```bash
(mask) avy@ubuntu:~/masking/mmdeploy$ python demo.py
03/21 16:06:12 - mmengine - WARNING - Failed to search registry with scope "mmdet" in the "Codebases" registry tree. As a workaround, the current "Codebases" registry in "mmdeploy" is used to build instance. This may cause unexpected failure when running the built modules. Please check whether "mmdet" is a correct scope, or whether the registry is initialized.
03/21 16:06:12 - mmengine - WARNING - Failed to search registry with scope "mmdet" in the "mmdet_tasks" registry tree. As a workaround, the current "mmdet_tasks" registry in "mmdeploy" is used to build instance. This may cause unexpected failure when running the built modules. Please check whether "mmdet" is a correct scope, or whether the registry is initialized.
03/21 16:06:12 - mmengine - WARNING - Failed to search registry with scope "mmdet" in the "backend_detectors" registry tree. As a workaround, the current "backend_detectors" registry in "mmdeploy" is used to build instance. This may cause unexpected failure when running the built modules. Please check whether "mmdet" is a correct scope, or whether the registry is initialized.
Traceback (most recent call last):
  File "/home/user/masking/mmdeploy/demo.py", line 16, in <module>
    model = task_processor.build_backend_model(backend_model)
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection.py", line 159, in build_backend_model
    model = build_object_detection_model(
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection_model.py", line 1111, in build_object_detection_model
    backend_detector = __BACKEND_MODEL.build(
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/mmengine/registry/registry.py", line 570, in build
    return self.build_func(cfg, *args, **kwargs, registry=self)
  File "/home/user/miniconda3/envs/mask/lib/python3.9/site-packages/mmengine/registry/build_functions.py", line 121, in build_from_cfg
    obj = obj_cls(**args)  # type: ignore
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection_model.py", line 56, in __init__
    self._init_wrapper(
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/mmdet/deploy/object_detection_model.py", line 70, in _init_wrapper
    self.wrapper = BaseBackendModel._build_wrapper(
  File "/home/user/masking/mmdeploy/mmdeploy/codebase/base/backend_model.py", line 65, in _build_wrapper
    return backend_mgr.build_wrapper(backend_files, device, input_names,
  File "/home/user/masking/mmdeploy/mmdeploy/backend/onnxruntime/backend_manager.py", line 34, in build_wrapper
    from .wrapper import ORTWrapper
  File "/home/user/masking/mmdeploy/mmdeploy/backend/onnxruntime/wrapper.py", line 17, in <module>
    class ORTWrapper(BaseWrapper):
  File "/home/user/masking/mmdeploy/mmdeploy/backend/onnxruntime/wrapper.py", line 119, in ORTWrapper
    def __ort_execute(self, io_binding: ort.IOBinding):
AttributeError: module 'onnxruntime' has no attribute 'IOBinding'
```

근데?
그러고도 저런에러가?
또떠가지고?
보니까 onnxruntime-gpu 까는거 1.8.1 버전깔라고 가이드에 나와있는거로 깐건데..
낮은버전이랑 메소드가 호환이 안되서그런거였음.
onnxruntime-gpu==1.17.1 버전 최신으로 깔아주니까 잘 돌아감

#### cmake 안될때

mmdeploy 에서

```bash
git submodule update --init --recursive
```

로 서브모듈도 전부 받아줘야함

#### m1에서 mmdeploy==0.2.0 만 깔릴때

mmdeploy git을 클론한다음에 거기서 install해줘야함

```bash
git clone https://github.com/open-mmlab/mmdeploy.git
cd mmdeploy
pip install -U openmim && mim install -e .
```


#### onnx 결과물에서 mask 영역이 없을때

이상하게 결과물에서 네모 box만있고.. 변환 전 모델은 mask 영역이있어서 보니까
type이 detection이 아니고 instance segmentation 이었음.
detection의 경우, 박스영역만있고 mask영역은 없으니 주의하자.
변환할때 "configs/mmdet/instance-seg/instance-seg_onnxruntime_dynamic.py” 로 컨피그를 바꿔주고, 로딩할때도 해당 컨피그로 변경해주니 정상적으로 마스크영역을 물고오는걸 확인할 수 있었다!!
