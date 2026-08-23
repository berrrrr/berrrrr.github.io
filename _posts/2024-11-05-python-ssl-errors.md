---
layout: post
title: "[Python] SSL 인증서 검증 오류 해결하기"
subtitle: "[Python] SSL 인증서 검증 오류 해결하기"
categories: programming
tags: python
comments: true
---

```python
requests.exceptions.SSLError: HTTPSConnectionPool(host='www.naver.com', port=443): Max retries exceeded with url: / (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1129)')))
```

라고 뜨며 https 스키마 가진 사이트들 호출이 안되는 경우들이잇음

## **Solution**

Just disable the SSL check

```plain text
url = 'https://www.tesco.com/'
requests.get(url, verify=False)

```

### OR

Use Session and Disable the SSL Cert Check

```plain text
import requests, os

url = 'https://www.tesco.com/'

# Use Session and Disable the SSL Cert Check
session = requests.Session()
session.verify = False
session.trust_env = False
session.get(url=url)

```


### OR

```bash
pip install certifi
```

깔아주고
쉘 프로파일에 아래와 같이 설정

```bash
CERT_PATH=$(python -m certifi)
export SSL_CERT_FILE=${CERT_PATH}
export REQUESTS_CA_BUNDLE=${CERT_PATH}
export AWS_CA_BUNDLE=${CERT_PATH}
```


zscaler 인증서 적용시) 회사에서 제공해주는 pem받아서 `/etc/ssl/certs/ZscalerRootCA.pem` 에 넣음

```bash
export CERT_PATH=/etc/ssl/certs/ZscalerRootCA.pem
export CERT_DIR=/etc/ssl/certs/
export SSL_CERT_FILE=${CERT_PATH}
export SSL_CERT_DIR=${CERT_DIR}
export REQUESTS_CA_BUNDLE=${CERT_PATH}
export AWS_CA_BUNDLE=${CERT_PATH}
```


### OR

```javascript
pip install --trusted-host pypi.python.org --trusted-host pypi.org --trusted-host files.pythonhosted.org certifi

python -m pip install --trusted-host pypi.python.org --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip
```


poetry 가 문제인경우

```javascript
poetry config certificates.PyPI.cert false
poetry source add fpho https://files.pythonhosted.org
poetry config certificates.fpho.cert false
```


### OR

```python
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
```

### **OR**


zscaler 인증서 적용 가정
zscaler 의 인증서 내용을 현재 python 에서 사용하고 있는 인증서에 넣어줌.
혹시 모르니 python3 -c "import certifi; print(certifi.where())" 로 어디에 넣는지 확인하고 넣는게 좋아보임

```bash
cat /etc/ssl/certs/ZscalerRootCA.pem >> $(python3 -c "import certifi; print(certifi.where())")
```

안 될 경우

```bash
cat /etc/ssl/certs/ZscalerRootCA.pem >> $(python3 -c "import ssl; print(ssl.get_default_verify_paths().openssl_cafile)")
```


### OR


```bash
pip install pip-system-certs
```


### OR


위에 있는 것들 다 했는데 안 된다면!
REQEUSTS_CA_BUNDLE 을 unset 해보면 될 때도 있음 (효과 확실)

```python
export REQUESTS_CA_BUNDLE=
```
