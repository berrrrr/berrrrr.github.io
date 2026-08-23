---
layout: post
title: "[MLOps] 3. Multimodal RAG"
subtitle: "[MLOps] 3. Multimodal RAG"
categories: programming
tags: mlops
comments: true
---


### 3.1 멀티모달 RAG 개요

모달리티(Modality)는 입력 데이터의 유형을 의미하며, 이미지, 텍스트, 음성 등을 뜻합니다. 멀티모달이번 장에서는 여러가지 데이터 유형을 사용하여 RAG하는 멀티모달(Multimodal) RAG에 대해 알아보겠습니다.

#### 3.1.1 멀티모달 RAG란?

멀티모달(Multimodal) RAG 란? 텍스트 뿐만 아니라 이미지, 차트 등 다양한 형태의 데이터를 처리할 수 있도록 지원합니다. 이는 시각적 정보를 포함한 복잡한 요청에도 정확한 답변을 생성할 수 있도록 설계되었습니다. 예를 들어, 상품 검색에서 텍스트 설명 뿐만 아니라 상품 이미지도 함께 고려하여 더 정확한 검색 결과를 제공할 수 있습니다.

#### 3.1.2 멀티모달 RAG가 어려운 이유

엔터프라이즈(비정형) 데이터는 고해상도 이미지로 가득 찬 폴더든 텍스트 표, 차트, 다이어그램 등이 혼합된 PDF든 간에 여러 양식에 분산되어 있는 경우가 많습니다.
이러한 유형의 양식 분산 작업 시, 각 양식마다 고유한 과제가 있음을 이해하고 양식 간에 정보를 어떻게 관리할 것인지를 고려해야합니다.
**각 양식에는 고유한 과제가 있습니다.**
이미지를 예로 들면(그림 1), 왼쪽 이미지의 경우 세부적인 디테일보다는 일반적인 이미지에 더 중점을 두고 있습니다. 연못, 바다, 나무, 모래와 같은 몇 가지 주요 포인트에만 주의를 집중하고 있음을 확인할 수 있습니다. 보고서와 문서에는 차트와 다이어그램과 같은 정보 밀도가 높은 이미지가 포함될 수 있으며, 이러한 이미지에는 주의해야할 포인트가 많으며 이미지에서 파생될 수 있는 추가 컨텍스트를 고려해야합니다. 어떤 파이프라인을 구축하든 이러한 뉘앙스를 포착하고 처리해야 정보를 효과적으로 포함할 수 있습니다.
**여러 양식에 걸쳐 정보를 어떻게 관리하나요?**
또 다른 중요한 측면은 다양한 모달리티에 걸쳐 정보를 표현하는 것입니다. 예를 들어, 문서로 작업하는 경우 차트의 의미론적 표현이 동일한 차트를 설명하는 텍스트의 의미론적 표현과 일치하는지 확인해야 합니다.

### 3.2 멀티모달 RAG 구현방법

이미지, 차트 등 다양한 데이터를 LLM에게 인지시키는 방법으로는 여러가지가 존재합니다. Multimodal RAG를 구현하기 위해서는 서로 다른 유형의 데이터(예: 상품명, 상품 이미지)간의 의미와 관계를 저장해야 합니다. 또한, 사용자로부터 이미지 또는 텍스트 형태의 요청이 있을 때 이를 효과적으로 검색하는 것이 중요합니다. Multimodal RAG를 구현하기 위해 아래와 같은 방법들을 고려할 수 있습니다.
주요 과제를 이해했으니 이제 이러한 과제를 해결하기 위한 RAG 파이프라인 구축의 세부 사항을 살펴봅시다.
멀티모달 RAG 파이프라인을 구축하는 데는 서로 다른 모달리티를 어떻게 표현할지에 따라 몇 가지 주요 접근 방식이 있습니다:
- 모든 모달리티를 동일한 벡터 공간에 포함하기
- 모든 모달리티를 하나의 기본 모달리티로 묶기
- 서로 다른 모달리티를 위한 별도의 저장소 보유

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/multimodal-rag/01.png?raw=true)

#### 3.2.1 모든 모달리티를 동일한 벡터 공간에 포함하기

