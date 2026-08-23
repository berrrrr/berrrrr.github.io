---
layout: post
title: "[LangGraph] 02. LangGraph 사용해보기"
subtitle: "[LangGraph] 02. LangGraph 사용해보기"
categories: programming
tags: mlops
comments: true
---

> **LangGraph 시리즈**의 글입니다.

> Langgraph는 LLM agent를 잘 구현할 수 있게 도와주는 Langchain 생태계 내의 프레임워크.<br>대충 어떤녀석인지 톺아보자


### LangGraph란?

- cycle(순환), branch(분기) 지원
- persistence 지원 (=db저장 지원)
- human in the loop 지원 (루프 중간에 사람이 개입할수있게함)
- streaming support
- integration with langchain

### Build an Agent from Scratch

LangGraph안쓰고 from scratch로 agent를 구현해보자

```python
class Agent:
    def __init__(self, system=""):
        self.system = system
        self.messages = []
        if self.system:
            self.messages.append({"role": "system", "content": system})

    def __call__(self, message):
        self.messages.append({"role": "user", "content": message})
        result = self.execute()
        self.messages.append({"role": "assistant", "content": result})
        return result

    def execute(self):
        completion = client.chat.completions.create(
                        model="gpt-4o",
                        temperature=0,
                        messages=self.messages)
        return completion.choices[0].message.content

```

<details>

<summary>prompt</summary>

  ```python
prompt = """
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the actions available to you - then return PAUSE.
Observation will be the result of running those actions.

Your available actions are:

calculate:
e.g. calculate: 4 * 7 / 3
Runs a calculation and returns the number - uses Python so be sure to use floating point syntax if necessary

average_dog_weight:
e.g. average_dog_weight: Collie
returns average weight of a dog when given the breed

Example session:

Question: How much does a Bulldog weigh?
Thought: I should look the dogs weight using average_dog_weight
Action: average_dog_weight: Bulldog
PAUSE

You will be called again with this:

Observation: A Bulldog weights 51 lbs

You then output:

Answer: A bulldog weights 51 lbs
""".strip()
  ```

</details>

```python
def calculate(what):
    return eval(what)

def average_dog_weight(name):
    if name in "Scottish Terrier":
        return("Scottish Terriers average 20 lbs")
    elif name in "Border Collie":
        return("a Border Collies average weight is 37 lbs")
    elif name in "Toy Poodle":
        return("a toy poodles average weight is 7 lbs")
    else:
        return("An average dog weights 50 lbs")

known_actions = {
    "calculate": calculate,
    "average_dog_weight": average_dog_weight
}
```

```python
action_re = re.compile('^Action: (\w+): (.*)$')

def query(question, max_turns=5):
    i = 0
    bot = Agent(prompt)
    next_prompt = question
    while i < max_turns:
        i += 1
        result = bot(next_prompt)
        print(result)
        actions = [
            action_re.match(a)
            for a in result.split('\n')
            if action_re.match(a)
        ]
        if actions:
            # There is an action to run
            action, action_input = actions[0].groups()
            if action not in known_actions:
                raise Exception("Unknown action: {}: {}".format(action, action_input))
            print(" -- running {} {}".format(action, action_input))
            observation = known_actions[action](action_input)
            print("Observation:", observation)
            next_prompt = "Observation: {}".format(observation)
        else:
            return

question = """I have 2 dogs, a border collie and a scottish terrier. \
What is their combined weight"""
query(question)
```


### LangGraph Components

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/01.png?raw=true)

이런 그래프를 구현하고 싶다면?

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

tool = TavilySearchResults(max_results=4) #increased number of results

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]

