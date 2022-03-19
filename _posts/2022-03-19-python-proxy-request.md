---
layout: post
title: "Python에서 proxy 설정하여 http request 날리기"
subtitle: "Python에서 proxy 설정하여 http request 날리기"
categories: programming
tags: python
comments: true
---

Python에서 proxy 설정하여 http request 날리기

```python
import requests

proxies = {
  "http": "http://10.10.1.10:3128",
  "https": "http://10.10.1.10:1080",
}

requests.get("http://example.org", proxies=proxies)
```

위와같은형식으로 프록시서버를 설정해 날릴수있다

근데 위방식으로는 proxy안태울 예외서버를 설정할수가없다. 

아래와같이 os 환경변수를 export하는 형식으로하면 request가 알아서 proxy/nonProxy 구분해서 req 날려주긴한다.

```python
import os
import requests

os.environ['HTTP_PROXY'] = os.environ['http_proxy'] = 'http://http-connect-proxy:3128/'
os.environ['HTTPS_PROXY'] = os.environ['https_proxy'] = 'http://http-connect-proxy:3128/'
os.environ['NO_PROXY'] = os.environ['no_proxy'] = '127.0.0.1,localhost,.local'

r = requests.get('https://example.com')  # , verify=False
```

출처: [https://stackoverflow.com/questions/8287628/proxies-with-python-requests-module](https://stackoverflow.com/questions/8287628/proxies-with-python-requests-module)