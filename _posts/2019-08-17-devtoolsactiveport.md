---
layout: post
title: DevToolsActivePort file doesn't exist 에러 해결하기
subtitle: DevToolsActivePort file doesn't exist 에러 해결하기
categories: programming
tags: tips
comments: true
---

DevToolsActivePort file doesn't exist 에러를 해결해보자. 
```
selenium.common.exceptions.WebDriverException: Message: unknown error: DevToolsActivePort file doesn't exist 
```

## 원인
chrome webdriver를 사용하는 프로그램 구동시 
```
DevToolsActivePort file doesn't exist
```
위와 같은 에러가 나는 경우가있다.  
구글링해보니 chrome driver가 새 web browser를 초기화할수없어서 그렇다고한다.  

## 해결방법
Chrome driver option에 `--single-process` argument를 추가한다.
```
chrome_options = Options()
chrome_options.add_argument("--single-process")
```

나는 `--single-process` argument 추가로 해결되었는데 이걸로 해결이 안되는경우 `--disable-dev-shm-usage` argument를 추가하는 방법도 있다고한다. 

```
chrome_options = Options()
chrome_options.add_argument("--disable-dev-shm-usage")
```