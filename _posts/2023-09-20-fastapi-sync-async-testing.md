---
layout: post
title: "[Test] 동기/비동기 FastAPI 테스트"
subtitle: "[Test] 동기/비동기 fast api 테스트"
categories: programming
tags: test
comments: true
---

### prerequisite

```bash
% pip install fastapi
% pip install uvicorn
% pip install pytest
% pip install pytest-asyncio
% pip install httpx
```

### server

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

fake_db = {
    "foo": {"id": "foo", "title": "Foo", "description": "There goes my hero"},
    "bar": {"id": "bar", "title": "Bar", "description": "The bartenders"},
}


class Item(BaseModel):
    id: str
    title: str
    description: Optional[str] = None


@app.get("/")
async def root():
    return {"msg": "Hello World"}


@app.get("/items/{item_id}", response_model=Item)
async def read_item(item_id: str):
    return fake_db.get(item_id, None)


@app.post("/items/", response_model=Item)
async def create_item(item: Item):
    if item.id in fake_db:
        raise HTTPException(status_code=400, detail="Item already exists")

    fake_db[item.id] = item
    return item
```

### sync api test

```python
from fastapi.testclient import TestClient

from src.api.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello World"}


def test_read_item():
    response = client.get("/items/foo", params={"item_id": "1"})
    assert response.status_code == 200
    assert response.json() == {
        "id": "foo",
        "title": "Foo",
        "description": "There goes my hero",
    }


def test_create_item():
    response = client.post(
        "/items/",
        json={"id": "foobar", "title": "Foo Bar", "description": "The Foo Barters"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "id": "foobar",
        "title": "Foo Bar",
        "description": "The Foo Barters",
    }
```

### async api test

```python
import json
import pytest

from httpx import AsyncClient

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(base_url="http://10.0.0.1:8000") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        assert response.json() == {"msg": "Hello World"}


@pytest.mark.asyncio
async def test_read_item():
    async with AsyncClient(base_url="http://10.0.0.1:8000") as ac:
        response = await ac.get("/items/foo", params={"item_id": "1"})
        assert response.status_code == 200
        assert response.json() == {
            "id": "foo",
            "title": "Foo",
            "description": "There goes my hero",
        }


@pytest.mark.asyncio
async def test_create_item():
    async with AsyncClient(base_url="http://10.0.0.1:8000") as ac:
        response = await ac.post(
            "/items/",
            content=json.dumps(
                {
                    "id": "foobar",
                    "title": "Foo Bar",
                    "description": "The Foo Barters",
                }
            ),
        )
        assert response.status_code == 200
        assert response.json() == {
            "id": "foobar",
            "title": "Foo Bar",
            "description": "The Foo Barters",
        }
```


매번 `@pytest.mark.asyncio` 데코레이터를 붙여줘도되지만, 간단하게는 `pip install pytest-asyncio` 가 설치되어있다는 전제 하에 `pytest.ini` 파일에 아래와 같이 설정해줘도 된다

```python
[pytest]

asyncio_mode=auto
```


[https://fastapi.tiangolo.com/tutorial/testing/](https://fastapi.tiangolo.com/tutorial/testing/)
[https://fastapi.tiangolo.com/advanced/async-tests/](https://fastapi.tiangolo.com/advanced/async-tests/)
[https://sehoi.github.io/etc/fastapi-pytest/](https://sehoi.github.io/etc/fastapi-pytest/)