- 다중 모달 임베딩(예: [CLIP](https://openai.com/research/clip))을 사용하여 이미지와 텍스트를 임베딩합니다.
- 유사성 검색을 사용하여 둘 다 검색합니다.
- 다중 모달 LLM에 원본 이미지와 텍스트 조각을 전달하여 답변을 합성합니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/multimodal-rag/02.png?raw=true)

이미지와 텍스트의 경우 [**CLIP**](https://openai.com/research/clip)과 같은 모델을 사용하여 텍스트와 이미지를 모두 동일한 벡터 공간에 인코딩할 수 있습니다. 이렇게 하면 대체로 동일한 텍스트 전용 RAG 인프라를 사용하고 임베딩 모델을 교체하여 다른 모달리티를 수용할 수 있습니다. 그런 다음 생성 패스의 경우 모든 질문과 답변에 대해 <span underline="true">[**거대 언어 모델**](https://www.nvidia.com/en-us/glossary/large-language-models/)</span> (LLM)을 멀티모달 LLM(MLLM)으로 대체합니다.
이 접근 방식은 일반 검색 파이프라인에서 필요한 유일한 변경 사항은 임베딩 모델을 교체하는 것이므로 파이프라인을 간소화합니다.
이 상황에서는 다양한 유형의 이미지와 텍스트를 효과적으로 임베드할 수 있는 모델에 액세스하고 이미지의 텍스트나 복잡한 표와 같은 복잡한 내용을 모두 캡처할 수 있어야 한다는 단점이 있습니다.

#### 3.2.2 모든 모달리티를 하나의 기본 모달리티로 묶기

- 다중 모달 LLM(예: GPT-4V, GPT4o, [LLaVA](https://llava.hliu.cc/), [FUYU-8b](https://www.adept.ai/blog/fuyu-8b))을 사용하여 이미지에서 텍스트 요약을 생성합니다.
- 텍스트를 임베딩하고 검색합니다.
- LLM에 텍스트 조각을 전달하여 답변을 합성합니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/multimodal-rag/03.png?raw=true)

또 다른 옵션은 애플리케이션의 초점에 따라 기본 모달리티를 선택하고 다른 모든 모달리티를 기본 모달리티로 묶는 것입니다.
예를 들어 애플리케이션이 주로 PDF보다 텍스트 기반 Q&A를 중심으로 운영된다고 가정해 보겠습니다. 이 경우 텍스트는 정상적으로 처리하지만 이미지의 경우 전처리 단계에서 텍스트 설명과 메타데이터를 생성합니다. 또한 나중에 사용할 수 있도록 이미지를 저장합니다.
추론 패스에서 검색은 주로 이미지에 대한 텍스트 설명과 메타데이터를 기반으로 작동하며, 검색된 이미지 유형에 따라 LLM과 MLLM을 혼합하여 답을 생성합니다.
여기서 가장 큰 장점은 정보가 풍부한 이미지에서 생성된 메타데이터가 객관적인 질문에 답하는 데 매우 유용하다는 것입니다. 또한 이미지 임베딩을 위한 새로운 모델을 조정하고 다양한 양식의 결과 순위를 매기기 위한 리랭커를 구축해야 할 필요성을 해결해 줍니다. 주요 단점은 전처리 비용과 이미지의 뉘앙스가 손실된다는 점입니다.

#### 3.2.3 ** **서로 다른 모달리티를 위한 별도의 저장소 보유

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/multimodal-rag/04.png?raw=true)

- 다중 모달 LLM(예: GPT-4V, GPT4o, [LLaVA](https://llava.hliu.cc/), [FUYU-8b](https://www.adept.ai/blog/fuyu-8b))을 사용하여 이미지에서 텍스트 요약을 생성합니다.
- 원본 이미지에 대한 참조와 함께 이미지 요약을 임베딩하고 검색합니다.
- 다중 모달 LLM에 원본 이미지와 텍스트 조각을 전달하여 답변을 합성합니다.
랭크-리랭크는 서로 다른 모달리티에 대해 별도의 스토어를 보유하고, 모두 쿼리하여 상위 *N개의* 청크(Chunk)를 검색한 다음, 전용 멀티모달 리랭크가 가장 관련성이 높은 청크를 제공하도록 하는 또 다른 접근 방식입니다.
이 접근 방식은 모델링 프로세스를 간소화하므로 여러 양식으로 작업하기 위해 하나의 모델을 조정할 필요가 없습니다. 그러나 현재 최상위 *M\*N* 청크*(* *M개의* 양식에서 각각*N개* )를 정렬하기 위한 리랭크의 형태로 복잡성이 추가됩니다.
Multi-vector Retrieval은 각 모달리티 데이터를 각각의 벡터 공간에 임베딩하여 저장하고, 검색 시 여러 벡터 공간에서 검색을 수행하는 방법입니다. 각 모달리티의 특성을 개별적으로 유지하면서도 통합된 검색 결과를 얻을 수 있습니다.
각 모달리티를 별도의 벡터 공간에 임베딩하므로, 개별 특성을 잘 반영할 수 있고 모달리티의 특성에 맞는 최적화된 검색을 수행할 수 있습니다. 하지만 각 모달리티별로 별도의 임베딩과 검색을 수행하므로 계산 리소스와 저장 공간, 검색 소요시간이 추가로 요구됩니다.
각 접근 방식은 사용자의 쿼리 유형과 특정 요구 사항에 맞게 선택될 수 있으며, 데이터의 특성, 벡터 공간의 리소스, 반응 속도 등을 종합적으로 고려하여 가장 적합한 방법을 선택하는 것이 중요합니다.

### 3.3 멀티모달 RAG 실습

이제 실제 pdf 파일에서 데이터를 추출하고 저장한 뒤 이를 활용하여 pdf 본문에 대한 질문, 응답이 가능한 검색기를 구현해 보겠습니다.
먼저 코드를 작성할 파일(주피터 노트북)을 생성합니다. VS Code의 왼쪽 EXPLORER에서 마우스 오른쪽 버튼을 클릭하고, \[New File\]을 클릭해 새로운 파일을 추가합니다. 파일 이름은 `ch03_MULTI_MODAL_RAG.ipynb`로 지정합니다.

#### 3.3.1 준비사항

1. 필요한 파이썬 패키지 설치
2. unstructured 라이브러리 사용을 위한
  pdf 텍스트 처리를 위해서는 두가지 의존성 설치가 필요합니다.
  PDF 분할 작업을 위해 `unstructured`를 사용합니다. `unstructured` 를 위해 다음과 도구의 설치가 필요합니다:
  [poppler 설치 방법](https://pdf2image.readthedocs.io/en/latest/installation.html)과 [tesseract 설치 방법](https://tesseract-ocr.github.io/tessdoc/Installation.html)을 참고하여 설치해주세요.

<details>

<summary>`tesseract` : 광학 문자 인식(OCR)을 위해 사용</summary>

    Ubuntu
    You can install Tesseract and its developer tools on Ubuntu by simply running:
    `sudo apt install tesseract-ocr<br>sudo apt install libtesseract-dev`
    macos
    `brew install tesseract`
    window
    Installer for Windows for Tesseract 3.05, Tesseract 4 and Tesseract 5 are available from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). These include the training tools. Both 32-bit and 64-bit installers are available.
    An installer for the **OLD version 3.02** is available for Windows from our [download](https://tesseract-ocr.github.io/tessdoc/Downloads.html) page. This includes the English training data. If you want to use another language, [download the appropriate training data](https://tesseract-ocr.github.io/tessdoc/Data-Files.html), unpack it using [7-zip](http://www.7-zip.org/), and copy the .traineddata file into the ‘tessdata’ directory, probably `C:\Program Files\Tesseract-OCR\tessdata`.
    To access tesseract-OCR from any location you may have to add the directory where the tesseract-OCR binaries are located to the Path variables, probably `C:\Program Files\Tesseract-OCR`.
    Experts can also get binaries build with Visual Studio from the build artifacts of the [Appveyor Continuous Integration](https://ci.appveyor.com/project/zdenop/tesseract/history).

</details>

<details>

<summary>`poppler` : PDF 렌더링 및 처리</summary>

    참고)   설치
    **Ubuntu**
      `sudo apt-get install poppler-utils`
    **Archlinux**
    `sudo pacman -S poppler`
    **MacOS**
    `brew install poppler`
    **Windows**
    1. Download the latest poppler package from [@oschwartz10612 version](https://github.com/oschwartz10612/poppler-windows/releases/) which is the most up-to-date.
    2. Move the extracted directory to the desired place on your system
    3. Add the `bin/` directory to your [PATH](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/)
    4. Test that all went well by opening `cmd` and making sure that you can call `pdftoppm -h`

</details>

3. 오픈AI API Key 설정

```python
import getpass
import os

def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")

_set_env("OPENAI_API_KEY")
```

#### 3.3.2 데이터 전처리

가장 먼저 검색에 활용할 PDF 파일의 전처리를 진행하여 벡터저장소에 저장하는 작업을 진행합니다. PDF 내에는 다양한 텍스트와 이미지, 그리고 테이블 데이터 등 다양한 유형의 데이터가 존재하며 이를 모두 한번에 추출한 뒤, 분류하여 저장하는 작업을 진행해보겠습니다.
이번 예시에서는 질병관리청에서 주마다 발간하는 [해외 감염병 발생동향](https://dportal.kdca.go.kr/pot/bbs/BD_selectBbsList.do?q_bbsSn=1009) pdf를 사용해보도록 하겠습니다.  해당 pdf에는 감염병 발생 동향에 대한 텍스트와 전파경로를 설명하는 이미지, 질병별 연도별 환자 수를 보기 쉽게 도식화한 테이블 데이터를 포함하고있습니다.
우선 pdf에서 각 요소들을 모두 추출해보겠습니다. 위에서 설치한 `unstructured`  라이브러리의 partition_pdf 함수를 사용합니다. 해당 함수에 아래 인자들을 넣어주면, 원하는 만큼 텍스트 데이터를 조각낼수 있고 이미지와 테이블 구조를 추출할 수 있습니다.
필요에 따라 해당 인자값을 조정하시면 원하는 형태로 데이터 추출이 가능합니다.
- filename : 분석하고자하는 pdf 파일 경로를 넣어줍니다
- extract_iamges_in_pdf : pdf 안에 이미지가 있다면 이미지를 추출합니다
- infer_table_structure : pdf 안에 테이블이 있다면 테이블을 추출합니다
- chunking_strategy : 텍스트를 어떻게 조각낼지에 대한 [전략](https://docs.unstructured.io/open-source/core-functionality/chunking#chunking-strategies)을 선택합니다.
  - basic : 섹션 구분 없이 글자수에 따라 조각냅니다
  - by_title : 페이지 혹은 섹션 경계에 따라 조각냅니다
- max_characters : 텍스트 조각 당 최대 글자수를 설정합니다
- new_after_n_chars : 현재 텍스트 조각이 new_after_n_chars 를 넘었다면 새 요소를 추가했을때 max_characters 를 넘는지 검사하여 넘는다면 새로운 텍스트 조각을 생성하도록 합니다.
- combine_text_under_n_chars : 여기에 설정된 크기 이하의 텍스트 조각은 다른 작은 텍스트조각과 결합하여 max_characters 에 더 가까운 텍스트조각을 만들도록 합니다.
- image_output_dir_path : 추출한 이미지를 저장할 경로를 설정합니다.

```python
import os
from unstructured.partition.pdf import partition_pdf

# 파일 경로 설정
fpath = './multimodal_rag'
fname = "sample.pdf"

# PDF에서 요소 추출
raw_pdf_elements = partition_pdf(
    filename=os.path.join(fpath, fname),
    extract_images_in_pdf=True,
    infer_table_structure=True,
    chunking_strategy="by_title",
    max_characters=4000,
    new_after_n_chars=3800,
    combine_text_under_n_chars=2000,
    image_output_dir_path=fpath,
)
```


다음은 이렇게 추출한 요소들 중, 테이블과 텍스트를 분리하여 저장합니다.

```python
# 텍스트, 테이블 추출
tables = []
texts = []
for element in raw_pdf_elements:
    if "unstructured.documents.elements.Table" in str(type(element)):
        tables.append(str(element))  # 테이블 요소 추가
    elif "unstructured.documents.elements.CompositeElement" in str(type(element)):
        texts.append(str(element))  # 텍스트 요소 추가
```


#### 3.3.3 멀티-벡터 검색기

[https://python.langchain.com/docs/how_to/multi_vector/](https://python.langchain.com/docs/how_to/multi_vector/)
**텍스트 및 테이블 요약**
우선 추출한 요소들 중, 텍스트와 테이블에 대한 요약문을 생성하겠습니다.

```python
# 프롬프트 설정
prompt_text = """당신은 표와 텍스트를 요약하여 검색할 수 있도록 돕는 역할을 맡은 어시스턴트입니다.
이 요약은 임베딩되어 원본 텍스트나 표 요소를 검색하는 데 사용될 것입니다.
표 또는 텍스트에 대한 간결한 요약을 제공하여 검색에 최적화된 형태로 만들어 주세요. 표 또는 텍스트: {element} """
prompt = ChatPromptTemplate.from_template(prompt_text)

# 텍스트 요약 체인
model = ChatOpenAI(temperature=0, model="gpt-4")
summarize_chain = {"element": lambda x: x} | prompt | model | StrOutputParser()

# 제공된 텍스트에 대해 요약을 할 경우
text_summaries = summarize_chain.batch(texts, {"max_concurrency": 5})
# 요약을 원치 않을 경우
# text_summaries = texts

# 제공된 테이블에 적용
table_summaries = summarize_chain.batch(tables, {"max_concurrency": 5})

print(text_summaries)
print(table_summaries)
```

`summarize_chain = {"element": lambda x: x} | prompt | model | StrOutputParser()` 와 같이 요약 체인을 생성합니다. 이는 element라는 key에 저장된 리스트형식 데이터를 받아  각각 모델에 넣어 문자열 형태의 아웃풋으로 받는 체인입니다.
위에서 추출한 테이블과 텍스트를 chatgpt에게 `summarize_chain.batch` 함수를 호출하여 요약체인의 배치로 실행합니다. chatgpt는 프롬프트에 따라 각 텍스트와 테이블에 대한 요약문을 응답으로 제공하게 되는데, 이를  text_summaries, table_summaries 에 따로 저장해두겠습니다.

**이미지 요약**
pdf에서 추출한 3가지 모달리티 중 텍스트와 테이블에 대한 요약문은 생성을 마쳤습니다. 이제 마지막 모달리티인 이미지에 대한 요약을 생성해보도록 하겠습니다.
오픈AI에서 지원하고있는 많은 모델 중, 비전(Vison) 즉 이미지를 다룰 수 있는 모델인 `gpt-4o` 모델을 사용하겠습니다.
\[참고내용\]
오픈AI에서는 여러 모델을 지원하지만 모든 모델이 비전을 다룰 수 있는 것은 아닙니다.
 [https://platform.openai.com/docs/models](https://platform.openai.com/docs/models)
오픈AI의 모델 소개 페이지에서 비전(Vision)을 지원한다고 소개된 모델만 아래에서 설명할 이미지를 입력으로 받아 이를 인식하고, 출력할 수 있습니다.
이미지는 텍스트보다 더 많은 정보를 포함한 복잡한 모달리티입니다. AI모델이 이미지를 인지할 수 있는 정형화된 모양으로 변환해서 전달해야하는데, 오픈AI에서는 아래와 같이 이미지를 전달할 수 있는 여러 옵션을 제공하고 있습니다.
참고하여서 사용 사례에 맞게 모델에게 이미지를 활용하시기 바랍니다. <br>[https://platform.openai.com/docs/guides/vision](https://platform.openai.com/docs/guides/vision)

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What’s in this image?"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
      ],
    }
  ],
  max_tokens=300,
)

print(response.choices[0])
```

```python
import base64
import requests

# OpenAI API Key
api_key = "REDACTED"

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Bearer {api_key}"
}

payload = {
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What’s in this image?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": f"data:image/jpeg;base64,{base64_image}"
          }
        }
      ]
    }
  ],
  "max_tokens": 300
}

response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

print(response.json())
```

```python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What are in these images? Is there any difference between them?",
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        },
      ],
    }
  ],
  max_tokens=300,
)
print(response.choices[0])
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What’s in this image?"},
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            "detail": "high"
          },
        },
      ],
    }
  ],
  max_tokens=300,
)

