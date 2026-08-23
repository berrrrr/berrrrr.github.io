---
layout: post
title: "[MLOps] MLflow Evaluate로 LLM 평가하기"
subtitle: "[MLOps] mlflow.evaluate 사용해서 LLM 평가하기"
categories: programming
tags: mlops
comments: true
---

> mlflow에서도 대세에 발맞춰 LLM을 쉽게 평가할 수있는 기능을 추가했다.


### 장점

- 간단하게 평가할수있음
- use-case에 특화된 metric을 제공함
- custom metric도 사용가능함
- 비교분석이 쉽게 가능하다
- 각 metric을 통해 deep insight를 얻을수있다
라고 공식문서에서 주장하고있다

### 기본 사용법

```python
import mlflow
import openai
import os
import pandas as pd
from getpass import getpass

eval_data = pd.DataFrame(
    {
        "inputs": [
            "What is MLflow?",
            "What is Spark?",
        ],
        "ground_truth": [
            "MLflow is an open-source platform for managing the end-to-end machine learning (ML) "
            "lifecycle. It was developed by Databricks, a company that specializes in big data and "
            "machine learning solutions. MLflow is designed to address the challenges that data "
            "scientists and machine learning engineers face when developing, training, and deploying "
            "machine learning models.",
            "Apache Spark is an open-source, distributed computing system designed for big data "
            "processing and analytics. It was developed in response to limitations of the Hadoop "
            "MapReduce computing model, offering improvements in speed and ease of use. Spark "
            "provides libraries for various tasks such as data ingestion, processing, and analysis "
            "through its components like Spark SQL for structured data, Spark Streaming for "
            "real-time data processing, and MLlib for machine learning tasks",
        ],
    }
)

with mlflow.start_run() as run:
    system_prompt = "Answer the following question in two sentences"
    # Wrap "gpt-4" as an MLflow model.
    logged_model_info = mlflow.openai.log_model(
        model="gpt-4",
        task=openai.chat.completions,
        artifact_path="model",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "{question}"},
        ],
    )

    # Use predefined question-answering metrics to evaluate our model.
    results = mlflow.evaluate(
        logged_model_info.model_uri,
        eval_data,
        targets="ground_truth",
        model_type="question-answering",
    )
    print(f"See aggregated evaluation results below: \n{results.metrics}")

    # Evaluation result for each data record is available in `results.tables`.
    eval_table = results.tables["eval_results_table"]
    print(f"See evaluation table below: \n{eval_table}")
```

1. 평가할 데이터를 만든다
  - inputs
  - ground_truth
2. 평가할 모델 or 예측 함수를 정의한다
  - openai, bedrock 등 api 호출함수
  - 내 llm 모델을 로드해서 inference결과를 반환하는 함수
  - 내 llm모델을 api로 띄운 뒤, 해당 api를 호출하는 함수
  - 등등..
