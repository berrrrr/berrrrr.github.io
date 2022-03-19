---
layout: post
title: "[Vue] Vue-Cli로 Vue 시작해보기"
subtitle: "[Vue] Vue-Cli로 Vue 시작해보기"
categories: programming
tags: frontend
comments: true
---

💡 기존에는 parcel사용하서 번들링하고 vue@cli 는 익히기 번잡스럽다고 생각되어서; 사용하지 않았었는데, vue@cli 사용도 알고보면 쉽다. 알아보자 (아래 설정은 히스토리모드 (url에 # 안들어가는) 버전임)


# 1. node.js, npm, yarn최초설치

```bash
# node.js, npm 설치
$ brew install node

# yarn 설치
$ npm install --global yarn
```

# 2. node.js, npm 업그레이드

!! cli 3.x 이상은 node.js 버전 8.9 이상 필요

```bash
# update node.js and npm
$ npm install -g node --force
$ npm install -g npm --force

$ node -v 
v15.4.0
$ npm -v
6.14.10
```

# 3. vue-cli 설치

```bash
$ npm install -g @vue/cli
or
$ yarn global add @vue/cli

$ vue --version
@vue/cli 4.5.9
```

vue-cli 내부에 webpack이 내장되어있어서 내가 webpack 몰라도 알아서 다 번들링해줌! 

# 4. frontend 기반디렉토리 생성

```bash
$ vue create frontend
```

이렇게 치면 프로젝트 루트밑에 frontend 폴더가 생성되면서 vue환경 관련 파일들이 좌르륵 자동으로 생성됨

![vue-cli](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/vue-cli.png?raw=true)

이정도가 처음 세팅으로 무난하다. (Typescript는 vue 3.x부터 적용. 차후에 3.x 도입할때 하는것을 추천) 

# 5. vue.config.js 설정

```json
module.exports = {
  /* static으로 모든 resource 복사 */
  outputDir: "../src/main/resources/static",

  /* templates로 인덱스 페이지 복사 */
  indexPath: "../templates/index.html",

  devServer: {
    port:8080, /* devServer(frontend) 포트를 8080으로 설정 */
    proxy: {
      '/api': { /* /api로 시작하는 url의 경우 backend로 proxy해줌 */
        target:"http://localhost:8081"
      }
    }
  },
  lintOnSave: false
}
```

이렇게 설정해놓으면 webpack dev server는 8080으로 spring boot server는 8081로 띄우고, /api 로 시작하는 path가 8080으로 들어오면 8081로 proxy해줌(개발시 매우 용이)

당연히 application.yml에 서버포트는 8081로 해줌

# 6. maven frontend plugin

이렇게 설정해주면 mvn install 할때 frontend코드도 빌드가능

```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.8.0</version>

    <configuration>
        <nodeVersion>v15.4.0</nodeVersion>
        <yarnVersion>v1.22.10</yarnVersion>
        <workingDirectory>${project.basedir}/frontend</workingDirectory>
        <installDirectory>${project.build.directory}</installDirectory>
    </configuration>

    <executions>
        <execution>
            <id>install-frontend-tools</id>
            <goals>
                <goal>install-node-and-yarn</goal>
            </goals>
        </execution>

        <execution>
            <id>yarn-install</id>
            <goals>
                <goal>yarn</goal>
            </goals>
            <configuration>
                <arguments>install</arguments>
            </configuration>
        </execution>

        <execution>
            <id>build-frontend</id>
            <goals>
                <goal>yarn</goal>
            </goals>
            <phase>prepare-package</phase>
            <configuration>
                <arguments>build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```