print(response.choices[0].message.content)
```

**저해상도 또는 고해상도 이미지 이해**
detail 파라미터를 조정하여 모델이 이미지를 처리하고 텍스트로 이해하는 방식을 제어할 수 있습니다. 이 파라미터에는 low (저해상도), high (고해상도), auto (자동) 세 가지 옵션이 있습니다. 기본적으로 모델은 auto 설정을 사용하여 입력 이미지 크기를 확인한 후 low 또는 high 모드를 자동으로 선택합니다.
- **low :** “저해상도” 모드를 활성화합니다. 이 모드에서는 모델이 512px x 512px 크기의 저해상도 이미지를 받고, 이미지에 대해 85 토큰의 예산을 사용하여 표현합니다. 이 모드는 빠른 응답을 원하거나 높은 세부사항이 필요하지 않은 경우에 유용하며, 입력 토큰 수를 절약할 수 있습니다.
- **high : ** “고해상도” 모드를 활성화하며, 먼저 85 토큰으로 저해상도 이미지를 본 후, 512px x 512px 타일당 170 토큰을 사용하여 상세한 크롭을 생성합니다.
- **auto** : 에서는 입력 이미지 크기에 따라 low 또는 high 설정을 자동으로 선택하여 처리 속도와 이미지 세부사항을 균형 있게 관리합니다.

오픈AI 모델에게 이미지를 보내는 다양한 방법이 있지만 이번 실습에서는 pdf에서 추출한 이미지를 사용하는 만큼 모델에게 base64인코딩된 이미지를 직접 보내는 방법을 사용하겠습니다. `base64.b64encode` 함수를 통해 이미지를 모델이 인지 가능한 base64 형태로 인코딩 할 수 있습니다.

```python
def encode_image(image_path) -> str:
    # 이미지 base64 인코딩
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


