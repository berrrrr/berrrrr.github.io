---
layout: post
title: "[LangGraph] 01. LangGraph 실전 예제"
subtitle: "[LangGraph] 01. LangGraph 실전 예제"
categories: programming
tags: mlops
comments: true
---

> **LangGraph 시리즈**의 글입니다.


## 6.1. LangGraph 개요

### 6.1.1 LangGraph 란?

랭그래프(LangGraph)는 ‘상태값을 가지고 여러 시스템간 상호작용하는 LLM 어플리케이션’ 을 보다 쉽게 개발하기 위한 라이브러리입니다. 여러 에이전트로 구성된 LLM 어플리케이션과 RAG 파이프라인에서 필수적인 순환과 분기를 포함한 워크플로우를 쉽게 구현할 수 있도록 다양한 기능을 지원합니다. 다음의 예시들을 떠올려 봅시다.
- LLM을 사용하여 생성된 답변이 충분한지 혹은 답변을 재생성 할지 결정한다
- LLM을 사용하여 어떤 툴(Tool)을 호출할지 결정한다
위와 같이 순환하는 LLM 파이프라인 안에 여러 분기점이 존재할 수 있고,  이러한 분기점이 많아질수록 구현은 복잡해집니다.
랭그래프는 이러한 구현을 그래프 구조를 통해 쉽게 구현할 수 있게 해주며, 그래프의 다양한 제어방법을 제공함으로써 어플리케이션이 보다 고기능 할 수 있도록 도와줍니다.

### 6.1.2 LangGraph 구성요소

복잡한 요소들을 그래프 구조로 풀기 위해, 랭그래프에서는 그래프의 요소들을 코드로 쉽게 구현할 수 있게 다양한 컴포넌트(Component)들을 지원합니다.

#### 6.1.2.1 그래프

랭그래프에서는 상태(State), 노드(Node), 엣지(Edge)를 사용한 그래프를 통해 다양한 워크플로우를 구현합니다. 기본 알고리즘은 노드가 작업을 완료하면 하나이상의 엣지를 통해 다른 노드에게 메세지(상태)를 보내고, 메세지를 받은 노드는 자신의 기능을 실행한 후 다음 노드로 메세지를 다시 전달하는 과정을 반복하는 방식입니다.
이러한 작업은 구글의 [Pregel](https://langchain-ai.github.io/langgraph/concepts/low_level/#graphs)에서 영감을 받은 슈퍼스텝(super-steps) 으로 진행됩니다. 슈퍼스텝은 그래프 노드에 대한 단일 반복(interation)으로 간주할 수 있습니다. 병렬로 실행되는 노드는 동일한 슈퍼스텝에 속하며, 순차적으로 실행되는 노드는 별도의 슈퍼스텝에 속합니다. 그래프 실행이 시작될 때, 모든 노드는 비활성 상태로 시작합니다. 노드는 하나 이상의 입력 엣지에서 새로운 메시지(상태)를 수신할 때 활성화됩니다. 활성화된 노드는 기능을 실행하고 업데이트된 응답을 보냅니다. 각 슈퍼스텝이 끝날 때, 입력 메시지가 없는 노드는 자신을 비활성화로 표시하여 중단 투표를 합니다. 모든 노드가 비활성화되고 메시지가 전송 중이지 않은 상태가 되면 그래프 실행이 종료됩니다.
랭그래프에서는 두가지 유형의 그래프 클래스를 사용할 수 있습니다.
- StateGraph : 일반적으로 사용하는 그래프 클래스입니다. 유저가 정의하는 상태를 매개변수로 가지고 활용합니다.
- MessageGraph : 오직 메세지 목록만으로 이루어지는 특별한 유형의 그래프 클래스입니다. 주로 챗봇에서 사용됩니다.

#### 6.1.2.2 상태

그래프를 정의할 때 가장 먼저 해야할 일은 그래프의 상태를 정의하는것입니다. 상태은 어플리케이션의 메세지로 사용되는 변수들의 집합입니다. 파이썬의 모든 타입으로 정의가 가능하지만, 대체로 TypedDict 나 Pydantic BaseModel 타입으로 선언합니다. 상태는 그래프 내 모든 노드와 엣지의 입력으로 사용되며 모든 노드는 상태에 업데이트를 수행하게됩니다.

```python
from typing import TypedDict

class State(TypedDict):
    count: int
    messages: list[str]
```

위 예시는 count와 messages를 그래프 내에서 공유하며 업데이트 하는 일반적인 상태 클래스입니다.
처음 노드에서 `{"count": 1, "messages": ["hi"]}` 를 입력하고, 다음 노드에서 `{"count": 2}` 를 입력한다면 상태는 `{"count": 2, "messages": ["hi"]}` 의 형태를 가지게 됩니다. 그 다음 노드에서 `{"messages": ["bye"]}` 를 입력한다면 최종 상태는 `{"count": 2, "messages": ["bye"]}` 의 모양이 됩니다.

```python
from typing import TypedDict, Annotated
from operator import add

class State(TypedDict):
    count: int
    messages: Annotated[list[str], add]
```

리듀서(Reducer) 를 사용한다면 기존 상태에 새로운 업데이트를 결합하여 새로운 상태를 생성하는것도 가능합니다. 위 예시와 같이 `Annotated` 타입으로 리듀서 함수를 정의해준다면 `messages` 변수는 리듀서 함수를 통해 업데이트됩니다.
처음 노드에서 `{"count": 1, "messages": ["hi"]}` 를 입력하고, 다음 노드에서 `{"count": 2}` 를 입력한다면 상태는 `{"count": 2, "messages": ["hi"]}` 의 형태를 가지게 됩니다. 그 다음 노드에서 `{"bar": ["bye"]}` 를 입력한다면 최종 상태는 messages는 operator.add를 실행하게되어 `{"count": 2, "messages": ["hi", "bye"]}` 의 모양이 됩니다.

#### 6.1.2.3 노드

에이전트의 로직을 실행하는 파이썬 함수가 그래프의 노드(Node)가 됩니다. 노드는 상태값을 입력으로 받아 정상적으로 동작하거나 혹은 실패할수도 있습니다. 그 결과로 업데이트된 상태값을 반환합니다. 한마디로, 일을 하는 구성요소입니다.
노드는 첫번째 인자로 상태(State)값을 받으며 두번째 인자로 설정(Config)값을 받습니다. 이렇게 생성한 노드는 `add_node` 메소드를 통해 그래프에 추가할 수 있습니다.

```python
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph

builder = StateGraph(dict)


def my_node(state: dict, config: RunnableConfig):
    print("In node: ", config["configurable"]["user_id"])
    return {"results": f"Hello, {state['input']}!"}

def my_other_node(state: dict):
    return state


builder.add_node("my_node", my_node)
builder.add_node("other_node", my_other_node)
```

**6.1.2.3.1 START 노드**
START 노드는 맨 처음 사용자의 입력을 받아 그래프로 전달하는 특별한 노드입니다. 가장 먼저 어떤 액션을 할지를 결정하게됩니다.

```python
from langgraph.graph import START

graph.add_edge(START, "node_a")
```

**6.1.2.3.2 END 노드 **
END 노드는 종료를 나타내는 특별한 노드입니다. 특정 엣지가 완료된 후 더 이상 수행할 작업이 없을때 사용합니다.

```python
from langgraph.graph import END

graph.add_edge("node_a", END)
```

#### 6.1.2.4 엣지

상태값에 따라 노드가 다음에 어떤 동작을 진행할지 결정하는 파이썬 함수가 그래프의 엣지(Edge)가 됩니다. 엣지는 조건부 분기를 수행하거나, 고정된 동작을 수행할 수 있습니다. 한마디로, 다음에 무엇을 할 지 지시하는 구성요소입니다. 한 노드는 여러개의 엣지를 가질 수 있습니다.
**6.1.2.4.1 일반 엣지**
한 노드에서 다음 노드로 직접 이동합니다.

```python
graph.add_edge("node_a", "node_b")
```

add_edge 메서드를 사용합니다. 노드이름을 입력하여  node_a에서 node_b의 이동을 나타낼 수 있습니다.
**6.1.2.4.2 조건부 엣지**
특정 조건에 특정 노드로 분기하거나 플로우를 종료하는 경우입니다.

```python
graph.add_conditional_edges("node_a", routing_function, {True: "node_b", False: "node_c"})
```

add_conditional_edges 메서드를 사용합니다.  노드 이름과 해당 노드가 실행된 후 호출할 “라우팅 함수”를 입력받습니다. 세번째 인자로 라우팅 함수의 출력값과 해당 출력값에 해당하는 노드의 매핑정보를 제공하여 조건부 분기를 수행합니다.

**6.1.2.4.3 진입지점**
진입 지점(EntryPoint)은 그래프가 시작될 때 처음 실행되는 노드를 명시합니다.

```python
from langgraph.graph import START

graph.add_edge(START, "node_a")
```

가상의 START 노드에서 첫 번째로 실행할 노드로의 엣지를 추가하는 add_edge 메서드를 사용하여 그래프의 진입 지점을 지정할 수 있습니다.
**6.1.2.5.4 조건부 진입지점**
사용자 입력에 따라 처음 호출할 노드를 결정합니다.

```python
from langgraph.graph import START

graph.add_conditional_edges(START, routing_function, {True: "node_b", False: "node_c"})
```

add_conditional_edges 메서드를 사용합니다. 가상의 START 노드와 라우팅 함수를 입력받습니다. 세번째 인자로 라우팅 함수의 출력값과 해당 출력값에 해당하는 노드의 매핑정보를 제공하여 조건부로 진입지점 노드를 선택할 수 있습니다.

## 6.2. LangGraph 활용

이번 장에서는 랭그래프를 사용해 cluade LLM을 사용한 챗봇(Chatbot)시스템을 단계별로 구현해보면서 랭그래프가 지원하는 각 기능들을 실제 어플리케이션에서 어떻게 활용할 수 있을지 알아보겠습니다. 챗봇은 다음과 같은 기능을 포함하게 됩니다.
- 웹 검색을 통해 일반적인 질문에 답변하기
- 여러 호출 간 대화 상태를 유지하기
- 복잡한 질문을 인간에게 라우팅하여 검토하기
- 사용자 정의 상태를 사용하여 챗봇의 동작 제어하기
- 대화를 되감고 대체 대화 경로 탐색하기
먼저, 다음의 환경 설정을 준비해줍니다.
1. 필요 파이썬 패키지 설치

  ```python
%%capture --no-stderr
%pip install -U langgraph

%pip install -U langchain-openai
  ```

2. 오픈AI API Key 설정

  ```python
import getpass
import os


def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")


_set_env("OPENAI_API_KEY")
  ```

3. 기본 StateGraph 생성

  ```python
from typing import Annotated

from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)
  ```

### 6.2.1 루프 구현하기

이제 챗봇 그래프의 기본 루프를  구현해봅시다.
1. 챗봇 노드를 추가합니다.

  ```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo")


def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


graph_builder.add_node("chatbot", chatbot)
  ```

2. 진입지점과 종료지점을 지정해줍니다.

  ```python
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)
  ```

3. `compile()` 함수를 호출하여 실행가능한 그래프를 컴파일해줍니다.

  ```python
graph = graph_builder.compile()
  ```

4. 이제 유저의 입력을 받으며 순환하는 그래프를 실행할 수 있습니다.

  ```python
while True:
    user_input = input("User: ")
    if user_input.lower() in ["quit", "exit", "q"]:
        print("Goodbye!")
        break
    for event in graph.stream({"messages": ("user", user_input)}):
        for value in event.values():
            print("Assistant:", value["messages"][-1].content)
  ```

사용자는 `quit` , `exit`, `q` 를 입력함으로써 루프를 종료할 수 있습니다.
현재까지의 그래프를 시각화해봅시다.

```python
from IPython.display import Image, display

display(Image(graph.get_graph().draw_mermaid_png()))
```

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-01-practical-examples/01.png?raw=true)

