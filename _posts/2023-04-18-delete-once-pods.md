---
layout: post
title: "[k8s] 완료된 or 에러난 파드 한번에 지우기"
subtitle: "[k8s] 완료된 or 에러난 파드 한번에 지우기"
categories: programming
tags: devops
comments: true
---

완료된 pod들이 completed, 혹은 error 상태로 남아있는데 더이상 볼일이 없어서 한번에 청소하고싶을때가있다. 그럴때는 아래의 명령어를 입력해주면 된다. 

completed, error인 파드 목록 보기 

```bash
# 성공한 파드 
kubectl get pods --field-selector=status.phase==Succeeded
# 실패한 파드
kubectl get pod --field-selector=status.phase==Failed
```

completed, error 인 파드 한번에 삭제하기

```bash
# 성공한 파드 삭제
kubectl delete pods --field-selector=status.phase==Succeeded
# 실패한 파드 삭제 
kubectl delete pod --field-selector=status.phase==Failed
```