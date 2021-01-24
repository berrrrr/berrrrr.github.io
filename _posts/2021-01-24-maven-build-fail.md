---
layout: post
title: "maven build 실패"
subtitle: "maven build 실패"
categories: programming
tags: spring
comments: true
---

java 버전이 안맞아서 mvn plugin 동작이 안해서 실패하는경우

# 1. 현상

```jsx
[ERROR] Failed to execute goal org.codehaus.mojo:aspectj-maven-plugin:1.10:compile (default) on project demo: Execution default of goal org.codehaus.mojo:aspectj-maven-plugin:1.10:compile failed: Plugin org.codehaus.mojo:aspectj-maven-plugin:1.10 or one of its dependencies could not be resolved: Could not find artifact com.sun:tools:jar:14.0.2 at specified path /Library/Java/JavaVirtualMachines/openjdk-14.0.2.jdk/Contents/Home/../lib/tools.jar -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/PluginResolutionException
[ERROR] 
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <args> -rf :demo
```

이런식으로 mven plugin이 제대로 동작 안하면서 빌드가 실패할때가있음.

# 2. 원인

maven플러그인과 maven이 물고있는 java home의 java version이 맞지 않아 정상적으로 실행이 안되는 상태. 나같은경우는 프로젝트별로 여러 버젼의 자바를 쓰고있었는데, 자바8을 사용하는 프로젝트에서 자바14를 java_home으로 가지고있으면 위와같은 에러가난다.

# 3. 해결

아래와 같은 식으로 java home을 해당 프로젝트 버전에 맞는거로 교체해주면 잘 빌드됨

```jsx
// java8로 변경
export JAVA_HOME=/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home 
// java14로 변경
export JAVA_HOME=/Library/Java/JavaVirtualMachines/openjdk-14.0.2.jdk/Contents/Home
```

❗️ 위 경로는 내 개인pc설정이므로..본인 pc의 jdk위치를 정확히 파악하고 JAVA_HOME 패스를 변경하도록하자.