다음과 같이 기본적인 질문, 응답이 가능한 챗봇이 구현되었습니다.

```plain text
User:  what's langgraph all about?
Assistant: LangGraph is a new open-source deep learning framework that focuses on enabling efficient training and deployment of large language models. Some key things to know about LangGraph:

1. Efficient Training: LangGraph is designed to accelerate the training of large language models by leveraging advanced optimization techniques and parallelization strategies.

2. Modular Architecture: LangGraph has a modular architecture that allows for easy customization and extension of language models, making it flexible for a variety of NLP tasks.

3. Hardware Acceleration: The framework is optimized for both CPU and GPU hardware, allowing for efficient model deployment on a wide range of devices.

4. Scalability: LangGraph is designed to handle large-scale language models with billions of parameters, enabling the development of state-of-the-art NLP applications.

5. Open-Source: LangGraph is an open-source project, allowing developers and researchers to collaborate, contribute, and build upon the framework.

6. Performance: The goal of LangGraph is to provide superior performance and efficiency compared to existing deep learning frameworks, particularly for training and deploying large language models.

Overall, LangGraph is a promising new deep learning framework that aims to address the challenges of building and deploying advanced natural language processing models at scale. It is an active area of research and development, with the potential to drive further advancements in the field of language AI.
User:  hm that doesn't seem right...
Assistant: I'm sorry, I don't have enough context to determine what doesn't seem right. Could you please provide more details about what you're referring to? That would help me better understand and respond appropriately.
User:  q
Goodbye!
```

### 6.2.2 조건문 구현하기