# 이미지의 base64 인코딩을 저장하는 리스트
img_base64_list = []

# 이미지를 읽어 base64 인코딩 후 저장
for img_file in sorted(os.listdir(fpath)):
    if img_file.endswith('.jpg'):
        img_path = os.path.join(fpath, img_file)
        base64_image = encode_image(img_path)
        img_base64_list.append(base64_image)
```

인코딩한 이미지를

\[참고자료\]
Base64 인코딩은 **이진 데이터를 텍스트 형식으로 변환**하는 방법입니다. 주로 바이너리 데이터를 텍스트로 전송하거나 저장할 때 사용됩니다. Base64는 64개의 ASCII 문자로 데이터를 인코딩하며, 인코딩된 데이터는 텍스트로만 구성되기 때문에 네트워크 전송이나 텍스트 파일에 안전하게 저장할 수 있습니다.
**Base64 인코딩 동작 원리**
1.  **바이너리 데이터를 6비트 단위로 분할**: 일반적으로 컴퓨터의 데이터는 8비트로 표현되지만, Base64는 6비트 단위로 데이터를 분할합니다. 8비트를 6비트로 나누면 데이터가 압축되기 때문에, 데이터를 쉽게 전송할 수 있습니다.
2.  **64개의 문자 집합**을 사용: Base64에서 사용되는 64개의 문자 집합은 다음과 같습니다:
•  대문자 알파벳: A-Z (26개)
•  소문자 알파벳: a-z (26개)
•  숫자: 0-9 (10개)
•  추가 문자: +, /
3.  **패딩 추가**: 데이터가 3바이트로 나누어지지 않으면, = 문자를 패딩으로 추가해 데이터의 길이를 맞춥니다. 패딩은 데이터를 원래 상태로 복원할 때 도움이 됩니다.
이미지 데이터 역시 이진데이터입니다. base64인코딩을 통해 텍스트 데이터로 변경한 뒤 모델에게 전송하게됩니다.

이미지를 모두 인코딩했다면 이제 LLM모델에게 이를 전달하여 텍스트 형식의 요약문을 생성해달라고 요청하겠습니다. 이 요약문은 차후 원본 이미지를 검색하는데 활용되므로, 프롬프트에 이를 상세히 지시하여 보다 우리가 원하는 형태의 요약문을 얻어보겠습니다.

```python
def image_summarize(img_base64: str) -> str:
    # 이미지 요약
    chat = ChatOpenAI(model="gpt-4o", max_tokens=1024)
    prompt = """
    당신은 이미지를 요약하여 검색을 위해 사용할 수 있도록 돕는 어시스턴트입니다.
    이 요약은 임베딩되어 원본 이미지를 검색하는 데 사용됩니다.
    이미지 검색에 최적화된 간결한 요약을 작성하세요.
    """
    msg = chat.invoke(
        [
            HumanMessage(
                content=[
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_base64}"
                        },
                    },
                ]
            )
        ]
    )
    return msg.content