3. mlflow.evaluate함수에 위에서 정의한 데이터와 예측함수를 넣어주고, 측정을 원하는 지표정보를 넣어준다
  - 참고 [메트릭 docs](https://mlflow.org/docs/latest/python_api/mlflow.metrics.html#)
  - model_type을 정의해주면 자동으로 해당 타입에 필요한 metric을 계산해주기도함
  - 기준이되는 targets(보통 ground truth겠죠)을 필요로 하는 metric이 있으면 정의해줘야함
  - metric별로 준비물이 다를수있음.
    - open ai key를 필요로하는 metric
    - 특정 라이브러리를 설치해야하는 metric
      - `pip install tiktoken`
      - `pip install rouge_score`

### example

<details>

<summary>gpt35</summary>

  ```python
import mlflow
import openai
import pandas as pd

system_prompt = """
Your job is to answer questions about MLflow. When you are asked a question about MLflow,
respond to it. Make sure to include code examples. If the question is not related to
MLflow, refuse to answer and say that the question is unrelated.
"""
def get_eval_data():
    eval_data = pd.DataFrame(
        {
            "inputs": [
                "What is MLflow?",
                "What is Spark?",
            ],
            "ground_truth": [
                "MLflow is an open-source platform for managing the end-to-end machine learning (ML) lifecycle. It was developed by Databricks, a company that specializes in big data and machine learning solutions. MLflow is designed to address the challenges that data scientists and machine learning engineers face when developing, training, and deploying machine learning models.",
                "Apache Spark is an open-source, distributed computing system designed for big data processing and analytics. It was developed in response to limitations of the Hadoop MapReduce computing model, offering improvements in speed and ease of use. Spark provides libraries for various tasks such as data ingestion, processing, and analysis through its components like Spark SQL for structured data, Spark Streaming for real-time data processing, and MLlib for machine learning tasks",
            ],
        }
    )
    return eval_data


def openai_qa(inputs):
    openai.api_base = "https://example.com"
    openai.api_key = "REDACTED"
    openai.api_version = "2023-05-15"
    openai.api_type = "azure"

    answers = []
    for index, row in inputs.iterrows():
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            deployment_id="gpt-35-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{row}"},
            ],
        )
        answers.append(completion.choices[0].message.content)

    return answers


remote_server_uri = "https://example.com"
mlflow.set_tracking_uri(remote_server_uri)  # set tracking server url
mlflow.set_experiment("llm_test")  # set experiment name

eval_data = get_eval_data()
with mlflow.start_run(run_name="gpt35turbo") as run:
    mlflow.log_param("system_prompt", system_prompt)
    results = mlflow.evaluate(
        openai_qa,
        eval_data,
        targets="ground_truth",
        model_type="question-answering",
        extra_metrics=[mlflow.metrics.latency(), mlflow.metrics.rougeL()],
    )

  ```

</details>

<details>

<summary>gpt4</summary>

  ```python
import mlflow
import openai
import pandas as pd

system_prompt = "Please answer the following question in formal language."
def get_eval_data():
    eval_data = pd.DataFrame(
        {
            "inputs": [
                "What is MLflow?",
                "What is Spark?",
            ],
            "ground_truth": [
                "MLflow is an open-source platform for managing the end-to-end machine learning (ML) lifecycle. It was developed by Databricks, a company that specializes in big data and machine learning solutions. MLflow is designed to address the challenges that data scientists and machine learning engineers face when developing, training, and deploying machine learning models.",
                "Apache Spark is an open-source, distributed computing system designed for big data processing and analytics. It was developed in response to limitations of the Hadoop MapReduce computing model, offering improvements in speed and ease of use. Spark provides libraries for various tasks such as data ingestion, processing, and analysis through its components like Spark SQL for structured data, Spark Streaming for real-time data processing, and MLlib for machine learning tasks",
            ],
        }
    )
    return eval_data


def openai_qa(inputs):
    openai.api_base = "https://example.com"
    openai.api_key = "REDACTED"
    openai.api_version = "2023-05-15"
    openai.api_type = "azure"

    answers = []
    system_prompt = "Please answer the following question in formal language."
    for index, row in inputs.iterrows():
        completion = openai.ChatCompletion.create(
            model="gpt-4",
            deployment_id="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{row}"},
            ],
        )
        answers.append(completion.choices[0].message.content)

    return answers


remote_server_uri = "https://example.com"
mlflow.set_tracking_uri(remote_server_uri)  # set tracking server url
mlflow.set_experiment("llm_test")  # set experiment name
eval_data = get_eval_data()
with mlflow.start_run(run_name="gpt4") as run:
    mlflow.log_param("system_prompt", system_prompt)
    results = mlflow.evaluate(
        openai_qa,
        eval_data,
        targets="ground_truth",
        model_type="question-answering",
        extra_metrics=[mlflow.metrics.latency()],
    )
  ```

</details>

<details>

<summary>claude3</summary>

  ```python
import json
import os

import boto3
import mlflow
import pandas as pd
from botocore.config import Config


def get_eval_data():
    eval_data = pd.DataFrame(
        {
            "inputs": [
                "What is MLflow?",
                "What is Spark?",
            ],
            "ground_truth": [
                "MLflow is an open-source platform for managing the end-to-end machine learning (ML) lifecycle. It was developed by Databricks, a company that specializes in big data and machine learning solutions. MLflow is designed to address the challenges that data scientists and machine learning engineers face when developing, training, and deploying machine learning models.",
                "Apache Spark is an open-source, distributed computing system designed for big data processing and analytics. It was developed in response to limitations of the Hadoop MapReduce computing model, offering improvements in speed and ease of use. Spark provides libraries for various tasks such as data ingestion, processing, and analysis through its components like Spark SQL for structured data, Spark Streaming for real-time data processing, and MLlib for machine learning tasks",
            ],
        }
    )
    return eval_data


retry_config = Config(
    retries={
        "max_attempts": 10,
        "mode": "standard",
    },
)

modelId = "anthropic.claude-3-sonnet-20240229-v1:0"
accept = "application/json"
contentType = "application/json"

bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name="us-east-1",
    config=retry_config,
    aws_access_key_id=os.getenv('aws_access_key_id'),
    aws_secret_access_key=os.getenv('aws_secret_access_key'),
    aws_session_token=os.getenv('aws_session_token')
)


def bedrock_streemer(response):
    stream = response.get('body')
    answer = ""
    i = 1
    if stream:
        for event in stream:
            chunk = event.get('chunk')
            if chunk:
                chunk_obj = json.loads(chunk.get('bytes').decode())
                if "delta" in chunk_obj:
                    delta = chunk_obj['delta']
                    if "text" in delta:
                        text = delta['text']
                        print(text, end="")
                        answer += str(text)
                        i += 1
    return answer


def call_claude_sonet(inputs):
    answers = []
    for index, row in inputs.iterrows():
        prompt_config = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "temperature": 0,
            "top_k": 350,
            "top_p": 0.999,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"{row}"},
                    ],
                }
            ],
        }

        body = json.dumps(prompt_config)

        modelId = "anthropic.claude-3-sonnet-20240229-v1:0"
        accept = "application/json"
        contentType = "application/json"

        response = bedrock_runtime.invoke_model(
            body=body, modelId=modelId, accept=accept, contentType=contentType
        )
        response_body = json.loads(response.get("body").read())
        result = response_body.get("content")[0].get("text")
        answers.append(result)

    return answers


remote_server_uri = "https://example.com"
mlflow.set_tracking_uri(remote_server_uri)  # set tracking server url
mlflow.set_experiment("llm_test")  # set experiment name

eval_data = get_eval_data()
with mlflow.start_run(run_name="claude-3") as run:
    results = mlflow.evaluate(
        call_claude_sonet,
        eval_data,
        model_type="question-answering",
        extra_metrics=[mlflow.metrics.latency()],
    )

  ```

</details>

<details>

<summary>llama2</summary>

  ```python
import os

import mlflow
import pandas as pd
import tiktoken
import torch
from accelerate import Accelerator
from optimum.onnxruntime import ORTModelForCausalLM
from peft import PeftModel
from transformers import AutoTokenizer
from transformers import BitsAndBytesConfig, AutoModelForCausalLM

pretrained_model = "/data/user/huggingface_models/llama-2-ko-7b-fp16/"
lora_model = "/home/user/git/summarization/models/fp16/"
onnx_model = "/home/user/llmops/onnx"
use_qlora = False
use_flash_attention_2 = False
use_better_transformer = False
use_onnx = True

tiktoken_cache_dir = "/home/user/llmops"
os.environ["TIKTOKEN_CACHE_DIR"] = tiktoken_cache_dir
encoding = tiktoken.get_encoding("cl100k_base")


def get_eval_data():
    eval_data = pd.read_csv('eval_data.csv')

    return eval_data


def load_model():
    model = ORTModelForCausalLM.from_pretrained(onnx_model, provider="CUDAExecutionProvider")

    return model


def truncate(text, max_length=1800):
    tokens = tokenizer.tokenize(text)
    truncated_tokens = tokens[:max_length]
    truncated_text = tokenizer.convert_tokens_to_string(truncated_tokens)

    return truncated_text


def generate_prompt(dialogue):
    dialogue = dialogue.replace("Customer:", "- 고객:").replace("CS center:", "- 상담원:")
    dialogue = truncate(dialogue)
    return f"### 상담 내용: \n{dialogue}\n\n ### 요약:"


def get_model():
    model = load_model()

    return model


def get_tokenizer():
    tokenizer = AutoTokenizer.from_pretrained(onnx_model)
    tokenizer.model_max_length = 2048
    return tokenizer


model = get_model()
tokenizer = get_tokenizer()


def predict(inputs):
    answers = []
    for index, row in inputs.iterrows():
        summary = run_summarization(row)
        answers.append(summary)

    return answers


def run_summarization(dialogue):
    device = "cuda"
    prompt = generate_prompt(dialogue)
    inputs = tokenizer(prompt, return_tensors="pt")
    input_ids = inputs.input_ids.to(device)

    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids,
            max_new_tokens=200,
            do_sample=False,
        )
    summary = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    summary = summary.split("### 요약:")[1]
    return summary.strip()


if __name__ == '__main__':
    eval_data = get_eval_data()
    remote_server_uri = "https://example.com"
    mlflow.set_tracking_uri(remote_server_uri)  # set tracking server url
    mlflow.set_experiment("example_summarization")  # set experiment name
    with mlflow.start_run(run_name="llama-2") as run:
        mlflow.log_param("pretrained_model", pretrained_model)
        mlflow.log_param("lora_model", lora_model)
        mlflow.log_param("use_qlora", use_qlora)
        mlflow.log_param("use_fa2", use_flash_attention_2)
        mlflow.log_param("use_bt", use_better_transformer)
        mlflow.log_param("use_onnx", use_onnx)

        results = mlflow.evaluate(
            predict,
            eval_data,
            model_type="text-summarization",
            extra_metrics=[mlflow.metrics.latency()]
        )

  ```

</details>

###  MLFlow로 모델비교하기

#### table

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mlflow-evaluate-llm/01.png?raw=true)

#### compare


![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mlflow-evaluate-llm/02.png?raw=true)


![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mlflow-evaluate-llm/03.png?raw=true)


#### artifact view


![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mlflow-evaluate-llm/04.png?raw=true)


![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mlflow-evaluate-llm/05.png?raw=true)


> [https://mlflow.org/docs/latest/llms/index.html#id2](https://mlflow.org/docs/latest/llms/index.html#id2)<br>[https://mlflow.org/docs/latest/llms/llm-evaluate/index.html](https://mlflow.org/docs/latest/llms/llm-evaluate/index.html)