챗봇이 학습된 데이터만으로 대답할 수 없는 질문들에도 대답할 수 있게 하기 위해 외부검색도구를 활용하도록 챗봇 노드를 변경하겠습니다. 이번 예제에서는 [Tavily Search Engine](https://python.langchain.com/v0.2/docs/integrations/tools/tavily_search/)을 챗봇의 도구로 활용합니다.
1. Travily search engine을 사용하기 위한 패키지를 설치합니다.

  ```python
%%capture --no-stderr
%pip install -U tavily-python
%pip install -U langchain_community
  ```

2. Travily search engine을 사용하기 위한 API KEY를 추가합니다.

  ```python
_set_env("TAVILY_API_KEY")
  ```

3. 도구를 정의합니다.

  ```python
from langchain_community.tools.tavily_search import TavilySearchResults

tool = TavilySearchResults(max_results=2)
tools = [tool]
tool.invoke("What's a 'node' in LangGraph?")
  ```

4. LLM에 할당해줍니다. 이제 LLM은 질문의 유형에 따라 도구를 활용해야하는 경우 도구에 필요한 파라미터들을 응답으로 답해주게 됩니다.

  ```python
llm_with_tools = llm.bind_tools(tools)
  ```


이제 LLM의 응답에 따라 두가지 선택지가 생겼습니다.
- LLM이 도구를 활용해야한다고 판단하고, 도구에 필요한 파라미터를 응답한 경우 도구를 호출해야합니다.
- LLM이 단순 답변을 응답한 경우 사용자에게 응답을 반환하고 종료해야합니다.
6.2.1절에서 이미 LLM의 단순 답변에 대한 노드는 작성하였으므로,  LLM의 응답에 도구에 필요한 파라미터가 있는 경우 도구를 호출하는 노드를 추가하겠습니다.
1. 도구 함수 `tools` 는 정의되어있으므로, 이를 호출하는 도구 노드를 정의합니다

  ```python
import json

from langchain_core.messages import ToolMessage


class BasicToolNode:

    def __init__(self, tools: list) -> None:
        self.tools_by_name = {tool.name: tool for tool in tools}

    def __call__(self, inputs: dict):
        if messages := inputs.get("messages", []):
            message = messages[-1]
        else:
            raise ValueError("No message found in input")
        outputs = []
        for tool_call in message.tool_calls:
            tool_result = self.tools_by_name[tool_call["name"]].invoke(
                tool_call["args"]
            )
            outputs.append(
                ToolMessage(
                    content=json.dumps(tool_result),
                    name=tool_call["name"],
                    tool_call_id=tool_call["id"],
                )
            )
        return {"messages": outputs}


tool_node = BasicToolNode(tools=[tool])
graph_builder.add_node("tools", tool_node)
  ```

2. LLM 응답을 검사하여, `tool_calls` 응답이 있으면 도구노드를, 없다면 종료하도록 하는 조건부 엣지를 정의합니다.

  ```python
from typing import Literal


def route_tools(
    state: State,
) -> Literal["tools", "__end__"]:

    if isinstance(state, list):
        ai_message = state[-1]
    elif messages := state.get("messages", []):
        ai_message = messages[-1]
    else:
        raise ValueError(f"No messages found in input state to tool_edge: {state}")

    if hasattr(ai_message, "tool_calls") and len(ai_message.tool_calls) > 0:
        return "tools"
    return "__end__"


graph_builder.add_conditional_edges(
    "chatbot",
    route_tools,
    {"tools": "tools", "__end__": "__end__"},
)
  ```

3. 도구 노드에서 응답을 받았다면, 이를 기반으로 답변을 생성할수있게 도구 노드와 챗봇 노드를 연결해줍니다.

  ```python
graph_builder.add_edge("tools", "chatbot")
  ```


이제 외부 검색결과를 활용하여 응답할 수 있는 챗봇이 완성되었습니다. 그래프를 컴파일하고 현재의 구성도를 확인해봅시다.

```python
graph = graph_builder.compile()
display(Image(graph.get_graph().draw_mermaid_png()))
```

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-01-practical-examples/02.png?raw=true)

챗봇의 응답에 따라 도구를 호출하거나, 답변을 반환하고 종료하는 그래프가 완성된 것을 확인 할 수 있습니다.

### 6.2.3 스트리밍

랭그래프는 완성된 그래프의 응답을 실시간으로 확인할 수 있도록 여러 모드를 지원합니다.
- values : 이 모드는 그래프의 값을 실시간으로 확인합니다. 각 노드가 호출 된 후, 그래프의 전체 상태를 반환합니다.
- updates : 이 모드는 그래프의 업데이트내용을 실시간으로 합니다. 각 노드가 호출된 후 그래프의 상태에 대한 업데이트를 반환합니다.
다음과 같이, 완성된 그래프를 스트리밍하여 출력값을 확인 할 수 있습니다.

```python
from langchain_core.messages import BaseMessage

while True:
    user_input = input("User: ")
    if user_input.lower() in ["quit", "exit", "q"]:
        print("Goodbye!")
        break
    for event in graph.stream({"messages": [("user", user_input)]}):
        for value in event.values():
            if isinstance(value["messages"][-1], BaseMessage):
                print("Assistant:", value["messages"][-1].content)
```

```plain text

User:  what's langgraph all about?
Assistant: [{'id': 'toolu_01L1TABSBXsHPsebWiMPNqf1', 'input': {'query': 'langgraph'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}]
Assistant: [{"url": "https://langchain-ai.github.io/langgraph/", "content": "LangGraph is framework agnostic (each node is a regular python function). It extends the core Runnable API (shared interface for streaming, async, and batch calls) to make it easy to: Seamless state management across multiple turns of conversation or tool usage. The ability to flexibly route between nodes based on dynamic criteria."}, {"url": "https://blog.langchain.dev/langgraph-multi-agent-workflows/", "content": "As a part of the launch, we highlighted two simple runtimes: one that is the equivalent of the AgentExecutor in langchain, and a second that was a version of that aimed at message passing and chat models.\n It's important to note that these three examples are only a few of the possible examples we could highlight - there are almost assuredly other examples out there and we look forward to seeing what the community comes up with!\n LangGraph: Multi-Agent Workflows\nLinks\nLast week we highlighted LangGraph - a new package (available in both Python and JS) to better enable creation of LLM workflows containing cycles, which are a critical component of most agent runtimes. \"\nAnother key difference between Autogen and LangGraph is that LangGraph is fully integrated into the LangChain ecosystem, meaning you take fully advantage of all the LangChain integrations and LangSmith observability.\n As part of this launch, we're also excited to highlight a few applications built on top of LangGraph that utilize the concept of multiple agents.\n"}]
Assistant: Based on the search results, LangGraph is a framework-agnostic Python and JavaScript library that extends the core Runnable API from the LangChain project to enable the creation of more complex workflows involving multiple agents or components. Some key things about LangGraph:

- It makes it easier to manage state across multiple turns of conversation or tool usage, and to dynamically route between different nodes/components based on criteria.

- It is integrated with the LangChain ecosystem, allowing you to take advantage of LangChain integrations and observability features.

- It enables the creation of multi-agent workflows, where different components or agents can be chained together in more flexible and complex ways than the standard LangChain AgentExecutor.

- The core idea is to provide a more powerful and flexible framework for building LLM-powered applications and workflows, beyond what is possible with just the core LangChain tools.

Overall, LangGraph seems to be a useful addition to the LangChain toolkit, focused on enabling more advanced, multi-agent style applications and workflows powered by large language models.
User:  neat!
Assistant: I'm afraid I don't have enough context to provide a substantive response to "neat!". As an AI assistant, I'm designed to have conversations and provide information to users, but I need more details or a specific question from you in order to give a helpful reply. Could you please rephrase your request or provide some additional context? I'd be happy to assist further once I understand what you're looking for.
User:  what?
Assistant: I'm afraid I don't have enough context to provide a meaningful response to "what?". Could you please rephrase your request or provide more details about what you are asking? I'd be happy to try to assist you further once I have a clearer understanding of your query.
User:  q
Goodbye!
```