# 이미지 요약을 저장하는 리스트
image_summaries = []

for img_base64 in img_base64_list:
    image_summary = image_summarize(img_base64)

```


**벡터 저장소에 추가**
이제 원본 문서와 생성한 요약본들을  벡터 저장소에 저장하겠습니다.
다양한 벡터저장소가 존재하지만, 이번 실습에서는 크로마(Chroma)저장소를 사용하겠습니다. 이 벡터 저장소에는 변환된 각종 테이블 요약이 임베딩 벡터 형태로 변환되어 저장되며, 이를 통해 의미 기반 검색(semantic retrieval)을 수행하게됩니다. 텍스트를 임베딩 벡터로 변환할때는 오픈AI의 임베딩 API를 이용하겠습니다. 크로마DB를 선언할때 `embedding_function` 에 `OpenAIEmbeddings()` 클라이언트를 넣어주면 자동으로 벡터 저장소에 오픈AI임베딩API를 사용하여 저장하게됩니다.
원본데이터는 docstore에 저장하겠습니다. 저장 위치는 메모리이므로, `InMemoryStore()` 를 선언합니다.
선언한 저장소들을 사용하여 멀티모달 데이터를 검색할수있는 멀티벡터 검색기 `MultiVectorRetriever` 를 선언해줍니다.

```python
# 분할한 텍스트들을 색인할 벡터 저장소
vectorstore = Chroma(collection_name="multi_modal_rag",
                     embedding_function=OpenAIEmbeddings())