class Agent:
    def __init__(self, model, tools, system=""):
        self.system = system
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_openai)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges(
            "llm",
            self.exists_action,
            {True: "action", False: END}
        )
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile()
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)

    def exists_action(self, state: AgentState):
        result = state['messages'][-1]
        return len(result.tool_calls) > 0

    def call_openai(self, state: AgentState):
        messages = state['messages']
        if self.system:
            messages = [SystemMessage(content=self.system)] + messages
        message = self.model.invoke(messages)
        return {'messages': [message]}

    def take_action(self, state: AgentState):
        tool_calls = state['messages'][-1].tool_calls
        results = []
        for t in tool_calls:
            print(f"Calling: {t}")
            if not t['name'] in self.tools:      # check for bad tool name from LLM
                print("\n ....bad tool name....")
                result = "bad tool name, retry"  # instruct LLM to retry if bad
            else:
                result = self.tools[t['name']].invoke(t['args'])
            results.append(ToolMessage(tool_call_id=t['id'], name=t['name'], content=str(result)))
        print("Back to the model!")
        return {'messages': results}


 prompt = """You are a smart research assistant. Use the search engine to look up information. \
You are allowed to make multiple calls (either together or in sequence). \
Only look up information when you are sure of what you want. \
If you need to look up some information before asking a follow up question, you are allowed to do that!
"""

