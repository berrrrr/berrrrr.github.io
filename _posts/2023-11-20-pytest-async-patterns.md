---
layout: post
title: "[Test] pytest 비동기 테스트 패턴"
subtitle: "[Test] pytest 비동기 테스트 패턴"
categories: programming
tags: test
comments: true
---

### async fixtures

우선 아래 이벤트루프를 세션단위로 무조건 실행하게 박아둔다

```python
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
```

그럼 아래 db와같은 fixture가 기본 asyncio event loop위에서 돌게되므로 사용할수있게된다

```python
@fixture(scope='session', autouse=True)
async def _db():
    try:
        url = "mysql+aiomysql://~" # DB url
        _engine = create_engine(url=url, pool_size=1, max_overflow=0)
        _session = create_session(engine=_engine)
        _db = {
            'engine': _engine,
            'session': _session,
        }

        yield _db
    finally:
        await _engine.dispose()
```

```python
@fixture
async def _session(_db) -> Session:
    session = _db['session']()
    async with session:
        yield session
        await session.flush()
        await session.rollback()
```

실제 쿼리를 실행할 DB와 session세팅을 위와 같이 해준다.

```python
@pytest.fixture
async def db_setup(_session):
    async with _session as session:
        test_data = Stock(code="A005930", date="2023-07-28", trade_price=1000)
        session.add(test_data)
        await session.commit()
```

단위테스트마다 셋업 후 리셋하고싶다면 아래와 같이 설정하자

```python
@pytest.fixture
async def db_setup(_session):
    async with _session as session:
        test_data = Stock(code="A005930", date="2023-07-28", trade_price=1000)
        session.add(test_data)
        await session.commit()

        yield # test 실행

        await session.delete(test_data)
        await session.commit()
```


[https://tonybaloney.github.io/posts/async-test-patterns-for-pytest-and-unittest.html](https://tonybaloney.github.io/posts/async-test-patterns-for-pytest-and-unittest.html)
[https://stackoverflow.com/questions/49936724/async-fixtures-with-pytest](https://stackoverflow.com/questions/49936724/async-fixtures-with-pytest)

### 여러 transaction 실행하기

[https://github.com/sqlalchemy/sqlalchemy/discussions/9114](https://github.com/sqlalchemy/sqlalchemy/discussions/9114)
테스트를 위해서는
1. 테스트데이터 세팅(insert)
2. 세팅된 테스트데이터를 기반으로 조회 테스트(select)
이런식으로 기본 2개 트랜잭션을 사용한 테스트케이스들이 많은데 자꾸
**sqlalchemy.exc.InvalidRequestError: Can't operate on closed transaction inside context manager. Please complete the context manager before emitting further commands.**
이런 그지같은 에러가 터져서.. fixture로 데이터를 따로세팅해도 안되고 한 test문 안에서 한번에 트랜잭션열고닫고해봐도 안되고.. 찾아보니까 따로 조치를 해줘야했다.
진짜 그지같은데 세션사용시 아래와 같은식으로 뭔가 transaction이 끝난거에대해 체크해서 커넥션 닫고 다시열고? 이런짓을 해야되는거같다

```python
@fixture
async def _session(_db) -> Session:
    session = _db['session']()
    engine = _db['engine']
    async with engine.begin() as connection:
        async with session:
            @event.listens_for(
                session.sync_session, "after_transaction_end"
            )
            def end_savepoint(session, transaction):
                if connection.closed:
                    return

                if not connection.in_nested_transaction():
                    connection.sync_connection.begin_nested()

            yield session
            await session.flush()
            await session.rollback()
```

```python
async def test_success_run_sql(_session, db_setup):
    async with _session:
        query = "SELECT trade_price FROM stock WHERE code = 'A005930' AND date = '2023-07-28'"
        result = await _session.execute(text(query))
        assert result.first()[0] == 1000
```


> [https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html#using-events-with-the-asyncio-extension](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html#using-events-with-the-asyncio-extension)<br>[https://github.com/sqlalchemy/sqlalchemy/discussions/9114](https://github.com/sqlalchemy/sqlalchemy/discussions/9114)