# 원본문서 저장을 위한 저장소 선언
docstore = InMemoryStore()
id_key = "doc_id"

# 검색기
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    docstore=docstore,
    id_key=id_key,
)
```


이제 우리가 pdf로부터 추출한 각종 데이터와 요약본들을 저장소에 저장해보겠습니다.
docstore에는 원본 텍스트, 테이블, base64인코딩된 원본이미지를 저장합니다.
각 원본데이터를 식별할 수 있는 중복되지 않는 id가 필요한데,  `uuid.uuid4` 함수로 중복되지 않는 id값을 생성하여 사용하도록 하겠습니다. zip함수를 사용하면 생성된 id와 원본데이터 쌍(id-원본데이터)을 만들어 저장할 수 있습니다.

```python
# 원본 텍스트 데이터 저장
doc_ids = [str(uuid.uuid4()) for _ in texts]
retriever.docstore.mset(list(zip(doc_ids, texts)))

# 원본 테이블 데이터 저장
table_ids = [str(uuid.uuid4()) for _ in tables]
retriever.docstore.mset(list(zip(table_ids, tables)))

# 원본 이미지(base64) 데이터 저장
img_ids = [str(uuid.uuid4()) for _ in img_base64_list]
retriever.docstore.mset(list(zip(img_ids, img_base64_list)))
```

vectorstore에는 텍스트와 테이블의 요약본을 저장합니다. 벡터스토어에 저장할 때 위에서  지정한 `OpenAIEmbeddings` 으로 요약 텍스트를 벡터화한 데이터를 함께 저장하게 됩니다. 이러한 데이터는 이후 사용자의 질문이 입력되면 유사한 의미의 텍스트를 찾는 의미기반 검색에 활용됩니다.

```python
# 텍스트 요약 벡터 저장
summary_texts = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(text_summaries)
]
retriever.vectorstore.add_documents(summary_texts)

