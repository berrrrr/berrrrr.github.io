---
layout: post
title: "[Python] poetry로 프로젝트 의존성 관리하기"
subtitle: "[Python] poetry로 프로젝트 의존성 관리하기"
categories: programming
tags: python
comments: true
---

> poetry로 프로젝트 의존성/버전관리해보자


### 1. Installation

#### OSX

```bash
brew install poetry
```

#### Linux, Window

```plain text
curl -sSL https://install.python-poetry.org | python3 -
```

### 2. Basic Usage

#### Project Setup

```bash
poetry new poetry-demo
```

기존 프로젝트에 poetry를 셋업한다면?

```bash
cd pre-existing-project
poetry init
```


셋업 후 `pyproject.toml` 이라는 프로젝트 메타데이터 파일이 생성된것을 확인할 수 있다

```toml
[tool.poetry]
name = "streamlit"
version = "0.1.0"
description = ""
authors = ["user <user@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.11"


[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

```


#### Project install

이미 `pyproject.toml` 이 생성되어있는 프로젝트에서 의존성을 설치하려면

```bash
poetry install
```


#### add packages

신규 라이브러리를 추가하고싶다면

```bash
poetry add requests pendulum
```

특정 버전을 명시해주면 더 좋다. (권장..!!)

```bash
# Allow >=2.0.5, <3.0.0 versions
poetry add pendulum@^2.0.5

# Allow >=2.0.5, <2.1.0 versions
poetry add pendulum@~2.0.5

# Allow >=2.0.5 versions, without upper bound
poetry add "pendulum>=2.0.5"

# Allow only 2.0.5 version
poetry add pendulum==2.0.5
```


#### remove package

라이브러리 의존성을 제거하고싶다면

```bash
poetry remove pendulum
```


### 3. Managing dependencies

#### dependency group

그룹별로 의존성을 관리할 수 있는 매우 유용한 기능이다.

```toml
[tool.poetry.group.test]
optional = true

[tool.poetry.group.test.dependencies]
pytest = "^6.0.0"
pytest-mock = "*"
```

가령 위와 같이 optional한 test group을 지정하고,  test group dependencies에 pytest, pytest-mock을 추가했다면

```bash
poetry install --with test
```

이렇게 test환경과 함께 install 하라는 옵션 (`-- with test`) 을 입력해야 pytest, pytest-mock 라이브러리가 정상적으로 설치된다.
반대로, 특정 그룹을 배제하고 설치하고 싶다면

```bash
poetry install --without test
```

`-- without` 옵션을 사용하면 된다.

참고로 ml환경에서는 아래와 같이 cpu환경과 gpu 환경을 나눌때 유용하다

```toml
[tool.poetry.group.cpu]
optional = true

[tool.poetry.group.cpu.dependencies]
onnxruntime = "1.17.1"

[tool.poetry.group.gpu]
optional = true

[tool.poetry.group.gpu.dependencies]
onnxruntime-gpu = "1.17.1"
```

cpu 환경이라면

```toml
poetry install --with cpu
```

gpu 환경이라면

```toml
poetry install --with gpu
```

#### **Adding a dependency to a group**

특정 그룹에 특정 라이브러리를 추가하고싶다면

```bash
poetry add pytest --group test
```

#### **Removing dependencies from a group**

특정 그룹에 특정 라이브러리를 제거하고싶다면

```bash
poetry remove mkdocs --group docs
```


> [https://python-poetry.org/docs/](https://python-poetry.org/docs/)<br>[https://python-poetry.org/docs/cli/](https://python-poetry.org/docs/cli/)
