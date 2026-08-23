---
layout: post
title: "[Test] pytest 설정 (pytest.ini, conftest.py)"
subtitle: "[Test] pytest 설정 (pytest.ini, confest.py)"
categories: programming
tags: test
comments: true
---

> pytest에 대한 기본 설정들을 해주는 파일들에 대해 알아보자


### pytest.ini

built-in configuration option중 하나다. 여러가지 파일로 기본 옵션을 설정할수있는거같은데 `pytest.ini`
파일을 사용하는것이 국룰인듯.
파일은 루트디렉토리에 위치해야한다.
파일 포맷은 [여기](https://docs.pytest.org/en/latest/reference/customize.html#config-file-formats)를 참고하면 된다.
이런식으로 생겼다.

```python
[pytest]
env =
    PHASE=test

python_files = tests.py test_*.py *_tests.py
asyncio_mode=auto
```

많이쓰일것같은거 위주로 살펴보면..
`pytest-env` 를 pip install로 설치해주고, `pytest.ini`에  env = 하고 테스트에 기본으로 넣어줄 환경변수를세팅할수있고
`python_files` 을 설정하면 어떤 파일들을 자동으로 테스트할지 지정할수있다. 위 예시로 보자면, test.py 파일,  test_로 시작하는 파일, _test로 끝나는 python 파일들을 자동으로 pytest 테스트 대상에 포함하게된다.
`asyncio_mode` 같은 설정값도 넣어줄수있는데 이녀석은 `pytest-asyncio` 모듈을 pip install로 설치했을경우 일일히 `@pytest.mark.asyncio` 데코레이터를안붙여줘도 자동으로 비동기테스트 설정을 해줄수있다.

> [https://docs.pytest.org/en/latest/reference/reference.html#configuration-options](https://docs.pytest.org/en/latest/reference/reference.html#configuration-options)

### conftest.py

단위테스트가 동작할때 필요한 `given` 에 해당하는 데이터들을 미리 정의해놓은 파일.
pytest는 테스트를 수행하기 전, conftest.py의 내용을 먼저 실행하게된다.
따라서 `setUp` 함수와 비슷하다고 보면 된다.
db(session, engine)처럼 하나의 테스트세션에서 유지되어야하는 녀석들을 정의하면 좋다. 또한 단위테스트에서 몇단계에 걸쳐 fixture를 호출해도 멱등성을 보장한다. (=싱글톤처럼 동작함)

> [https://tech.isyncbrain.com/python/fastapi/sqlalchemy/unittest/2022/06/26/fast-api-db-test.html](https://tech.isyncbrain.com/python/fastapi/sqlalchemy/unittest/2022/06/26/fast-api-db-test.html)

### .coveragerc

이녀석은 `pytest-cov` 의 설정파일로, 리포트 뽑을때 어디까지 커버할지? 등의 설정 내용을 쓸 수 있다

```yaml
[run]
omit =
    */tests/**
```

주로 이런식으로 테스트를 생략할 path를 적는다거나 하는 용도로 사용한다
> [https://coverage.readthedocs.io/en/latest/config.html](https://coverage.readthedocs.io/en/latest/config.html)