### 6.2.4 상태 저장하기

이제 챗봇은 외부 지식에도 대답할 수 있게 되었지만, 이전 질문답의 맥락은 기억하지 못하기때문에 멀티 턴 대화를 진행하기에는 한계가 있습니다.
랭그래프에서는 메모리나 DB와 같이 지속적으로 데이터를 저장할 수 있는 곳에 상태를 저장함으로써 이 문제를 해결합니다. 그래프를 컴파일할때 데이터를 저장할 체크포인터(check pointer)를 지정하고 호출할때 `thread_id` 를 제공하면 그래프든 언제든 해당 호출 데이터를 `thread_id` 를 통해 복원할 수 있습니다.
지금은 가장 간단한 형태인 메모리에 데이터를 저장하는 `MemorySaver` 를 사용하여 상태를 저장해보겠습니다.

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
```

그래프를 컴파일 할 때 아래와 같이 체크포인터(checkpointer)만 지정해주면, 이제 상태를 저장할 수 있는 그래프가 되었습니다.

```python
graph = graph_builder.compile(checkpointer=memory)
```

이제 상태를 저장해서 맥락을 기억할 수 있는 챗봇과 상호작용을 해봅시다. 대화의 key로 사용될 thread id를 다음과 같이 지정해줍니다.

```python
config = {"configurable": {"thread_id": "1"}}
```

챗봇에게 첫번째 대화를 건네면서 이름을 알려줍니다.

```python
user_input = "Hi there! My name is Will."

