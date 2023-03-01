---
layout: post
title: "[AWS EC2]  springboot + nginx 사용시 ssl, dns 설정"
subtitle: "[AWS EC2]  springboot + nginx 사용시 ssl, dns 설정"
categories: programming
tags: devops
comments: true
---

일단 나는 docker로 8080 포트를 사용하는 springboot 앱을 띄운상황. (참고로 springboot app은 내장 tomcat을 was로 사용하여 뜬다) 이때 웹서버를 nginx로 사용한다고 하면, dns 나 ssl을 연결할때 어떤 설정들을 해야할지 정리했다. 

내가 사용한 OS는 AWS EC2 의 amazon linux 2 환경이다. 

이 [링크](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/SSL-on-amazon-linux-2.html#letsencrypt)에서 설명하고있는 ssl 인증서 적용을 완료한 상태에서 진행된다. (안하신분들은 요걸 반드시 선행!) 

EC2에서 nginx 설정하는방법은 굉장히 많은 블로그에서 설명하고있긴한데 설정값이 조금씩 다르고 환경도 조금씩 달라서 헤맸음.. 내 상황에서 성공한 설정값을 아래와 같이 정리해둔다. 

## 1. /etc/nginx/nginx.conf

우선 amazon linux 2 의 nginx는 `/etc/nginx/nginx.conf` 파일을 설정파일로 잡고있다. 그러나 대체로 이 파일을 직접 건드리기보다는 `sites-available` , `sites-enabled` 폴더에 커스텀 설정파일을 작성해 넣고, nginx.conf에서는 해당 설정파일을  include 해서 사용하는듯하다. 

```bash
sudo vim /etc/nginx/nginx.conf
```

로 nginx.conf를 수정해주는데, http 항목 밑에 include로/etc/nginx/sites-enabled/*;의 conf파일들을 인클루드한다는 스크립트만 넣어주자. (전문은 아니고 http 항목만 붙여넣기했음. include 부분만 추가해주면됨) 

```bash
http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;  # !!!!! 이부분을 넣어주세요!!! 

    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }
    }
```

## 2. /etc/nginx/sites-available

nginx 폴더안에 sites-available 가 없으면 하나 만들어주자

```bash
sudo mkdir /etc/nginx/sites-available
```

그 안에 아래와 같이 나의 커스텀 conf파일을 만들어준다. 나는 `test.conf` 라는 conf파일을 만들겠음.

그리고 내가 사용하는 도메인은 [example.com](http://example.com) 이라고 가정하자. 

(amazon route53에 기본 도메인 dns설정은 완료한상태여야함~~) 

```bash
server {
       listen 80;
       server_name example.com www.example.com;
       return 301 https://example.com$request_uri;   # http로 들어오면 https로 redirect 해주는 부분 
}
server {
       listen 443 ssl;
server_name example.com www.example.com;
       # Certificate
       ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

       # Private Key
       ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
       location / {
               proxy_pass http://localhost:8080; # 자신의 springboot app이사용하는 포트
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
               }
}
```

`ssl_certificate`, `ssl_certificate_key` 는 이전에 설명한 letsencript로 ssl 인증서받기부분을 완료했다면 저 위치에 인증서, 키가 생성되었을것..  경로중 [example.com](http://example.com) 으로 되어있는 각자 자기 도메인으로 넣어주면됨 

내 springboot app은 8080포트를 사용하고있는 중이라, `proxy_pass` 부분에 `http://localhost:8080` 이 들어갔다. 해당부분은 자신의 스프링부트 앱에 맞게 설정해주면된다. 

## 3. /etc/nginx/sites-enabled

nginx 폴더안에 sites-enabled 가 없으면 하나 만들어주자

```bash
sudo mkdir /etc/nginx/sites-enabled
```

test.conf를 만드는건 sites-available 디렉토리에 만들었는데, 생각해보면 nginx.conf 를 설정할때 우리는 sites-enabled 디렉토리를 include했음. 딱히 이유는 모르겠는데 일반적으로 sites-available에 내가 수정할수있는 파일을 만들고, sites-enabled에 해당 파일을 바라보는 심볼릭링크를 만들어넣는다. (안정성때문인가?) 여튼, 아래와 같이 심볼릭링크를 생성해주자. 

```bash
sudo ln -s /etc/nginx/sites-available/test.conf /etc/nginx/sites-enabled/
```

## 4. nginx 재시작

```bash
sudo systemctl restart nginx
```

위 명령어로 nginx 재시작해주면 브라우저에 [example.com](http://example.com) 을 치는 순간 정상적으로 ssl이 적용된 내 스프링부트앱으로 리다이렉트가 잘된다.