# 테이블 요약 벡터 저장
summary_tables = [
    Document(page_content=s, metadata={id_key: table_ids[i]})
    for i, s in enumerate(table_summaries)
]
retriever.vectorstore.add_documents(summary_tables)

# 이미지 요약 벡터 저장

summary_img = [
    Document(page_content=s, metadata={id_key: img_ids[i]})
    for i, s in enumerate(image_summaries)
]
retriever.vectorstore.add_documents(summary_img)
```


#### 3.3.4 RAG

**검색 확인**
이제 검색기가 우리가 입력한 질문에 유사한 이미지 혹은 텍스트나 테이블을 잘 검색하고, 올바른 결과를 되돌려주는지 확인해보겠습니다.

```python
docs = retriever.get_relevant_documents(
    "큐열(Q fever)의 전파 경로는 어떻게 되나요?"
)
```

```python
len(docs)
```

총 n개의 검색 결과가 있는것을 확인할 수 있습니다.
이미지, 텍스트 결과가 섞여있으므로 이를 구분하여 확인해보겟습니다.

```python
from base64 import b64decode

def split_image_text_types(docs):
    # 이미지와 텍스트 데이터를 분리
    b64 = []
    text = []
    for doc in docs:
        try:
            b64decode(doc)
            b64.append(doc)
        except Exception as e:
            text.append(doc)
    return {
        "images": b64,
        "texts": text
    }

docs_by_type = split_image_text_types(docs)
```


```python

len(docs_by_type["images"])
len(docs_by_type["texts"])
```

이미지는 총 n개, 텍스트는 총 n개 있는것을 확인할 수 있습니다.

```python

from IPython.display import display, HTML

def plt_img_base64(img_base64):
    # base64 이미지로 html 태그를 작성합니다
    image_html = f'<img src="data:image/jpeg;base64,{img_base64}" />'

    # html 태그를 기반으로 이미지를 표기합니다
    display(HTML(image_html))

plt_img_base64(docs_by_type["images"][0])
```

이미지를 확인할 수 있는 함수 `plt_img_base64` 를 작성하고, 이를 통해 첫번째 이미지를 확인해봅니다.
큐열에 대한 전파경로 이미지를 확인할 수 있습니다.

```python
docs_by_type["texts"][0]
```

첫번째 문서를 확인해봅니다. 큐열에 대한 개요 텍스트를 확인할 수 있습니다.

**답변 생성**
검색기가 올바른 검색 결과를 돌려주는것을 확인했으므로, 이를 기반으로 올바른 답변을 생성하는 과정을 진행해보겠습니다.

```python
from operator import itemgetter
from langchain.schema.runnable import RunnablePassthrough, RunnableLambda

def prompt_func(dict):
    format_texts = "\n".join(dict["context"]["texts"])
    text = f"""
    다음 문맥에만 기반하여 질문에 답하세요. 문맥에는 텍스트, 표, 그리고 아래 이미지가 포함될 수 있습니다:
    질문: {dict["question"]}

    텍스트와 표:
    {format_texts}
    """

    prompt = [
        HumanMessage(
            content=[
                {"type": "text", "text": text},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{dict['context']['images'][0]}"}},
            ]
        )
    ]

    return prompt


model = ChatOpenAI(temperature=0, model="gpt-4o", max_tokens=1024)

# RAG 파이프라인
chain = (
        {"context": retriever | RunnableLambda(split_image_text_types), "question": RunnablePassthrough()}
        | RunnableLambda(prompt_func)
        | model
        | StrOutputParser()
)
```

사용자에게 질문을 입력받으면 해당 질문을 기반으로 검색기에서 관련 텍스트, 테이블, 이미지 데이터를 검색한 뒤 이를 활용하여 답변 생성을 요청하는 RAG 파이프라인을 구성해보겠습니다.
\[참고자료\]
Langchain에서는 다양한 실행 논리를 정의하고 사용할 수 있는 여러 Runnable 객체를 제공합니다. 그중에서도 RunnableLambda와 RunnablePassthrough는 사용자 정의 로직을 실행할 때 유용합니다.
**1. RunnableLambda **[**\[링크\]**](https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html)
RunnableLambda는 간단한 람다 함수(익명 함수)를 실행할 수 있는 Runnable입니다. 주로 빠르고 간결한 작업을 처리하기 위해 사용됩니다. Python의 lambda 함수를 감싸서 Langchain의 실행 체인 내에서 동작하게 할 수 있습니다.
**특징:**
•  사용자가 원하는 임의의 함수를 정의하여 실행 가능
•  체인 내의 특정 단계에서 필요한 커스텀 로직을 추가하는 데 유용
•  예를 들어 데이터를 변형하거나 특정 로직을 적용하는 작업에 적합
**예시:**

```python
from langchain.schema.runnable import RunnableLambda

