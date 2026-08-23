---
layout: post
title: "[FastAPI] FastAPI request, response logging"
subtitle: "[FastAPI] FastAPI request, response logging"
categories: programming
tags: python
comments: true
---

> fastapi에서  request, response logging하기위한 가장 major한 2가지 방법 소개


### 1. Middleware 사용

app에 http middleware달면 request가 application으로 들어가기 전과 response가 application에서 나온 후의 처리를 할 수 있음.

```python
from fastapi import FastAPI, APIRouter, Response, Request
from starlette.background import BackgroundTask
from fastapi.routing import APIRoute
from starlette.types import Message
from typing import Dict, Any
import logging

app = FastAPI()
logging.basicConfig(filename='info.log', level=logging.DEBUG)

def log_info(req_body, res_body):
    logging.info(req_body)
    logging.info(res_body)

async def set_body(request: Request, body: bytes):
    async def receive() -> Message:
        return {'type': 'http.request', 'body': body}
    request._receive = receive

@app.middleware('http')
async def some_middleware(request: Request, call_next):
    req_body = await request.body()
    await set_body(request, req_body)  # not needed, if using FastAPI>=0.108.0.
    response = await call_next(request) # 서비스로직 실행

    res_body = b''
    async for chunk in response.body_iterator:
        res_body += chunk

    task = BackgroundTask(log_info, req_body, res_body)
    return Response(content=res_body, status_code=response.status_code,
        headers=dict(response.headers), media_type=response.media_type, background=task)

@app.post('/')
def main(payload: Dict[Any, Any]):
    return payload
```

request.body()가 아니라 request.stream()으로 처리해야하는경우 아래와같이 사용하면 됨

```python
@app.middleware('http')
async def some_middleware(request: Request, call_next):
    req_body = b''
    async for chunk in request.stream():
        req_body += chunk
    ...
```

### 2. APIRoute 사용하기

fastapi route에 직접 정의한 custom route를 사용하게 하면 됨. 이때 custom route 안에 로깅 로직을 집어넣는다.

```python
from fastapi import FastAPI, APIRouter, Response, Request
from starlette.background import BackgroundTask
from starlette.responses import StreamingResponse
from fastapi.routing import APIRoute
from starlette.types import Message
from typing import Callable, Dict, Any
import logging
import httpx


def log_info(req_body, res_body):
    logging.info(req_body)
    logging.info(res_body)


class LoggingRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            req_body = await request.body()
            response = await original_route_handler(request) # 서비스로직 실행

            if isinstance(response, StreamingResponse):
                res_body = b''
                async for item in response.body_iterator:
                    res_body += item

                task = BackgroundTask(log_info, req_body, res_body)
                return Response(content=res_body, status_code=response.status_code,
                        headers=dict(response.headers), media_type=response.media_type, background=task)
            else:
                res_body = response.body
                response.background = BackgroundTask(log_info, req_body, res_body)
                return response

        return custom_route_handler


app = FastAPI()
router = APIRouter(route_class=LoggingRoute)
logging.basicConfig(filename='info.log', level=logging.DEBUG)


@router.post('/')
def main(payload: Dict[Any, Any]):
    return payload


@router.get('/video')
def get_video():
    url = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

    def gen():
        with httpx.stream('GET', url) as r:
            for chunk in r.iter_raw():
                yield chunk

    return StreamingResponse(gen(), media_type='video/mp4')


app.include_router(router)
```

### 3. 실행순서

그렇다면 middleware, router, service코드간 실행 전후관계는 어떻게될까?
둘다 설정하여 테스트해보니 아래와 같다
middleware (call next 전로직) → router(handler 전로직) → service code → router(handler 후로직) → middleware (call next 후로직)


> [https://stackoverflow.com/questions/69670125/how-to-log-raw-http-request-response-in-python-fastapi](https://stackoverflow.com/questions/69670125/how-to-log-raw-http-request-response-in-python-fastapi)<br>이 stackoverflow답변에 너무 잘 나와있었음.
