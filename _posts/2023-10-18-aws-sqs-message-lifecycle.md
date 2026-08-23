---
layout: post
title: "[AWS] SQS 메시지 생명주기"
subtitle: "[AWS] SQS 메시지 생명주기"
categories: programming
tags: devops
comments: true
---

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/aws-sqs-message-lifecycle/01.png?raw=true)


아.. 나는 delete message 안하면 계속 메세지가 살아있는건줄알았는데
consuemr중에 한녀석이라도 message를 소비하면, visibility timeout 이 동작하게되고 이 시간이 지나면 무조건 메세지가 사라지는거였다…
기본값은 30초라고한다 ㅜㅜ
그래서 어떤 녀석이 메세지를 소비하고, 다른녀석이 메세지를 소비하는데까지 시간이 좀 걸릴거같으면 이녀석을 max 12시간까지 늘려줄수있다.

또한 메세지를 아무도 소비하지않더라도 message retention period에 의거해 큐에 최대 14일까지 저장될수있는데, 이녀석은 set queue attributes를 이용하여 설정해줄수있다고한다.
[이 문서](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SetQueueAttributes.html)에서처럼 queue attribute를 설정한다음에 메세지를 보내면 될듯하다.

> [https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-architecture.html)<br>[https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SetQueueAttributes.html](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SetQueueAttributes.html)
