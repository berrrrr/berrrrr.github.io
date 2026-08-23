---
layout: post
title: "[ONNX] ONNX Runtime 프로파일링"
subtitle: "[ONNX] profiling"
categories: programming
tags: mlops
comments: true
---

> **ONNX 시리즈**의 글입니다.

```python
import json, os
from collections import Counter, defaultdict

prof_file = "/usr/src/app/onnxruntime_profile__2025-09-18_18-57-04.json"

# 1) 기본: 전체 JSON 파싱 (Chrome trace 포맷)
with open(prof_file, "r") as f:
    data = json.load(f)

# 2) 이벤트 리스트 꺼내기 (케이스별 대응)
if isinstance(data, dict):
    events = data.get("traceEvents") or data.get("events") or []
elif isinstance(data, list):
    events = data
else:
    events = []

# 3) 혹시 events가 비어 있으면(희귀 케이스) 라인 파싱 fallback
if not events:
    ev = []
    with open(prof_file, "r") as f:
        for line in f:
            s = line.strip().rstrip(",")
            if not s or s in ("[", "]", "{", "}", "},", "{,"):
                continue
            try:
                ev.append(json.loads(s))
            except json.JSONDecodeError:
                pass
    events = ev

print(f"Total events: {len(events)}")

# 4) Provider별 카운트/시간 합계
provider_counts = Counter()
provider_dur_us = defaultdict(float)
op_examples = defaultdict(list)

for e in events:
    if e.get("cat") != "Node":
        continue
    args = e.get("args") or {}
    prov = args.get("provider")
    if not prov:
        continue

    provider_counts[prov] += 1
    dur = (e.get("dur") or 0)  # ORT는 μs 단위 dur 제공
    provider_dur_us[prov] += dur

    if len(op_examples[prov]) < 5:
        op_examples[prov].append(args.get("op_name") or e.get("name"))

# 5) 보기 좋게 출력
total_dur = sum(provider_dur_us.values()) or 1.0
print("\n=== Provider별 노드 개수 ===")
for prov, cnt in provider_counts.items():
    print(f"{prov:25s} : {cnt}")

print("\n=== Provider별 누적 실행시간(%) ===")
for prov, dur_us in provider_dur_us.items():
    pct = 100.0 * dur_us / total_dur
    print(f"{prov:25s} : {dur_us/1e3:9.3f} ms  ({pct:5.1f}%)")

print("\n=== Provider별 예시 op (최대 5개) ===")
for prov, ops in op_examples.items():
    print(f"{prov}: {ops}")
```
