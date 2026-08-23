---
layout: post
title: "[MLOps] LLM 애플리케이션 개발을 돕는 도구들"
subtitle: "[MLOps] LLM 어플리케이션 개발을 도와주는 도구들"
categories: programming
tags: mlops
comments: true
---

> 점점 더 LLM 어플리케이션 개발 역시 점점 더 쉬워지고있습니다. 어떤 도구들이 어떤방식으로 편의성을 제공하고있는지 알아보고 이후에는 어떤 흐름으로 나아갈지 한번 고민해봅시다!


### 1. MCP

#### MCP란?

Model Context Protocol
24년 11월경 anthropic에서 공개한,
LLM에게 context를 제공하는 방법에 대한 표준 ‘**프로토콜**’

> Protocol : 서로 다른 시스템이나 장치가 통신할 수 있도록 정해놓은 규칙이나 약속<br>ex. http, TCP/IP, FTP, USB, Bluetooth

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-application-development-tools/01.png?raw=true)

- MCP Server : MCP 프로토콜을 통해 tool, prompt, context 등을 client에게 제공
- MCP Host :  커넥션을 생성하는 LLM어플리케이션 (Claude Desktop, IDE, 등등.. 프로그램)
- MCP Client : 서버와 1;1 연결을 유지함. 호스트 안에 존재하게됨.

#### Transports

<details>

<summary>JSON-RPC 2.0 메세지 포맷 사용</summary>

  ```python
{
  jsonrpc: "2.0",
  id: number | string,
  method: string,
  params?: object
}
  ```

  ```python
{
  jsonrpc: "2.0",
  id: number | string,
  result?: object,
  error?: {
    code: number,
    message: string,
    data?: unknown
  }
}
  ```

  ```python
{
  jsonrpc: "2.0",
  method: string,
  params?: object
}
  ```

</details>

<details>

<summary>Stdio : standard input,output stream을 통해 통신. local 어플리케이션, cli tool에 주로 사용됨. </summary>

  ```python
app = Server("example-server")

async with stdio_server() as streams:
    await app.run(
        streams[0],
        streams[1],
        app.create_initialization_options()
    )
  ```

  ```python
params = StdioServerParameters(
    command="./server",
    args=["--option", "value"]
)

async with stdio_client(params) as streams:
    async with ClientSession(streams[0], streams[1]) as session:
        await session.initialize()
  ```

</details>

<details>

<summary>SSE (Server Sent event) : 서버→클라는 스트리밍 / 클라→서버는 http POST request 로 통신. </summary>

  ```python
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Route

app = Server("example-server")
sse = SseServerTransport("/messages")

async def handle_sse(scope, receive, send):
    async with sse.connect_sse(scope, receive, send) as streams:
        await app.run(streams[0], streams[1], app.create_initialization_options())

async def handle_messages(scope, receive, send):
    await sse.handle_post_message(scope, receive, send)

starlette_app = Starlette(
    routes=[
        Route("/sse", endpoint=handle_sse),
        Route("/messages", endpoint=handle_messages, methods=["POST"]),
    ]
)
  ```

  ```python
async with sse_client("http://localhost:8000/sse") as streams:
    async with ClientSession(streams[0], streams[1]) as session:
        await session.initialize()
  ```

</details>

#### MCP 사용하기