# 간단한 함수 정의
my_lambda = RunnableLambda(lambda x: x.upper())

# 입력을 처리
result = my_lambda.invoke("hello world")
print(result)  # "HELLO WORLD"
```

위 예시에서 my_lambda는 입력 문자열을 대문자로 변환하는 람다 함수를 정의하고 실행하는 Runnable입니다.
**2. RunnablePassthrough **[\[링크\]](https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html)
RunnablePassthrough는 입력을 그대로 출력하는 Runnable입니다. 즉, 별도의 처리를 하지 않고 입력을 통과시키는 역할을 합니다. 보통 특정 단계에서 입력을 그대로 넘기고 싶을 때 유용합니다.
**특징:**
•  입력을 가공하지 않고 그대로 전달
•  디버깅하거나 체인 내에서 특정 단계의 출력을 확인하고자 할 때 사용 가능
•  기본적으로 아무 동작도 하지 않으므로 효율적
**예시:**

```python
from langchain.schema.runnable import RunnablePassthrough

# 입력을 그대로 통과시키는 passthrough 실행
passthrough = RunnablePassthrough()

# 입력을 처리
result = passthrough.invoke("no change needed")
print(result)  # "no change needed"
```


1.  \{"context": retriever \| RunnableLambda(split_image_text_types), "question": RunnablePassthrough()\}:
- retriever: 사용자의 질문을 검색기에 검색합니다. 내부적으로 retriever.retrieve()함수가 호출되며, 결과로 이전 단계에서 적재한 텍스트, 테이블, 이미지 데이터가 생성됩니다.
- RunnableLambda(split_image_text_types): retriever로부터 받은 데이터를 가공하는 역할을 합니다. 여기서는 이미지와 텍스트 데이터를 구분하는 함수인 split_image_text_types가 사용되고 있습니다. 즉, 입력된 데이터를 이미지와 텍스트 유형으로 나눕니다.
- RunnablePassthrough(): 이 부분은 question 필드에 들어오는 데이터를 그대로 전달합니다. 즉, question에 해당하는 입력은 아무런 변환 없이 다음 단계로 넘겨집니다.
2.  \| RunnableLambda(prompt_func):
- 생성된 context를 기반으로 프롬프트를 생성합니다.
- 프롬프트 생성은 prompt_func 함수에 검색기 결과와 사용자의 질문을 넘겨 생성하게됩니다
3.  \| model:
- LLM에 생성한 프롬프트로 요청을 보내게 됩니다.
4.  \| StrOutputParser():
•  마지막으로 \*\*StrOutputParser()\*\*는 모델의 출력을 가공하는 역할을 합니다. 여기서는 모델이 반환한 데이터를 **문자열로 변환**하는 역할을 합니다.
•  모델은 여러 형식의 데이터를 반환할 수 있지만, 이를 최종적으로 문자열 형식으로 처리하여 사용자에게 결과를 전달하게 됩니다.


```python
chain.invoke(
    "큐열(Q fever)의 전파 경로는 어떻게 되나요?"
)
```

위와 같이 입력하면, 실제 LLM에는 다음과 같은 프롬프트로 전달됩니다
프롬프트결과

이제 LLM이 생성한 결과를 확인해보겠습니다.
LLM응답

저장해둔 이미지와 텍스트 데이터를 활용하여 사용자에게 응답을 제공하는 모습을 확인할 수 있습니다.


> [https://aws.amazon.com/ko/blogs/tech/bedrock-multimodal-rag-chatbot/](https://aws.amazon.com/ko/blogs/tech/bedrock-multimodal-rag-chatbot/)<br>[https://developer.nvidia.com/ko-kr/blog/an-easy-introduction-to-multimodal-retrieval-augmented-generation/](https://developer.nvidia.com/ko-kr/blog/an-easy-introduction-to-multimodal-retrieval-augmented-generation/)<br>[https://www.youtube.com/watch?v=-77EvEjuZJY](https://www.youtube.com/watch?v=-77EvEjuZJY)<br>[https://github.com/sudarshan-koirala/youtube-stuffs/blob/main/langchain/LangChain_Multi_modal_RAG.ipynb](https://github.com/sudarshan-koirala/youtube-stuffs/blob/main/langchain/LangChain_Multi_modal_RAG.ipynb)<br>[https://github.com/teddylee777/langchain-kr/blob/main/12-RAG/10-Multi_modal_RAG-GPT-4o.ipynb](https://github.com/teddylee777/langchain-kr/blob/main/12-RAG/10-Multi_modal_RAG-GPT-4o.ipynb)