events = graph.stream(
    {"messages": [("user", user_input)]}, config, stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()
```

```plain text

================================ Human Message =================================
Remember my name?
================================== Ai Message ==================================
Of course, your name is Will. It's nice to meet you again!
```

다음, 나의 이름을 기억하는지 두번째 질문을 던져봅니다.

```python
user_input = "Remember my name?"

events = graph.stream(
    {"messages": [("user", user_input)]}, config, stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()
```

```plain text

================================ Human Message =================================
Remember my name?
================================== Ai Message ==================================
Of course, your name is Will. It's nice to meet you again!
```

메모리에 대화 맥락(context)를 저장하고있기 때문에, 여러 턴에 걸친 대화에도 과거의 문답을 활용하여 답변을 생성합니다.
단, 해당 내용은 thread_id = 1 에 저장되어 있기 때문에 다음과 같이 thread_id를 변경하면 챗봇은 thread_id = 1 에서 했던 대화의 내용은 기억하지 못합니다.

```python
events = graph.stream(
    {"messages": [("user", user_input)]},
    {"configurable": {"thread_id": "2"}},
    stream_mode="values",
)
for event in events:
    event["messages"][-1].pretty_print()
```

```plain text

================================ Human Message =================================
Remember my name?
================================== Ai Message ==================================
I'm afraid I don't actually have the capability to remember your name. As an AI assistant, I don't have a persistent memory of our previous conversations or interactions. I respond based on the current context provided to me. Could you please restate your name or provide more information so I can try to assist you?
```

체크포인트에 어떤 정보들이 저장되어있는지 궁금하다면 아래의 코드를 통해 확인할 수 있습니다.

```python
snapshot = graph.get_state(config)
print(snapshot)
```

### 6.2.5 루프 개입하기

때때로 에이전트(Agent)의 행동을 신뢰 할 수 없어, 작업을 성공적으로 수행하기 위해 인간의 입력이 필요할 수 있습니다. 가령 에이전트가 계획한 다음 작업을 직접 확인하고 승인하거나, 그래프의 흐름을 수정하기 위해 실행을 수동으로 중단하는 등의 작업이 필요할 수 있습니다.
이러한 루프 중 사람의 개입 (human-in-the-loop)기능을 사용하고자 한다면 그래프 컴파일에 하나의 옵션만 추가해주면 됩니다.

```python
graph = graph_builder.compile(
    checkpointer=memory,
    interrupt_before=["tools"],
)
```

위와 같이 선언해줬다면, 도구 노드를 호출하기 전에 흐름이 멈추게 됩니다.

```python
snapshot = graph.get_state(config)
print(snapshot.next)
```

그래프 스냅샷의 다음단계가 tools 메소드임을 확인할 수 있습니다. 이제 상태의 변경이 필요하다면 마음껏 업데이트 할 수 있게 되었습니다. 가령, 다음 단계에 도구 사용이 예정되어있지만 도구를 사용하지 않고 지정된 응답이 나가도록 강제해보겠습니다.

```python
from langchain_core.messages import AIMessage

existing_message = snapshot.values["messages"][-1]
existing_message.tool_calls

answer = (
    "LangGraph is a library for building stateful, multi-actor applications with LLMs."
)
new_messages = [
    ToolMessage(content=answer, tool_call_id=existing_message.tool_calls[0]["id"]),
    AIMessage(content=answer),
]

new_messages[-1].pretty_print()
graph.update_state(
    config,
    {"messages": new_messages},
)
```

그래프의 상태(즉, messages)가 다음과 같이 업데이트되었음을 확인할 수 있습니다.

```python
print("\n\nLast 2 messages;")
print(graph.get_state(config).values["messages"][-2:])
```

```plain text
================================== Ai Message ==================================
LangGraph is a library for building stateful, multi-actor applications with LLMs.

Last 2 messages;
[ToolMessage(content='LangGraph is a library for building stateful, multi-actor applications with LLMs.', id='14589ef1-15db-4a75-82a6-d57c40a216d0', tool_call_id='toolu_01DTyDpJ1kKdNps5yxv3AGJd'), AIMessage(content='LangGraph is a library for building stateful, multi-actor applications with LLMs.', id='1c657bfb-7690-44c7-a26d-d0d22453013d')]
```

만약 새로운 메세지를 추가하는게 아닌, 기존 메세지를 수정하고싶다면 다음과 같이 존재하는 메세지의 id 값을 가진 새로운 메세지 객체를 만들어 `update_state` 메서드를 호출해주면 됩니다.

```python
from langchain_core.messages import AIMessage

snapshot = graph.get_state(config)
existing_message = snapshot.values["messages"][-1]
new_tool_call = existing_message.tool_calls[0].copy()
new_tool_call["args"]["query"] = "LangGraph human-in-the-loop workflow"
new_message = AIMessage(
    content=existing_message.content,
    tool_calls=[new_tool_call],
    id=existing_message.id, # 이부분을 반드시 정의해줍니다.
)

graph.update_state(config, {"messages": [new_message]})
```

랭그래프에서 지원하는 이러한 루프 개입하기 기능을 활용하여, 다음과 같은 유용한 작업들을 할 수 있습니다.
- 현재 상태 편집하기
- 과거 기록 탐색하기
- 과거 상태 수정하기
- 특정 시점의 상태에 메세지 추가하기

## 6.3. LangGraph 실습

### 6.3.1 환경설정 및 세팅

필요한 라이브러리를 설치합니다

```python
! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain langgraph tavily-python
```

여기서는 ChatGPT API를 사용하겠습니다. 이를 위한 OPEN AI API KEY를 준비합니다.

```python
import os

os.environ["OPENAI_API_KEY"] = ""
```

외부 도메인 지식을 활용하는 경우에는 Tavily Search를 이용합니다. 이를 위한 TAVILY API KEY를 준비합니다.

```python
os.environ["TAVILY_API_KEY"] = ""
```

### 6.3.2 \[실습\] Corrective-RAG

RAG의 답변 결과는 검색된 문서가 사용자의 질문과 얼마나 관련있는지에 따라 크게 달라집니다. 즉, 잘못된 문서가 검색되었을경우 답변의 품질이 매우 낮아지게 됩니다.
이를 보완하기위해 사용자의 질문과 검색된 문서의 연관도를 평가하여 연관도가 충분히 높지 않다면 질문을 재작성하여 다시 문서 검색을 수행한 뒤 답변을 생성하는 방식이 바로 Corrective-RAG 입니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-01-practical-examples/03.png?raw=true)

이번 실습에서는 Corrective-RAG를 다음과 같은 단계에 따라 구현해보겠습니다.
1. 사용자에게 질문을 입력받고, 관련된 문서를 검색합니다.
2. 해당 문서가 사용자의 질문과 얼마나 관련있는지 평가합니다
3. 검색된 문서가 질문과 관련이 크게 없다고 판단되면, 웹 검색을 통해 검색을 보완합니다
4. 웹 검색을 진행하기 전에 검색에 맞는 형태로 쿼리를 변형합니다.

#### 6.3.2.1 문서 인덱싱

우선 사용자의 질문을 받기 전에, 검색될 문서들을 목록화하는 작업을 먼저 진행합니다.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
]

docs = [WebBaseLoader(url).load() for url in urls]
docs_list = [item for sublist in docs for item in sublist]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=250, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs_list)

# Add to vectorDB
vectorstore = Chroma.from_documents(
    documents=doc_splits,
    collection_name="rag-chroma",
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()
```

블로그 글 3개를 크롤(Crawl)하여 벡터DB인 크로마(Chroma)에 임베딩하여 저장하였습니다.
앞으로 사용자의 질문이 입력되면, 크로마에 저장된 문서들을 검색하여 가장 질문과 유사하다고 판단된 문서를 검색해 활용하게 됩니다.

#### 6.3.2.2 문서 평가하기

벡터DB에서 검색된 문서가 사용자의 질문과 연관되어있는지 평가하는 노드에서 사용될 메소드를 작성해보겠습ㄴ다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class GradeDocuments(BaseModel):
    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm_grader = llm.with_structured_output(GradeDocuments)

system = """You are a grader assessing relevance of a retrieved document to a user question. \n
    If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)

retrieval_grader = grade_prompt | structured_llm_grader
question = "agent memory"
docs = retriever.get_relevant_documents(question)
doc_txt = docs[1].page_content
print(retrieval_grader.invoke({"question": question, "document": doc_txt}))
```

LLM은 해당 문서가 질문과 연관이 있는는지 예 / 아니오로 대답하게 됩니다.

#### 6.3.2.3 답변 생성하기

검색된 문서가 적절하다면 해당 문서를 맥락으로 활용해 사용자에게 응답할 답변을 생성해야합니다.

```python
from langchain import hub
from langchain_core.output_parsers import StrOutputParser

prompt = hub.pull("rlm/rag-prompt")

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = prompt | llm | StrOutputParser()

generation = rag_chain.invoke({"context": docs, "question": question})
print(generation)
```


#### 6.3.2.4 질문 재작성하기

검색된 문서가 적절하지 않다면 웹 검색을 진행해야합니다. 사용자의 질문을 웹 검색에 적합한 질문으로 변환하는 함수를 작성해보겠습니다.

```python

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)

system = """You a question re-writer that converts an input question to a better version that is optimized \n
     for web search. Look at the input and try to reason about the underlying semantic intent / meaning."""
re_write_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        (
            "human",
            "Here is the initial question: \n\n {question} \n Formulate an improved question.",
        ),
    ]
)

question_rewriter = re_write_prompt | llm | StrOutputParser()
question_rewriter.invoke({"question": question})
```


#### 6.3.2.5 웹 검색하기

```python
from langchain_community.tools.tavily_search import TavilySearchResults

web_search_tool = TavilySearchResults(k=3)
```

웹 검색은 `TavilySearchResults` 로 수행하겠습니다.

#### 6.3.2.6 상태

그래프를 작성하기에 앞서, 그래프에서 사용될 상태값들을 살펴보겠습니다.

```python
from typing import List

from typing_extensions import TypedDict


class GraphState(TypedDict):
    question: str
    generation: str
    web_search: str
    documents: List[str]
```

- question : 사용자의 질문, 혹은 웹 검색을 위해 재작성된 질문
- generation : LLM이 생성한 답변
- web_search : 웹 검색 결과
- documents : 검색된 문서

#### 6.3.2.7 그래프

이제 노드와 엣지를 통해 Corrective-RAG 를 기능하는 그래프를 완성해보겠습니다.

```python
from langchain.schema import Document


def retrieve(state):
    """
    Retrieve documents

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    print("---RETRIEVE---")
    question = state["question"]

    # Retrieval
    documents = retriever.get_relevant_documents(question)
    return {"documents": documents, "question": question}


def generate(state):
    """
    Generate answer

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation, that contains LLM generation
    """
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    # RAG generation
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"documents": documents, "question": question, "generation": generation}


def grade_documents(state):
    """
    Determines whether the retrieved documents are relevant to the question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with only filtered relevant documents
    """

    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]

    # Score each doc
    filtered_docs = []
    web_search = "No"
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.binary_score
        if grade == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            filtered_docs.append(d)
        else:
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            web_search = "Yes"
            continue
    return {"documents": filtered_docs, "question": question, "web_search": web_search}


def transform_query(state):
    """
    Transform the query to produce a better question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates question key with a re-phrased question
    """

    print("---TRANSFORM QUERY---")
    question = state["question"]
    documents = state["documents"]

    # Re-write question
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}


def web_search(state):
    """
    Web search based on the re-phrased question.

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): Updates documents key with appended web results
    """

    print("---WEB SEARCH---")
    question = state["question"]
    documents = state["documents"]

    # Web search
    docs = web_search_tool.invoke({"query": question})
    web_results = "\n".join([d["content"] for d in docs])
    web_results = Document(page_content=web_results)
    documents.append(web_results)

    return {"documents": documents, "question": question}
