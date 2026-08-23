---
layout: post
title: "[Python] pdb와 breakpoint()"
subtitle: "[Python] pdb와 breakpoint()"
categories: programming
tags: python
comments: true
---

### 1. `pdb`란?

- **Python Debugger**의 약자로, 파이썬 기본 내장 디버거입니다.
- 코드 실행 중 원하는 지점에서 멈추고, 변수 확인, 코드 step-by-step 실행 등이 가능합니다.
- 파이썬 표준 라이브러리라서 **추가 설치 필요 없음** (`pip install` 불필요).
---

### 2. `breakpoint()`와 `pdb.set_trace()`

- Python 3.7 이상: `breakpoint()` 권장
  - 내부적으로 `pdb.set_trace()`를 호출합니다.
- Python 3.6 이하: `pdb.set_trace()` 직접 사용해야 함.
예시:

```python
def add(a, b):
    result = a + b
    breakpoint()  # 실행 중 여기서 멈춤
    return result

print(add(3, 4))


```

---

### 3. 실행 방법

터미널에서 그냥 실행하면 됩니다:

```bash
python myscript.py


```

`breakpoint()` 지점에서 실행이 멈추고, \*\*디버그 모드(pdb 프롬프트)\*\*가 뜹니다.
---

### 4. 주요 명령어 정리 (pdb prompt에서)

<table>
<tr>
<td>명령어</td>
<td>설명</td>
</tr>
<tr>
<td>`n` (next)</td>
<td>현재 함수 내에서 한 줄씩 실행 (함수 호출은 건너뜀)</td>
</tr>
<tr>
<td>`s` (step)</td>
<td>함수 안으로 들어가며 실행</td>
</tr>
<tr>
<td>`c` (continue)</td>
<td>다음 breakpoint까지 계속 실행</td>
</tr>
<tr>
<td>`l` (list)</td>
<td>현재 위치 전후 코드 보기</td>
</tr>
<tr>
<td>`p <변수명>`</td>
<td>변수 값 출력</td>
</tr>
<tr>
<td>`pp <변수명>`</td>
<td>예쁘게 출력(pretty print)</td>
</tr>
<tr>
<td>`b <line_number>`</td>
<td>특정 라인에 breakpoint 설정</td>
</tr>
<tr>
<td>`b <file>:<line>`</td>
<td>다른 파일 특정 라인에 breakpoint 설정</td>
</tr>
<tr>
<td>`cl <breakpoint_number>`</td>
<td>해당 breakpoint 제거</td>
</tr>
<tr>
<td>`q` (quit)</td>
<td>디버깅 종료</td>
</tr>
</table>
---

### 5. 환경 변수 활용

- `PYTHONBREAKPOINT` 환경변수로 `breakpoint()` 동작을 변경 가능:

  ```bash
export PYTHONBREAKPOINT=pdb.set_trace


  ```

- 다른 디버거(ex: ipdb)로 바꿀 수도 있음:

  ```bash
export PYTHONBREAKPOINT=ipdb.set_trace


  ```

---
✅ 정리:
- Python 3.7 이상 → `breakpoint()` 사용 권장
- 디버깅 기본 명령어: `n`, `s`, `c`, `p`, `q`
- 설치 불필요 (내장 모듈)
---