1. [https://smithery.ai/](https://smithery.ai/) 에서 이미 완성된 MCP 사용하기
2. 내가만든 MCP 사용하기

  ```bash
uv run mcp install server.py
  ```

  이러면 자동으로 깔리는는데..? 사실 제대로 하려면 `claud_desktop_config.json` 수정해줘야.

  ```bash
{
  "mcpServers": {
    "Demo": {
      "command": "/Users/avy/.local/bin/uv",
      "args": [
        "run",
        "--with",
        "mcp[cli]",
        "mcp",
        "run",
        "/Users/avy/Workspaces/python/mcp-server-demo/server.py"
      ]
    },
    "Echo": {
      "command": "/Users/avy/.local/bin/uv",
      "args": [
        "run",
        "--with",
        "mcp[cli]",
        "mcp",
        "run",
        "/Users/avy/Workspaces/python/mcp-server-demo/server.py"
      ]
    }
  }
}
  ```

#### MCP server 만들기

많은 [sdk](https://modelcontextprotocol.io/introduction)들이 존재하지만..  우리는 당연히 python

1. uv깔기

  ```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

2. project init

  ```bash
# Create a new directory for our project
uv init weather
cd weather

# Create virtual environment and activate it
uv venv
source .venv/bin/activate

# Install dependencies
uv add "mcp[cli]" httpx

# Create our server file
touch weather.py
  ```

3. 서버띄우기

  ```python
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server with configuration
mcp = FastMCP(
    "Weather",  # Name of the MCP server
    instructions="You are a weather assistant that can answer questions about the weather in a given location.",  # Instructions for the LLM on how to use this tool
    host="0.0.0.0",  # Host address (0.0.0.0 allows connections from any IP)
    port=8005,  # Port number for the server
)


@mcp.tool()
async def get_weather(location: str) -> str:
    """
    Get current weather information for the specified location.

    This function simulates a weather service by returning a fixed response.
    In a production environment, this would connect to a real weather API.

    Args:
        location (str): The name of the location (city, region, etc.) to get weather for

    Returns:
        str: A string containing the weather information for the specified location
    """
    # Return a mock weather response
    # In a real implementation, this would call a weather API
    return f"It's always Sunny in {location}"


if __name__ == "__main__":
    # Start the MCP server with stdio transport
    # stdio transport allows the server to communicate with clients
    # through standard input/output streams, making it suitable for
    # local development and testing
    mcp.run(transport="stdio")
  ```


서버에서 제공할 수 있는 기능들

<details>

<summary>Resources</summary>

  ```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My App")


@mcp.resource("config://app")
def get_config() -> str:
    """Static configuration data"""
    return "App configuration here"


@mcp.resource("users://{user_id}/profile")
def get_user_profile(user_id: str) -> str:
    """Dynamic user data"""
    return f"Profile data for user {user_id}"
  ```

</details>

<details>

<summary>Tools</summary>

  ```python
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My App")


@mcp.tool()
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate BMI given weight in kg and height in meters"""
    return weight_kg / (height_m**2)


@mcp.tool()
async def fetch_weather(city: str) -> str:
    """Fetch current weather for a city"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.weather.com/{city}")
        return response.text
  ```

</details>

<details>

<summary>Prompts</summary>

  ```python
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.prompts import base

mcp = FastMCP("My App")


@mcp.prompt()
def review_code(code: str) -> str:
    return f"Please review this code:\n\n{code}"


@mcp.prompt()
def debug_error(error: str) -> list[base.Message]:
    return [
        base.UserMessage("I'm seeing this error:"),
        base.UserMessage(error),
        base.AssistantMessage("I'll help debug that. What have you tried so far?"),
    ]
  ```

</details>

<details>

<summary>Images</summary>

  ```python
from mcp.server.fastmcp import FastMCP, Image
from PIL import Image as PILImage

mcp = FastMCP("My App")


@mcp.tool()
def create_thumbnail(image_path: str) -> Image:
    """Create a thumbnail from an image"""
    img = PILImage.open(image_path)
    img.thumbnail((100, 100))
    return Image(data=img.tobytes(), format="png")
  ```

</details>


#### MCP client 만들기


```bash
pip install langchain-mcp-adapters
```

1. single server

  ```python
# math_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Math")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """Multiply two numbers"""
    return a * b

if __name__ == "__main__":
    mcp.run(transport="stdio")
  ```

  ```python
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent

from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o")

server_params = StdioServerParameters(
    command="python",
    # Make sure to update to the full absolute path to your math_server.py file
    args=["/path/to/math_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools
        tools = await load_mcp_tools(session)

        # Create and run the agent
        agent = create_react_agent(model, tools)
        agent_response = await agent.ainvoke({"messages": "what's (3 + 5) x 12?"})
  ```

  참고) [react app](https://smith.langchain.com/hub/hwchase17/react)
2. multiple server

  ```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

from langchain_openai import ChatOpenAI
model = ChatOpenAI(model="gpt-4o")

async with MultiServerMCPClient(
    {
        "math": {
            "command": "python",
            # Make sure to update to the full absolute path to your math_server.py file
            "args": ["/path/to/math_server.py"],
            "transport": "stdio",
        },
        "weather": {
            # make sure you start your weather server on port 8000
            "url": "http://localhost:8005/sse",
            "transport": "sse",
        }
    }
) as client:
    agent = create_react_agent(model, client.get_tools())
    math_response = await agent.ainvoke({"messages": "what's (3 + 5) x 12?"})
    weather_response = await agent.ainvoke({"messages": "what is the weather in seoul?"})
  ```

#### MCP에 대처하는 우리의 자세

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/llm-application-development-tools/02.png?raw=true)

1. 유저로서 MCP server를 잘 사용하기.
2. 다양한 host에 제공해줄수있는 유용한 MCP server를 개발하기
3. 다양한 MCP server를 잘 사용할 수 있는 client, host를 개발하기

> [https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)<br>[https://modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)<br>[https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file](https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file)

### 2. LangGraph

여러 agent들로 구성된 LLM어플리케이션을 만들때, branch나 loop 구성을 더 쉽게 할 수 있게 도와주는 프레임워크

#### State

그래프안에서 사용되는 메세지

```python
from typing import TypedDict

class State(TypedDict):
    count: int
    messages: list[str]
```

#### Node

그래프의 노드역할로 보통 함수가 들어감

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

#### Edge

그래프의 엣지역할로 보통 분기문에 해당하는 함수가 들어감
일반엣지 (node a → node b)

```python
graph.add_edge("node_a", "node_b")
```

조건부엣지 ( node a 에서 어떨땐 b 어떨땐 c로 )

```python
graph.add_conditional_edges("node_a", routing_function, {True: "node_b", False: "node_c"})
```

#### 그 외 기능

- human-in-loop
- streaming
- persistence (데이터저장)
- time travel
- tool calling
- subgraph
- multi-agent
…

#### Examples


[Customer Support](https://langchain-ai.github.io/langgraph/tutorials/customer-support/customer-support/)
[Corrective RAG](https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_crag/)
[Self-RAG](https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_self_rag/)

#### Langgraph w. MCP

```python
import os
from typing import Annotated

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import AzureChatOpenAI
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)
llm = AzureChatOpenAI(model="gpt-4o-2024-08-06", api_version='2024-02-01')

async def main():
    def chatbot(state: State):
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    async def stream_graph_updates(user_input: str):
        async for event in graph.astream({"messages": [{"role": "user", "content": user_input}]}):
            for value in event.values():
                print("Assistant:", value["messages"][-1].content)

    async with MultiServerMCPClient(
            {
                "weather": {
                    # make sure you start your weather server on port 8000
                    "url": "http://localhost:8005/sse",
                    "transport": "sse",
                }
            }
    ) as client:
        tools = client.get_tools()
        llm_with_tools = llm.bind_tools(tools)

        graph_builder.add_node("chatbot", chatbot)

        tool_node = ToolNode(tools=tools)
        graph_builder.add_node("tools", tool_node)

        graph_builder.add_conditional_edges(
            "chatbot",
            tools_condition,
        )
        graph_builder.add_edge("tools", "chatbot")
        graph_builder.add_edge(START, "chatbot")
        graph = graph_builder.compile()

        png_data = graph.get_graph().draw_mermaid_png()
        with open('diagram.png', 'wb') as f:
            f.write(png_data)

        while True:
            try:
                user_input = input("User: ")
                if user_input.lower() in ["quit", "exit", "q"]:
                    print("Goodbye!")
                    break

                await stream_graph_updates(user_input)
            except:
                # fallback if input() is not available
                user_input = "What do you know about LangGraph?"
                print("User: " + user_input)
                await stream_graph_updates(user_input)
                break


if __name__ == '__main__':
    import asyncio

    asyncio.run(main())

```


> [https://www.langchain.com/langgraph](https://www.langchain.com/langgraph)<br>[https://langchain-ai.github.io/langgraph/tutorials/introduction/](https://langchain-ai.github.io/langgraph/tutorials/introduction/)

### 3. Mlflow (with LLM)

```python
mlflow.langchain.autolog()

mlflow.set_tracking_uri('https://example.com')
mlflow.set_experiment("실험 이름")
```

요것만 붙여주면 오토로깅됨!!

#### openai

```python
import os
import openai
import mlflow

mlflow.openai.autolog()

openai_client = openai.OpenAI()

messages = [
    {
        "role": "user",
        "content": "What does turning something up to 11 refer to?",
    }
]

answer = openai_client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    temperature=0.99,
)
```

#### langchain

```python
import os
from operator import itemgetter

import mlflow
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableLambda
from langchain_openai import AzureChatOpenAI

mlflow.set_tracking_uri('https://example.com')
mlflow.set_experiment("LangChain")

mlflow.langchain.autolog(
    log_input_examples=True,
    log_model_signatures=True,
    log_models=True,
    registered_model_name="lc_model",
)

prompt_with_history_str = """
Here is a history between you and a human: {chat_history}
Now, please answer this question: {question}
"""
prompt_with_history = PromptTemplate(
    input_variables=["chat_history", "question"], template=prompt_with_history_str
)


def extract_question(input):
    return input[-1]["content"]


def extract_history(input):
    return input[:-1]


os.environ["AZURE_OPENAI_API_KEY"] = "키"
os.environ["AZURE_OPENAI_ENDPOINT"] =  "엔포"
llm = AzureChatOpenAI(model="gpt-4o-2024-08-06", api_version='2024-02-01')

# Build a chain with LCEL
chain_with_history = (
    {
        "question": itemgetter("messages") | RunnableLambda(extract_question),
        "chat_history": itemgetter("messages") | RunnableLambda(extract_history),
    }
    | prompt_with_history
    | llm
    | StrOutputParser()
)

inputs = {"messages": [{"role": "user", "content": "Who owns MLflow?"}]}

print(chain_with_history.invoke(inputs))

```

#### langgraph

```python
from typing import Literal

import mlflow

from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# Enabling tracing for LangGraph (LangChain)
mlflow.langchain.autolog()

# Optional: Set a tracking URI and an experiment
mlflow.set_tracking_uri('https://example.com')
mlflow.set_experiment("LangGraph")


@tool
def get_weather(city: Literal["nyc", "sf"]):
    """Use this to get weather information."""
    if city == "nyc":
        return "It might be cloudy in nyc"
    elif city == "sf":
        return "It's always sunny in sf"


llm = ChatOpenAI(model="gpt-4o-mini")
tools = [get_weather]
graph = create_react_agent(llm, tools)

# Invoke the graph
result = graph.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf?"}]}
)
```


오토로깅된 tracing 내용은 s3에 json파일 형식으로 떨어짐.

> [MLflow OpenAI Autologging \| MLflow](https://mlflow.org/docs/latest/llms/openai/autologging/#example-of-using-openai-autologging)<br>[MLflow Langchain Autologging \| MLflow](https://mlflow.org/docs/latest/llms/langchain/autologging)<br>[LangGraph with Model From Code \| MLflow](https://www.mlflow.org/blog/langgraph-model-from-code)