```

```python
def decide_to_generate(state):
    """
    Determines whether to generate an answer, or re-generate a question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """

    print("---ASSESS GRADED DOCUMENTS---")
    state["question"]
    web_search = state["web_search"]
    state["documents"]

    if web_search == "Yes":
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "transform_query"
    else:
        # We have relevant documents, so generate answer
        print("---DECISION: GENERATE---")
        return "generate"
```

```python
from langgraph.graph import END, StateGraph, START

workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", grade_documents)  # grade documents
workflow.add_node("generate", generate)  # generatae
workflow.add_node("transform_query", transform_query)  # transform_query
workflow.add_node("web_search_node", web_search)  # web search

# Build graph
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
workflow.add_edge("transform_query", "web_search_node")
workflow.add_edge("web_search_node", "generate")
workflow.add_edge("generate", END)

# Compile
app = workflow.compile()
```

이제 완성된 흐름이 잘 동작하는지 질문해보겠습니다.

```python
from pprint import pprint

# Run
inputs = {"question": "What are the types of agent memory?"}
for output in app.stream(inputs):
    for key, value in output.items():
        # Node
        pprint(f"Node '{key}':")
        # Optional: print full state at each node
        # pprint.pprint(value["keys"], indent=2, width=80, depth=None)
    pprint("\n---\n")

# Final generation
pprint(value["generation"])
```

```python

---RETRIEVE---
"Node 'retrieve':"
'\n---\n'
---CHECK DOCUMENT RELEVANCE TO QUESTION---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
"Node 'grade_documents':"
'\n---\n'
---ASSESS GRADED DOCUMENTS---
---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---
---TRANSFORM QUERY---
"Node 'transform_query':"
'\n---\n'
---WEB SEARCH---
"Node 'web_search_node':"
'\n---\n'
---GENERATE---
"Node 'generate':"
'\n---\n'
"Node '__end__':"
'\n---\n'
('Agents possess short-term memory, which is utilized for in-context learning, '
 'and long-term memory, allowing them to retain and recall vast amounts of '
 'information over extended periods. Some experts also classify working memory '
 'as a distinct type, although it can be considered a part of short-term '
 'memory in many cases.')
```

```python
from pprint import pprint

# Run
inputs = {"question": "How does the AlphaCodium paper work?"}
for output in app.stream(inputs):
    for key, value in output.items():
        # Node
        pprint(f"Node '{key}':")
        # Optional: print full state at each node
        # pprint.pprint(value["keys"], indent=2, width=80, depth=None)
    pprint("\n---\n")

# Final generation
pprint(value["generation"])
```

```python
---RETRIEVE---
"Node 'retrieve':"
'\n---\n'
---CHECK DOCUMENT RELEVANCE TO QUESTION---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
"Node 'grade_documents':"
'\n---\n'
---ASSESS GRADED DOCUMENTS---
---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---
---TRANSFORM QUERY---
"Node 'transform_query':"
'\n---\n'
---WEB SEARCH---
"Node 'web_search_node':"
'\n---\n'
---GENERATE---
"Node 'generate':"
'\n---\n'
"Node '__end__':"
'\n---\n'
('The AlphaCodium paper functions by proposing a code-oriented iterative flow '
 'that involves repeatedly running and fixing generated code against '
 'input-output tests. Its key mechanisms include generating additional data '
 'like problem reflection and test reasoning to aid the iterative process, as '
 'well as enriching the code generation process. AlphaCodium aims to improve '
 'the performance of Large Language Models on code problems by following a '
 'test-based, multi-stage approach.')
```

### 6.3.2 \[실습\] 코드 어시스턴트 챗봇

코파일럿과 같이 개발을 도와주는 어플리케이션들이 많이 등장하고 있습니다. 이번 실습에서는 코파일럿과 유사한 LLM을 활용하여 코드를 생성해주는 챗봇을 다음과 같은 단계를 거쳐 구현해보겠습니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-01-practical-examples/04.png?raw=true)

1. 사용자가 질문과 코드 맥락을 함께 제공합니다
2. 코드 맥락을 분석하고, 이를 바탕으로 질문에 대한 답변을 생성합니다.
3. 구조화된 출력을 생성하기 위해 도구를 호출합니다.
4. 사용자에게 최종 답변을 반환하기 전에 두가지 단위테스트 (임포트 및 코드 실행)를 수행합니다

#### 6.3.2.1 코드 생성

가장먼저, 사용자의 요청에 따라 코드를 생성해주는 함수를 작성합니다. 이 함수는 코드 생성 노드에서 사용됩니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

code_gen_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a coding assistant with expertise in LCEL, LangChain expression language. \n
    Here is a full set of LCEL documentation:  \n ------- \n  {context} \n ------- \n Answer the user
    question based on the above provided documentation. Ensure any code you provide can be executed \n
    with all required imports and variables defined. Structure your answer with a description of the code solution. \n
    Then list the imports. And finally list the functioning code block. Here is the user question:""",
        ),
        ("placeholder", "{messages}"),
    ]
)


class code(BaseModel):
    prefix: str = Field(description="Description of the problem and approach")
    imports: str = Field(description="Code block import statements")
    code: str = Field(description="Code block not including import statements")
    description = "Schema for code solutions to questions about LCEL."


expt_llm = "gpt-4-0125-preview"
llm = ChatOpenAI(temperature=0, model=expt_llm)
code_gen_chain = code_gen_prompt | llm.with_structured_output(code)
question = "How do I build a RAG chain in LCEL?"
solution = code_gen_chain_oai.invoke({"context":concatenated_content,"messages":[("user",question)]
```

#### 6.3.2.2 상태

그래프에서 사용될 상태를 정의하겠습니다. 코드 어시스턴트 챗봇에서는 다음과 같은 상태값들을 사용합니다.

```python
from typing import List, TypedDict


class GraphState(TypedDict):
    error: str
    messages: List
    generation: str
    iterations: int
```

- error : 테스트 오류가 발생했는지 여부
- messages : 사용자의 질문, 오류메세지, 이유를 포함한 메세지들
- generation : 생성된 코드
- iterations : 시도 횟수

#### 6.3.2.3 그래프


이제 노드와 엣지들을 통해 유저의 질문에 따라 코드를 생성하고, 자동으로 테스트로 검증까지 진행하는 챗봇의 흐름을 구현해보도록 하겠습니다.

