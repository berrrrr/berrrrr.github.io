---
layout: post
title: "[Python] 네트워크 전송을 위한 이미지 인코딩"
subtitle: "[Python] 네트워크 전송을 위한 이미지 인코딩"
categories: programming
tags: python
comments: true
---

[https://velog.io/@jk01019/cv2.imencode](https://velog.io/@jk01019/cv2.imencode)


NumPy ndarray 형식의 이미지를 multipart/form-data API로 전송하기 위해, `byteio` 변환 과정을 배제하고자 한다면, 이미지를 직접 메모리에서 바이트로 변환하여 전송하는 방법을 고려할 수 있습니다. 이때, `cv2` (OpenCV) 라이브러리를 사용하여 이미지를 메모리 내에서 직접 바이트로 인코딩하고, 이를 `requests` 라이브러리를 통해 API에 전송하는 방법이 비교적 빠르고 효율적입니다.
다음은 OpenCV와 requests를 사용하여 ndarray 형식의 이미지를 multipart/form-data로 전송하는 예시 코드입니다:

```python
import cv2
import requests
import numpy as np

# 예시 이미지 ndarray 생성 (여기서는 실제 이미지 데이터를 사용하세요)
image = np.zeros((100, 100, 3), dtype=np.uint8)

# OpenCV를 사용하여 메모리 내에서 이미지를 JPEG 포맷의 바이트로 인코딩
_, buffer = cv2.imencode('.jpg', image)

# 인코딩된 바이트 데이터를 이용하여 multipart/form-data로 전송
files = {'image': ('image.jpg', buffer.tobytes(), 'image/jpeg')}
response = requests.post('YOUR_API_ENDPOINT', files=files)

print(response.text)

```

이 방법은 `byteio` 객체를 사용하지 않고 직접 바이트 변환을 수행하기 때문에 처리 속도가 빠를 수 있습니다. 특히, 큰 이미지 파일을 처리할 때 메모리 사용량이 적고, 전송 속도가 중요한 경우 유용하게 사용할 수 있습니다.
단, 이 코드를 실행하기 전에 `numpy`, `opencv-python` (`cv2`), 그리고 `requests` 패키지가 설치되어 있어야 합니다. 필요한 패키지가 없다면, pip를 사용하여 설치할 수 있습니다:

```plain text
pip install numpy opencv-python requests

```

이 방법은 이미지를 바이트로 직접 인코딩하여 전송하기 때문에, `byteio` 변환 과정 없이도 빠르게 이미지 데이터를 전송할 수 있는 효율적인 방법입니다.


---


```python
def convert_ndarray_to_bytesio(image: np.ndarray, content_type: str) -> BytesIO:
    img_byte_arr = BytesIO()
    image = Image.fromarray(image)
    image.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    return img_byte_arr
```

이거랑 속도차이가 너무나서 gpt한테 물어봄.


이렇게 성능 차이가 나는 주된 이유는 데이터 처리 및 전송 과정에서의 효율성 때문입니다. `byteio`를 사용하는 방법과 OpenCV를 통해 바로 바이트로 변환하는 방법 사이에는 몇 가지 주요 차이점이 있습니다:
1. **메모리 사용과 할당 방식**: `byteio`를 사용하는 과정은 추가적인 메모리 할당과 복사 과정을 필요로 할 수 있습니다. 반면, OpenCV의 `imencode` 함수는 이미지를 직접 바이트로 인코딩하고, 이를 메모리 내에 효율적으로 관리합니다. 이는 특히 큰 이미지 파일을 다룰 때 메모리 사용 효율성에 큰 차이를 만들 수 있습니다.
2. **인코딩 효율성**: OpenCV는 이미지 처리와 관련된 작업에 최적화되어 있으며, 내부적으로 이미지를 인코딩할 때 최적화된 알고리즘을 사용합니다. 따라서, 이미지를 JPEG와 같은 형식으로 인코딩할 때 매우 빠른 속도를 보일 수 있습니다. `byteio`를 사용하는 경우, 이러한 최적화된 경로가 사용되지 않을 수 있으며, 이는 전체적인 처리 속도에 영향을 줄 수 있습니다.
3. **네트워크 전송**: 인코딩된 데이터를 `requests`를 통해 전송할 때, OpenCV로 인코딩된 바이트 스트림은 이미 최적화된 형태로 메모리에 저장되어 있으므로, 네트워크를 통한 전송 과정도 더욱 효율적일 수 있습니다. 데이터의 크기가 최소화되고, 필요한 메타데이터만 추가되어 전송되기 때문에 전송 시간이 단축될 수 있습니다.
4. **파이썬의 GIL(Global Interpreter Lock)**: 파이썬은 GIL 때문에 멀티쓰레드 환경에서도 싱글 쓰레드처럼 동작하여 CPU 바운드 작업에서 성능 저하가 일어날 수 있습니다. 그러나, OpenCV 같은 외부 C/C++ 라이브러리는 자체적인 최적화와 멀티쓰레딩을 사용하여 GIL의 영향을 받지 않고 고속으로 동작할 수 있습니다. 따라서, `byteio` 방식보다 OpenCV를 사용한 방식이 훨씬 빠를 수 있습니다.이러한 이유들로 인해, 같은 이미지 데이터를 처리하고 전송하더라도 사용하는 방법에 따라 성능 차이가 크게 나타날 수 있습니다. OpenCV를 사용한 방


라고함