model = ChatOpenAI(model="gpt-3.5-turbo")  #reduce inference cost
abot = Agent(model, [tool], system=prompt)
```

```python
messages = [HumanMessage(content="What is the weather in sf?")]
result = abot.graph.invoke({"messages": messages})
```

```python
# print(result)
{'messages': [HumanMessage(content='What is the weather in sf?'),
  AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_EILAzWUK7wJGJdL0QbsZtHml', 'function': {'arguments': '{"query":"weather in San Francisco"}', 'name': 'tavily_search_results_json'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 21, 'prompt_tokens': 153, 'total_tokens': 174}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-f7c0a9cd-4e7e-4fd1-a5bc-fd42738bc887-0', tool_calls=[{'name': 'tavily_search_results_json', 'args': {'query': 'weather in San Francisco'}, 'id': 'call_EILAzWUK7wJGJdL0QbsZtHml'}]),
  ToolMessage(content='[{\'url\': \'https://www.wunderground.com/hourly/us/ca/merced-manor/94132/date/2024-06-24\', \'content\': \'San Francisco Weather Forecasts. Weather Underground provides local & long-range weather forecasts, weatherreports, maps & tropical weather conditions for the San Francisco area. ... Monday 06/24 ...\'}, {\'url\': \'https://www.timeanddate.com/weather/usa/san-francisco/hourly\', \'content\': \'Hour-by-Hour Forecast for San Francisco, California, USA. Currently: 60 °F. Passing clouds. (Weather station: San Francisco International Airport, USA). See more current weather.\'}, {\'url\': \'https://www.weatherapi.com/\', \'content\': "{\'location\': {\'name\': \'San Francisco\', \'region\': \'California\', \'country\': \'United States of America\', \'lat\': 37.78, \'lon\': -122.42, \'tz_id\': \'America/Los_Angeles\', \'localtime_epoch\': 1719237374, \'localtime\': \'2024-06-24 6:56\'}, \'current\': {\'last_updated_epoch\': 1719236700, \'last_updated\': \'2024-06-24 06:45\', \'temp_c\': 12.2, \'temp_f\': 54.0, \'is_day\': 1, \'condition\': {\'text\': \'Sunny\', \'icon\': \'//cdn.weatherapi.com/weather/64x64/day/113.png\', \'code\': 1000}, \'wind_mph\': 3.8, \'wind_kph\': 6.1, \'wind_degree\': 20, \'wind_dir\': \'NNE\', \'pressure_mb\': 1013.0, \'pressure_in\': 29.92, \'precip_mm\': 0.0, \'precip_in\': 0.0, \'humidity\': 90, \'cloud\': 0, \'feelslike_c\': 11.3, \'feelslike_f\': 52.3, \'windchill_c\': 10.2, \'windchill_f\': 50.4, \'heatindex_c\': 11.3, \'heatindex_f\': 52.4, \'dewpoint_c\': 9.0, \'dewpoint_f\': 48.2, \'vis_km\': 16.0, \'vis_miles\': 9.0, \'uv\': 4.0, \'gust_mph\': 10.6, \'gust_kph\': 17.0}}"}, {\'url\': \'https://forecast.weather.gov/zipcity.php?inputstring=San+Francisco,CA\', \'content\': \'San Francisco CA 37.77°N 122.41°W (Elev. 131 ft) Last Update: 5:02 pm PDT Jun 23, 2024. Forecast Valid: 5pm PDT Jun 23, 2024-6pm PDT Jun 30, 2024 . Forecast Discussion . Additional Resources. Radar & Satellite Image. Hourly Weather Forecast. ... Severe Weather ; Current Outlook Maps ; Drought ; Fire Weather ; Fronts/Precipitation Maps ...\'}]', name='tavily_search_results_json', tool_call_id='call_EILAzWUK7wJGJdL0QbsZtHml'),
  AIMessage(content='The current weather in San Francisco is 54°F with sunny conditions. The wind is blowing at 6.1 km/h from the NNE direction. The humidity is at 90%, and there is no precipitation.', response_metadata={'token_usage': {'completion_tokens': 45, 'prompt_tokens': 871, 'total_tokens': 916}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-fbafec21-8a59-463b-a1a3-2013ca45a3ac-0')]}
```


시각화도 단 두줄로 표현 가능

```python
from IPython.display import Image

Image(abot.graph.get_graph().draw_png())
```

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/02.png?raw=true)

### Agentic Search Tools

tavily_search 홍보를 위한 구성 소개이긴한데 내용자체는 좋아서 가져옴

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/03.png?raw=true)

- 이 방식은 hallucation 을 줄여주고
- human-computer 상호작용의 간격을 줄여줌

search tool의 내부

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/04.png?raw=true)

1. 쿼리를 이해하고
2. 해당 쿼리를 서브쿼리로 쪼갬 (= 더 복잡한 쿼리를 다룰수있게해주는 중요한스텝)
3. 서브쿼리들에대한 답변을 각 소스에서 가져옴 (vector search해서 top k chunk를 가져옴)
4. 점수매기고 필터링함
5. 연관있는 topK 문서만 리턴
어쨌든 `from tavily import TavilyClient` 해서 [`client.search`](http://client.search) 하면 위와 같이 동작한다고함

### Persistence and Streaming

state를 persistence layer(쉽게말해 db)에 저장하는 예제
예제에서는 sqllite(in-memory db)를 썼지만 redis나 mysql등으로 갈아끼워서 쓰면 됨.

```python
from langgraph.checkpoint.sqlite import SqliteSaver

memory = SqliteSaver.from_conn_string(":memory:")

class Agent:
    def __init__(self, model, tools, checkpointer, system=""):
        self.system = system
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_openai)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges("llm", self.exists_action, {True: "action", False: END})
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile(checkpointer=checkpointer)
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)

    def call_openai(self, state: AgentState):
        messages = state['messages']
        if self.system:
            messages = [SystemMessage(content=self.system)] + messages
        message = self.model.invoke(messages)
        return {'messages': [message]}

    def exists_action(self, state: AgentState):
        result = state['messages'][-1]
        return len(result.tool_calls) > 0

    def take_action(self, state: AgentState):
        tool_calls = state['messages'][-1].tool_calls
        results = []
        for t in tool_calls:
            print(f"Calling: {t}")
            result = self.tools[t['name']].invoke(t['args'])
            results.append(ToolMessage(tool_call_id=t['id'], name=t['name'], content=str(result)))
        print("Back to the model!")
        return {'messages': results}


prompt = """You are a smart research assistant. Use the search engine to look up information. \
You are allowed to make multiple calls (either together or in sequence). \
Only look up information when you are sure of what you want. \
If you need to look up some information before asking a follow up question, you are allowed to do that!
"""
model = ChatOpenAI(model="gpt-4o")
abot = Agent(model, [tool], system=prompt, checkpointer=memory)
```

영속성과 스트리밍을 사용하기 위한 기본설정

```python
messages = [HumanMessage(content="What is the weather in sf?")]
thread = {"configurable": {"thread_id": "1"}}
for event in abot.graph.stream({"messages": messages}, thread):
    for v in event.values():
        print(v['messages'])


messages = [HumanMessage(content="Which one is warmer?")]
thread = {"configurable": {"thread_id": "1"}}
for event in abot.graph.stream({"messages": messages}, thread):
    for v in event.values():
        print(v)
```

동일 스레드라면, check pointer가 상태를 계속 저장하기때문에 follow up question에서 앞선 질문에대한 context를 얻기위해 기존 질문을 다시한번 질문할 필요가 없어짐

비동기 스트리밍 처리도 가능함!! ⇒ async check pointer를 사용 가능하다 = 병렬처리가 가능해짐

```python
from langgraph.checkpoint.aiosqlite import AsyncSqliteSaver

memory = AsyncSqliteSaver.from_conn_string(":memory:")
abot = Agent(model, [tool], system=prompt, checkpointer=memory)

messages = [HumanMessage(content="What is the weather in SF?")]
thread = {"configurable": {"thread_id": "4"}}
async for event in abot.graph.astream_events({"messages": messages}, thread, version="v1"):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        content = event["data"]["chunk"].content
        if content:
            # Empty content in the context of OpenAI means
            # that the model is asking for a tool to be invoked.
            # So we only print non-empty content
            print(content, end="|")
```

### Human in the loop

langgraph 에서는 중간에 사람이 개입할수있게 (interrupt) 방법을 마련해놓았다

```python
class Agent:
    def __init__(self, model, tools, system="", checkpointer=None):
        self.system = system
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_openai)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges("llm", self.exists_action, {True: "action", False: END})
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile(
            checkpointer=checkpointer,
            interrupt_before=["action"] # 이부분만 선언해주면 됨!!
        )
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)

