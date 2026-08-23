---
layout: post
title: "[Test] pytest에서 mocking 사용하기"
subtitle: "[Test] pytest with mocking"
categories: programming
tags: test
comments: true
---

#### 테스트에 필요한 라이브러리

- pytest
- pytest-cov
  - coverage를 확인하기 위해 추가적으로 필요
- pytest-mock
  - mocking을 사용하기 위해 추가적으로 필요
  - pytest-mock 라이브러리를 설치하면, 별다른 수고없이 바로 mocker를 fixture로 사용할 수 있음

#### 코드

server.py

```python
import uvicorn
import aiohttp
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(docs_url="/swagger")


@app.get("/health_check")
async def health_check():
    return JSONResponse(content=dict(msg="ok"))


async def local_health_check():
    async with aiohttp.ClientSession() as session:
        async with session.get("http://10.0.0.1:8000/health_check") as response:
            result = await response.json()
    return result["msg"]


@app.get("/health_proxy")
async def health_proxy():
    msg = await local_health_check()
    return JSONResponse(content=dict(msg=msg))


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0")
```

mocking_test.py

```python
from fastapi.testclient import TestClient

from server import app


client = TestClient(app)


# every test method must starts with test

def test_health_check():
    response = client.get("/health_check")
    assert response.status_code == 200
    assert response.json() == {"msg": "ok"}


def test_health_proxy():
    # fail (impossible to call health_check)
    response = client.get("/health_proxy")
    assert response.status_code == 200
    assert response.json() == {"msg": "ok"}


def test_health_proxy_with_mocking(mocker):
    mocker.patch("server.local_health_check", return_value="ok with mocking")

    response = client.get("/health_proxy")
    assert response.status_code == 200
    assert response.json() == {"msg": "ok with mocking"}
```

test 실행 방법

```python
# 기본 실행
pytest mocking_test.py

# coverage 확인. --cov에 coverage를 확인하려는 src의 폴더를 지정
pytest --cov=. mocking_test.py
```


#### 정리

- test_health_proxy 함수는 서버가 떠있는 것이 아닌 상태라서, health_check api 호출을 실패하여 테스트에 실패
- server.py의 local_health_check 함수를 mocking하면 test_health_proxy_with_mocking 함수는 성공

#### 참고

[https://sehoi.github.io/etc/fastapi-pytest/](https://sehoi.github.io/etc/fastapi-pytest/)
[https://daco2020.tistory.com/482](https://daco2020.tistory.com/482)
[https://rumbarum.github.io/posts/pytest/pytest-mock/](https://rumbarum.github.io/posts/pytest/pytest-mock/)

#### 강의

[Hands-On Test Driven Development with Python](https://www.udemy.com/course/hands-on-test-driven-development-with-python/?utm_source=adwords&utm_medium=udemyads&utm_campaign=DSA_Catchall_la.EN_cc.ROW&utm_content=deal4584&utm_term=_._ag_88010211481_._ad_535397282061_._kw__._de_c_._dm__._pl__._ti_dsa-841699837183_._li_1009877_._pd__._&matchtype=&gclid=Cj0KCQjwnf-kBhCnARIsAFlg4937_fquSX0FpFOUy7exzFzqp8NOTKPwC3PLmokhtQ4RzmmJZg53hzwaAh3rEALw_wcB)
[https://www.udemy.com/course/backend-api-testing-with-python/](https://www.udemy.com/course/backend-api-testing-with-python/)
