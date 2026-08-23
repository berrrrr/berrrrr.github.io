---
layout: post
title: "[DevOps] Argo Workflow 좀비 프로세스 방지하기 (dumb-init)"
subtitle: "[DevOps] argo workflow 좀비프로세스 방지 (dumb init)"
categories: programming
tags: devops
comments: true
---

```bash
root@update-stock-quote-recent-1708916220-base-template-3147334780:/usr/src/app# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 11:58 ?        00:00:00 /var/run/argo/argoexec emissary --loglevel info --log-format text -- python batch/financial_statement/update_consensus_stock.py
root          29       1 66 11:58 ?        00:00:07 /usr/local/bin/python batch/financial_statement/update_consensus_stock.py
root          31       0  0 11:58 pts/0    00:00:00 bash
root         358      31  0 11:58 pts/0    00:00:00 ps -ef
```

컨테이너에서 발생할수있는 좀비프로세스 문제때문에,
docker file의 entrypoint에 dumb init을 넣어야함

이미 workflow쪽 노운 이슈인데..
[https://github.com/argoproj/argo-workflows/issues/7259](https://github.com/argoproj/argo-workflows/issues/7259)
[https://github.com/argoproj/argo-workflows/issues/9446](https://github.com/argoproj/argo-workflows/issues/9446)

argo-workflow에서 실행되는 프로세스는 pid=1로 실행되지않음. (argo exececutor(emissary)가 1번으로 뜨기 때문)
찾아보니까 emissary는 초기화 시스템이 필ㅇ하지않음
ㄴsigterm 에대한 처리가 3.4.6 이전까지 처리가 안되어있어서 그런듯..?
[https://github.com/argoproj/argo-workflows/issues/10518](https://github.com/argoproj/argo-workflows/issues/10518)

> [https://blog.hyojun.me/4](https://blog.hyojun.me/4)

Error (exit code 1): pods "update-price-1708934700-lm256-base-small-template-3747591106" is forbidden: User "system\:serviceaccount\:ml\:ml-stock-keyword-search" cannot patch resource "pods" in API group "" in the namespace "ml”