```python
from langchain_core.pydantic_v1 import BaseModel, Field

max_iterations = 3
flag = "do not reflect"


def generate(state: GraphState):
    """
    Generate a code solution

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation
    """

    print("---GENERATING CODE SOLUTION---")

    # State
    messages = state["messages"]
    iterations = state["iterations"]
    error = state["error"]

    # We have been routed back to generation with an error
    if error == "yes":
        messages += [
            (
                "user",
                "Now, try again. Invoke the code tool to structure the output with a prefix, imports, and code block:",
            )
        ]

    # Solution
    code_solution = code_gen_chain.invoke(
        {"context": concatenated_content, "messages": messages}
    )
    messages += [
        (
            "assistant",
            f"{code_solution.prefix} \n Imports: {code_solution.imports} \n Code: {code_solution.code}",
        )
    ]

    # Increment
    iterations = iterations + 1
    return {"generation": code_solution, "messages": messages, "iterations": iterations}


def code_check(state: GraphState):
    """
    Check code

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, error
    """

    print("---CHECKING CODE---")

    # State
    messages = state["messages"]
    code_solution = state["generation"]
    iterations = state["iterations"]

    # Get solution components
    imports = code_solution.imports
    code = code_solution.code

    # Check imports
    try:
        exec(imports)
    except Exception as e:
        print("---CODE IMPORT CHECK: FAILED---")
        error_message = [("user", f"Your solution failed the import test: {e}")]
        messages += error_message
        return {
            "generation": code_solution,
            "messages": messages,
            "iterations": iterations,
            "error": "yes",
        }

    # Check execution
    try:
        exec(imports + "\n" + code)
    except Exception as e:
        print("---CODE BLOCK CHECK: FAILED---")
        error_message = [("user", f"Your solution failed the code execution test: {e}")]
        messages += error_message
        return {
            "generation": code_solution,
            "messages": messages,
            "iterations": iterations,
            "error": "yes",
        }

    # No errors
    print("---NO CODE TEST FAILURES---")
    return {
        "generation": code_solution,
        "messages": messages,
        "iterations": iterations,
        "error": "no",
    }


def reflect(state: GraphState):
    """
    Reflect on errors

    Args:
        state (dict): The current graph state

    Returns:
        state (dict): New key added to state, generation
    """

    print("---GENERATING CODE SOLUTION---")

    # State
    messages = state["messages"]
    iterations = state["iterations"]
    code_solution = state["generation"]

    # Prompt reflection

    # Add reflection
    reflections = code_gen_chain.invoke(
        {"context": concatenated_content, "messages": messages}
    )
    messages += [("assistant", f"Here are reflections on the error: {reflections}")]
    return {"generation": code_solution, "messages": messages, "iterations": iterations}


```

```python
def decide_to_finish(state: GraphState):
    """
    Determines whether to finish.

    Args:
        state (dict): The current graph state

    Returns:
        str: Next node to call
    """
    error = state["error"]
    iterations = state["iterations"]

    if error == "no" or iterations == max_iterations:
        print("---DECISION: FINISH---")
        return "end"
    else:
        print("---DECISION: RE-TRY SOLUTION---")
        if flag == "reflect":
            return "reflect"
        else:
            return "generate"
```

```python
from langgraph.graph import END, StateGraph, START

workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("generate", generate)  # generation solution
workflow.add_node("check_code", code_check)  # check code
workflow.add_node("reflect", reflect)  # reflect

# Build graph
workflow.add_edge(START, "generate")
workflow.add_edge("generate", "check_code")
workflow.add_conditional_edges(
    "check_code",
    decide_to_finish,
    {
        "end": END,
        "reflect": "reflect",
        "generate": "generate",
    },
)
workflow.add_edge("reflect", "generate")
app = workflow.compile()
```

이제 완성된 그래프에 질문을 넣어 보겠습니다.

```python
question = "How can I directly pass a string to a runnable and use it to construct the input needed for my prompt?"
app.invoke({"messages": [("user", question)], "iterations": 0})
```

```python
실행결과
```

### 6.3.3 \[실습\] Self-RAG

RAG를 위해 검색된 문서는 일정한 크기로 청킹된 문서이기 때문에, 필요이상의 정보가 포함되어있거나 꼭 필요한 정보가 제외된 문서일 수 있습니다. 이럴경우 부정확한 문서를 기반으로 생성된 답변의 정확도가 상당히 떨어질 가능성이 있습니다.
이를 보완하기 위해 검색된 문서와 생성된 응답의 관련성 평가를 진행하고, 생성된 답변과 생성된 질문의 연관도 평가를 진행하여 평가를 통과하지 못하면 재검색 및 재생성을 실행하는 방식을 Self-RAG 라고 합니다.

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-01-practical-examples/05.png?raw=true)

위 그래프의 각 노드들을 하나씩 구현해보겠습니다.

#### 6.3.3.1 검색하기

가장 첫 노드인 검색기(Retriever)를 구현하겠습니다. langchain document loader의 WebBaseLoader를 사용하여 블로그 문서를 인덱싱하여 벡터DB에 저장하겠습니다. 이때 벡터DB는 간단히 사용할 수 있는 Chroma를 사용합니다

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
]

docs = [WebBaseLoader(url).load() for url in urls]
docs_list = [item for sublist in docs for item in sublist]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=250, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs_list)

