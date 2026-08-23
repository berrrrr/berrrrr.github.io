---
layout: post
title: "[MCP] 서버와 클라이언트 구현하기"
subtitle: "[MCP] 서버와 클라이언트 구현하기"
categories: programming
tags: mlops
comments: true
---

### MCP란?

Model Context Protocol
24년 11월경 anthropic에서 공개한,
LLM에게 context를 제공하는 방법에 대한 표준 ‘**프로토콜**’

> Protocol : 서로 다른 시스템이나 장치가 통신할 수 있도록 정해놓은 규칙이나 약속<br>ex. http, TCP/IP, FTP, USB, Bluetooth

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mcp-hands-on/01.png?raw=true)

- MCP Server : MCP 프로토콜을 통해 tool, prompt, context 등을 client에게 제공
- MCP Host :  커넥션을 생성하는 LLM어플리케이션 (Claude Desktop, IDE, 등등.. 프로그램)
- MCP Client : 서버와 1;1 연결을 유지함. 호스트 안에 존재하게됨.

### Transports

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

### MCP 사용하기

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

### MCP server 만들기

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


### MCP client 만들기


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

### MCP에 대처하는 우리의 자세

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/mcp-hands-on/02.png?raw=true)

1. 유저로서 MCP server를 잘 사용하기.
2. 다양한 host에 제공해줄수있는 유용한 MCP server를 개발하기
3. 다양한 MCP server를 잘 사용할 수 있는 client, host를 개발하기

> [https://www.anthropic.com/news/model-context-protocol](https://www.anthropic.com/news/model-context-protocol)<br>[https://modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)<br>[https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file](https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file)
