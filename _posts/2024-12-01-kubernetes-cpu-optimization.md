---
layout: post
title: "[DevOps] Kubernetes CPU 알뜰하게 사용하기"
subtitle: "[DevOps] Kubernetes CPU 알뜰하게 사용하기"
categories: programming
tags: devops
comments: true
---

### CPU throttling 방지

cpu limit을 넘어가면 throttled됨.
(memory는 limit 넘어감녀 터짐. oom)
따라서 스로틀링 안되는 한에서 리소스 줄이는것이 필요

CFS : completely fair scheduler., worker node의 모든 cpu사용, time lice 사용. 사용시간도 quota만큼 분배

limit이 높은데도 5를 못넘는문제 → cfs문제.
kubelet에 cpu-cfs-quota-period 낮추기 → throttling에 의한 대기시간이 줄어듬.
cpu-cfs-quota비활성화시 → limit이 의미없어져서 이것은 주의해야함.

### CPU Requests/Limits 최소화

requests / limit gap 최소화
right sizing = 할당량에 맞게 사용량을 맞추는것.
noise 제거
- warmup시에 요청이 쏟아짐.. → promql 로 초기 400초 무시
- 새벽, 주말 → max_over_time 최대1주동안의 사용량으로 올라감 방지.
- 7일 max_over_time 부하 → 시간 해상도 낮추기. max_over_time 중첩 (1분 먼저 구하고 이후 15분)
병렬성 설정
- 컨테이너 cpu 코어 인식개수 = 워커노드 cpu 코어 전체개수
  - 또잉?? 이거 너무 심각한거아닌가
- 보통 스레드 생성하는놈들은 자신이 인지하는 하드의 코어갯수에 맞춰서 생성함
- 따라서 이를 해결하기 위해 스레드 갯수 max값을 설정하여 해결. (ex. automaxprocs)

### CPU 사용량 최소화

right sizing
- daemonset의경우 모든 워커노드에 뜸 → 워커노드 스펙업시 데몬셋이 덜뜸.
- 노드를 스케일업하고 노드 사이즈 줄임 → 리소스 효율화
cpu optimization
- mau 20% 증가
- 트래픽 40% 증가
- 트래픽이 제곱으로 증가 → 비효율 발생
- istio사용률이 너무 높음
- toss mixer구현. → istio 대체 → 절반이상의 비용 효율화

### CPU 사용량 분산

schueduler 분배의 문제점
- 피크타임에 한 파드에 너무 요청이 몰림.
- topology spread constraint 로 해결.
