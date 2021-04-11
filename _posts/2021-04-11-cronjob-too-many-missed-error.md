---
layout: post
title: "[k8s]  Cannot determine if job needs to be started 뜨면서 크론잡이 실행되지 않을때"
subtitle: "[k8s]  Cannot determine if job needs to be started 뜨면서 크론잡이 실행되지 않을때"
categories: programming
tags: infra
comments: true
---

1분간격인 크론잡 배치를 하루정도 suspend = true 로 해놓고 꺼놧었는데, 이후 다시 suspend = false로 변경해도 크론잡이 정상적으로 실행이 안되는 현상이 나타남.

대쉬보드에 가보니 이벤트부분에 

```markdown
Cannot determine if job needs to be started: too many missed start time (> 100). Set or decrease .spec.startingDeadlineSeconds or check clock skew
```

라는 메세지가 떠있고, 실행이 안되고있었다..

찾아보니 공식문서에서 크론잡은 마지막 작업으로부터 지금까지 얼마나 많은 배치가 누락되었는지 세어보고 100회이상 누락된걸로 판단되면 잡을 실행하지 않고 위 에러로그를 남긴다는거다.. [>공식문서 : 크론잡의 한계](https://kubernetes.io/ko/docs/concepts/workloads/controllers/cron-jobs/#cron-job-limitations)

이런ㄴ방식으로면 배치주기가 짧은 배치는 맘껏 꺼놓지도 못한다..몇시간만 꺼놔도 누락되는 잡이 금새 100개는 넘으니까..

여기서 해결방식은 `startingDeadlineSeconds` 값을 설정해놓으라고한다. 해당 값을 설정하면 설정된 시간만큼 누락된 잡이 몇개인지를 체크한다고한다. 예를들어 200으로 설정하면 200초동안 누락된 job이 몇개인지를 검사하기때문에 내 경우처럼 suspend를 다시 true로 변경하고 일정시간이 지나면 누락된 job카운팅이 빠질테니까 정상화될 수 있음.