```

특정 state를 가져와서 그 state 를 수정하여 실행한다거나.. 등등의 행동이 가능
- Modify State
- Time travle
- Go back in time and edit
- add message to a state at a given time

```python
messages = [HumanMessage("Whats the weather in LA?")]
thread = {"configurable": {"thread_id": "2"}}
for event in abot.graph.stream({"messages": messages}, thread):
    for v in event.values():
        print(v)
while abot.graph.get_state(thread).next:
    print("\n", abot.graph.get_state(thread),"\n")
    _input = input("proceed?")
    if _input != "y":
        print("aborting")
        break
    for event in abot.graph.stream(None, thread):
        for v in event.values():
            print(v)
```

### Runnable Config

```python
import pprint
from langgraph.errors import GraphRecursionError
from langchain_core.runnables import RunnableConfig

config = RunnableConfig(
    recursion_limit=12, configurable={"thread_id": "CORRECTIVE-SEARCH-RAG"}
)

# AgentState 객체를 활용하여 질문을 입력합니다.
inputs = GraphState(
    question="생성형 AI 가우스를 만든 회사의 2023년도 매출액은 얼마인가요?"
)

# app.stream을 통해 입력된 메시지에 대한 출력을 스트리밍합니다.
try:
    for output in app.stream(inputs, config=config):
        # 출력된 결과에서 키와 값을 순회합니다.
        for key, value in output.items():
            # 노드의 이름과 해당 노드에서 나온 출력을 출력합니다.
            pprint.pprint(f"Output from node '{key}':")
            pprint.pprint("---")
            # 출력 값을 예쁘게 출력합니다.
            pprint.pprint(value, indent=2, width=80, depth=None)
        # 각 출력 사이에 구분선을 추가합니다.
        pprint.pprint("\n---\n")
except GraphRecursionError as e:
    pprint.pprint(f"Recursion limit reached: {e}")
```

config를 통해 recursion limit등을 제어 가능.

### Essay Writer

<details>

<summary>state</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/05.png?raw=true)

  ```python
class AgentState(TypedDict):
    task: str
    plan: str
    draft: str
    critique: str
    content: List[str]
    revision_number: int
    max_revisions: int
  ```

</details>

<details>

<summary>prompt</summary>

  ```python
PLAN_PROMPT = """You are an expert writer tasked with writing a high level outline of an essay. \
Write such an outline for the user provided topic. Give an outline of the essay along with any relevant notes \
or instructions for the sections."""

WRITER_PROMPT = """You are an essay assistant tasked with writing excellent 5-paragraph essays.\
Generate the best essay possible for the user's request and the initial outline. \
If the user provides critique, respond with a revised version of your previous attempts. \
Utilize all the information below as needed:

------

{content}"""


REFLECTION_PROMPT = """You are a teacher grading an essay submission. \
Generate critique and recommendations for the user's submission. \
Provide detailed recommendations, including requests for length, depth, style, etc."""


