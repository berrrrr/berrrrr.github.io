---
layout: post
title: "OSX에서 특정버전 node 설치하기"
subtitle: "OSX에서 특정버전 node 설치하기"
categories: programming
tags: frontend
comments: true
---

💡 OSX에서 이미 최신버전으로 node를 설치한 경우, 이를 삭제하고 이전 특정 버전으로 설치하는 방법을 알아보자.

1. 현재 노드 버전 보기

```bash
$ node -v
```

2. 사용 가능한 노드 버전 확인

```bash
$ brew search node
```

3. 현재 버전과의 연결 해제

```bash
$ brew unlink node
```

4. Node 16버전 설치 예시

```bash
$ brew install node@16
```

5. 설치된 버전을 연결

```bash
brew link node@16

# 잘안된다면 강제연결
brew link --overwrite node@16
```

필요에 따라 ~/.zshrc에 추가해주어야할 수도 있음

```bash
echo 'export PATH="/opt/homebrew/opt/node@16/bin:$PATH"' >> ~/.zshrc
```