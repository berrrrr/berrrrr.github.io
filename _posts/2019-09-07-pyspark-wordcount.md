---
layout: post
title: python spark wordcount 해보기
subtitle: python spark wordcount 해보기
categories: datascience
tags: spark
comments: true
---

## python spark wordcount 해보기

```
from __future__ import print_function

import sys
from operator import add

from pyspark.sql import SparkSession


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: wordcount <file>", file=sys.stderr)
        sys.exit(-1)

    spark = SparkSession\
        .builder\
        .appName("PythonWordCount")\
        .getOrCreate()

    lines = spark.read.text(sys.argv[1]).rdd.map(lambda r: r[0])
    counts = lines.flatMap(lambda x: x.split(' ')) \
                  .map(lambda x: (x, 1)) \
                  .reduceByKey(add)
    output = counts.collect()
    for (word, count) in output:
        print("%s: %i" % (word, count))

    spark.stop()
```


## 실행
```
python wordcount <file>
```


참고
https://github.com/apache/spark/tree/master/examples/src/main/python
여기에 pyspark 관련 예제 소스들 다 나와있음