# Add to vectorDB
vectorstore = Chroma.from_documents(
    documents=doc_splits,
    collection_name="rag-chroma",
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()
```

앞으로 들어오는 질문들을 답변하기 위해 벡터DB에 저장된 데이터들을 검색한 뒤 답변의 맥락으로 활용하게됩니다.

#### 6.3.3.2 평가하기

평가노드는 총 3개가 존재하게 됩니다.
- 유저의 질문과 검색된 문서와의 연관성 평가
- 생성된 답변의 할루시네이션(Hallucination) 여부 평가
- 생성된 답변이 유저의 질문에 대한 적절한 답변인지 여부 평가
평가는 LLM을 통해 진행됩니다. 각 노드에서 사용될 평가 함수들을 작성해보겠습니다.
1. 유저의 질문과 검색된 문서와의 연관성 평가

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

class GradeDocuments(BaseModel):
    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm_grader = llm.with_structured_output(GradeDocuments)

system = """You are a grader assessing relevance of a retrieved document to a user question. \n
    It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
    If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n
    Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""
grade_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)

retrieval_grader = grade_prompt | structured_llm_grader
question = "agent memory"
docs = retriever.get_relevant_documents(question)
doc_txt = docs[1].page_content
print(retrieval_grader.invoke({"question": question, "document": doc_txt}))
```

1. 생성된 답변의 할루시네이션(Hallucination) 여부 평가

```python
class GradeHallucinations(BaseModel):
    """Binary score for hallucination present in generation answer."""

    binary_score: str = Field(
        description="Answer is grounded in the facts, 'yes' or 'no'"
    )

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm_grader = llm.with_structured_output(GradeHallucinations)

system = """You are a grader assessing whether an LLM generation is grounded in / supported by a set of retrieved facts. \n
     Give a binary score 'yes' or 'no'. 'Yes' means that the answer is grounded in / supported by the set of facts."""
hallucination_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"),
    ]
)

hallucination_grader = hallucination_prompt | structured_llm_grader
hallucination_grader.invoke({"documents": docs, "generation": generation})
```

1. 생성된 답변이 유저의 질문에 대한 적절한 답변인지 여부 평가

```python
class GradeAnswer(BaseModel):
    """Binary score to assess answer addresses question."""

    binary_score: str = Field(
        description="Answer addresses the question, 'yes' or 'no'"
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm_grader = llm.with_structured_output(GradeAnswer)

system = """You are a grader assessing whether an answer addresses / resolves a question \n
     Give a binary score 'yes' or 'no'. Yes' means that the answer resolves the question."""
answer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "User question: \n\n {question} \n\n LLM generation: {generation}"),
    ]
)

answer_grader = answer_prompt | structured_llm_grader
answer_grader.invoke({"question": question, "generation": generation})
```

#### 6.3.3.3 답변 생성하기

질문에 적절히 연관된 문서를 검색했다면, LLM을 이용해 답변을 생성 할 차례입니다.

```python
from langchain import hub
from langchain_core.output_parsers import StrOutputParser

prompt = hub.pull("rlm/rag-prompt")

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


rag_chain = prompt | llm | StrOutputParser()

generation = rag_chain.invoke({"context": docs, "question": question})
print(generation)
```

#### 6.3.3.4 질문 재생성하기

최종 생성된 답변이 유저의 질문에 대한 적절한 답변이 아니라면, 질문을 재작성해야합니다. 6.3.2 Corrective RAG에서 실습했던 내용을 활용하게됩니다.

```python

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)

system = """You a question re-writer that converts an input question to a better version that is optimized \n
     for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning."""
re_write_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        (
            "human",
            "Here is the initial question: \n\n {question} \n Formulate an improved question.",
        ),
    ]
)

question_rewriter = re_write_prompt | llm | StrOutputParser()
question_rewriter.invoke({"question": question})
```

#### 6.3.3.5 그래프

각 메소드가 구현되었으니, 이제 상태와 노드와 엣지를 통해 그래프를 완성해보겠습니다.

```python
from typing import List

from typing_extensions import TypedDict


class GraphState(TypedDict):

    question: str
    generation: str
    documents: List[str]
```

Self-RAG에서 사용할 그래프의 상태는 아래와 같은 값을 가집니다.
- question : 사용자의 질문
- generation : LLM이 생성한 문장
- documents: LLM에게 문맥으로 제공할 문서

```python
def retrieve(state):
    print("---RETRIEVE---")
    question = state["question"]

    # Retrieval
    documents = retriever.get_relevant_documents(question)
    return {"documents": documents, "question": question}


def generate(state):
    print("---GENERATE---")
    question = state["question"]
    documents = state["documents"]

    # RAG generation
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"documents": documents, "question": question, "generation": generation}


def grade_documents(state):
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]

    # Score each doc
    filtered_docs = []
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.binary_score
        if grade == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            filtered_docs.append(d)
        else:
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            continue
    return {"documents": filtered_docs, "question": question}


def transform_query(state):
    print("---TRANSFORM QUERY---")
    question = state["question"]
    documents = state["documents"]

    # Re-write question
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}
```

```python
def decide_to_generate(state):
    """
    Determines whether to generate an answer, or re-generate a question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Binary decision for next node to call
    """

    print("---ASSESS GRADED DOCUMENTS---")
    state["question"]
    filtered_documents = state["documents"]

    if not filtered_documents:
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "transform_query"
    else:
        # We have relevant documents, so generate answer
        print("---DECISION: GENERATE---")
        return "generate"


def grade_generation_v_documents_and_question(state):
    """
    Determines whether the generation is grounded in the document and answers question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Decision for next node to call
    """

    print("---CHECK HALLUCINATIONS---")
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = hallucination_grader.invoke(
        {"documents": documents, "generation": generation}
    )
    grade = score.binary_score

    # Check hallucination
    if grade == "yes":
        print("---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---")
        # Check question-answering
        print("---GRADE GENERATION vs QUESTION---")
        score = answer_grader.invoke({"question": question, "generation": generation})
        grade = score.binary_score
        if grade == "yes":
            print("---DECISION: GENERATION ADDRESSES QUESTION---")
            return "useful"
        else:
            print("---DECISION: GENERATION DOES NOT ADDRESS QUESTION---")
            return "not useful"
    else:
        pprint("---DECISION: GENERATION IS NOT GROUNDED IN DOCUMENTS, RE-TRY---")
        return "not supported"
```

이제 완성된 노드와 엣지들을 연결하여 그래프를 빌드해보겠습니다.

```python
from langgraph.graph import END, StateGraph, START

workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", grade_documents)  # grade documents
workflow.add_node("generate", generate)  # generatae
workflow.add_node("transform_query", transform_query)  # transform_query

# Build graph
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "transform_query": "transform_query",
        "generate": "generate",
    },
)
workflow.add_edge("transform_query", "retrieve")
workflow.add_conditional_edges(
    "generate",
    grade_generation_v_documents_and_question,
    {
        "not supported": "generate",
        "useful": END,
        "not useful": "transform_query",
    },
)

# Compile
app = workflow.compile()
```

이제 완성된 Self-RAG 파이프라인에 질문을 남겨보겠습니다.

```python
from pprint import pprint

# Run
inputs = {"question": "Explain how the different types of agent memory work?"}
for output in app.stream(inputs):
    for key, value in output.items():
        # Node
        pprint(f"Node '{key}':")
    pprint("\n---\n")

# Final generation
pprint(value["generation"])
```

```python
---RETRIEVE---
"Node 'retrieve':"
'\n---\n'
---CHECK DOCUMENT RELEVANCE TO QUESTION---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
---ASSESS GRADED DOCUMENTS---
---DECISION: GENERATE---
"Node 'grade_documents':"
'\n---\n'
---GENERATE---
---CHECK HALLUCINATIONS---
---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---
---GRADE GENERATION vs QUESTION---
---DECISION: GENERATION ADDRESSES QUESTION---
"Node 'generate':"
'\n---\n'
('Short-term memory is used for in-context learning in agents, allowing them '
 'to learn quickly. Long-term memory enables agents to retain and recall vast '
 'amounts of information over extended periods. Agents can also utilize '
 'external tools like APIs to access additional information beyond what is '
 'stored in their memory.')
```

```python
inputs = {"question": "Explain how chain of thought prompting works?"}
for output in app.stream(inputs):
    for key, value in output.items():
        # Node
        pprint(f"Node '{key}':")
        # Optional: print full state at each node
        # pprint.pprint(value["keys"], indent=2, width=80, depth=None)
    pprint("\n---\n")

# Final generation
pprint(value["generation"])
```

```python
---RETRIEVE---
"Node 'retrieve':"
'\n---\n'
---CHECK DOCUMENT RELEVANCE TO QUESTION---
---GRADE: DOCUMENT RELEVANT---
---GRADE: DOCUMENT NOT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
---GRADE: DOCUMENT RELEVANT---
---ASSESS GRADED DOCUMENTS---
---DECISION: GENERATE---
"Node 'grade_documents':"
'\n---\n'
---GENERATE---
---CHECK HALLUCINATIONS---
---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---
---GRADE GENERATION vs QUESTION---
---DECISION: GENERATION ADDRESSES QUESTION---
"Node 'generate':"
'\n---\n'
('Chain of thought prompting works by repeatedly prompting the model to ask '
 'follow-up questions to construct the thought process iteratively. This '
 'method can be combined with queries to search for relevant entities and '
 'content to add back into the context. It extends the thought process by '
 'exploring multiple reasoning possibilities at each step, creating a tree '
 'structure of thoughts.')
```