RESEARCH_PLAN_PROMPT = """You are a researcher charged with providing information that can \
be used when writing the following essay. Generate a list of search queries that will gather \
any relevant information. Only generate 3 queries max."""


RESEARCH_CRITIQUE_PROMPT = """You are a researcher charged with providing information that can \
be used when making any requested revisions (as outlined below). \
Generate a list of search queries that will gather any relevant information. Only generate 3 queries max."""
  ```

</details>

<details>

<summary>node</summary>

  ```python
def plan_node(state: AgentState):
    messages = [
        SystemMessage(content=PLAN_PROMPT),
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)
    return {"plan": response.content}

def research_plan_node(state: AgentState):
    queries = model.with_structured_output(Queries).invoke([
        SystemMessage(content=RESEARCH_PLAN_PROMPT),
        HumanMessage(content=state['task'])
    ])
    content = state['content'] or []
    for q in queries.queries:
        response = tavily.search(query=q, max_results=2)
        for r in response['results']:
            content.append(r['content'])
    return {"content": content}

def generation_node(state: AgentState):
    content = "\n\n".join(state['content'] or [])
    user_message = HumanMessage(
        content=f"{state['task']}\n\nHere is my plan:\n\n{state['plan']}")
    messages = [
        SystemMessage(
            content=WRITER_PROMPT.format(content=content)
        ),
        user_message
        ]
    response = model.invoke(messages)
    return {
        "draft": response.content,
        "revision_number": state.get("revision_number", 1) + 1
    }

def reflection_node(state: AgentState):
    messages = [
        SystemMessage(content=REFLECTION_PROMPT),
        HumanMessage(content=state['draft'])
    ]
    response = model.invoke(messages)
    return {"critique": response.content}


def research_critique_node(state: AgentState):
    queries = model.with_structured_output(Queries).invoke([
        SystemMessage(content=RESEARCH_CRITIQUE_PROMPT),
        HumanMessage(content=state['critique'])
    ])
    content = state['content'] or []
    for q in queries.queries:
        response = tavily.search(query=q, max_results=2)
        for r in response['results']:
            content.append(r['content'])
    return {"content": content}

def should_continue(state):
    if state["revision_number"] > state["max_revisions"]:
        return END
    return "reflect"
  ```

</details>

<details>

<summary>graph</summary>

  ```python
builder = StateGraph(AgentState)

builder.add_node("planner", plan_node)
builder.add_node("generate", generation_node)
builder.add_node("reflect", reflection_node)
builder.add_node("research_plan", research_plan_node)
builder.add_node("research_critique", research_critique_node)

builder.set_entry_point("planner")

builder.add_conditional_edges(
    "generate",
    should_continue,
    {END: END, "reflect": "reflect"}
)

builder.add_edge("planner", "research_plan")
builder.add_edge("research_plan", "generate")

builder.add_edge("reflect", "research_critique")
builder.add_edge("research_critique", "generate")
  ```

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/06.png?raw=true)

  ```python
from IPython.display import Image

Image(graph.get_graph().draw_png())
  ```

</details>


### Conclusion

langraph 가 아직 다루지 못하지만 알아두면 좋은 flow

<details>

<summary>multi-agent</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/07.png?raw=true)

</details>

<details>

<summary>supervisor agent</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/08.png?raw=true)

</details>

- flow engineering

<details>

<summary>plan and execute</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/09.png?raw=true)

</details>

<details>

<summary>language agent tree search</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/langgraph-02-hands-on/10.png?raw=true)

</details>

### 소회

tavily 홍보를 위해서인지 이걸 자꾸씀. 좋아보이긴 하는데 유료라서 쓸일은 없을거같고 이부분을 자체구현하는 다른 방식으로 갈아치워서 성능좋은 검색툴 충분히 만들 수 있을듯

> [https://learn.deeplearning.ai/courses/ai-agents-in-langgraph/](https://learn.deeplearning.ai/courses/ai-agents-in-langgraph/)<br>[https://github.com/teddylee777/langchain-kr/blob/main/17-LangGraph/04-langgraph-search-or-retrieve.ipynb](https://github.com/teddylee777/langchain-kr/blob/main/17-LangGraph/04-langgraph-search-or-retrieve.ipynb)
