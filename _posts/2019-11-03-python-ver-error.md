---
layout: post
title: spark 실행시 python 버전에러날때
subtitle: spark 실행시 python 버전에러날때
categories: programming
tags: python
comments: true
---

spark 실행시 python 버전에러날때

```
 Python in worker has different version 2.7 than that in driver 3.6, PySpark cannot run with different minor versions.Please check environment variables PYSPARK_PYTHON and PYSPARK_DRIVER_PYTHON are correctly set.
 ```

 스파크 실행시 위와같이 python 버젼에러가 날때

 ## 원인
 spark 환경설정에 python버젼이 명시되어있지 않거나 명시된 버전과 실제 spark를 구동한 python 버전이 다를경우.

 ## 해결방법
프로파일, 혹은 `<spark-dir>/conf/spark-env.sh` 에 아래와같이 python 버젼에대한 spark 환경변수를 export한다. 
```
export PYSPARK_PYTHON=/usr/bin/python3       
export PYSPARK_DRIVER_PYTHON=/usr/bin/ipython
```
