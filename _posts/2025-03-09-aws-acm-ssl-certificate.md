---
layout: post
title: "[AWS] Certificate Manager로 SSL 인증서 등록하기"
subtitle: "[AWS] Certificate Manager로 SSL 인증서 등록하기"
categories: programming
tags: devops
comments: true
---

### 인증서 생성

AWS console \> Certi manager \> 인증서 요청 에 들어간다.
퍼블릭 인증서 요청을 선택한다.
내가 구입한 도메인이 example.app 이라고 하면 다양한 서브패스를 보호하기위해
정규화된 도메인 이름에 `*.example.app` 을 넣어준다.
나머지는 기본값으로 설정하고 요청 누른다.
검증 대기중 상태의 row가 추가될텐데, 해당 항목에 들어가서 route 53에 레코드 생성 버튼을 눌러준다.
route 53에 해시값으로 자동생성된 CNAME 레코드가 생성되고, 곧있으면 상태가 발급됨으로 변경된다.
[https://velog.io/@wijoonwu/AWS-EC2에-SSL-적용하기-Feat.-ACM-Route53-ALB-Nginx](https://velog.io/@wijoonwu/AWS-EC2%EC%97%90-SSL-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0-Feat.-ACM-Route53-ALB-Nginx)

### 로드밸런서 생성

ec2 \> 로드밸런서  \> **Application Load Balancer 생성 **
- 네트워크매핑 : 연결하려는 ec2가용영역 + 1개더
- 보안그룹 : 연결하려는 ec2 보안그룹과 동일하게 선택
- 리스너 및 라우팅 : target group(대상그룹) 생성해줌.
  - 연결하려는 ec2의 http (80port)
  - 연결하려는 ec2의 https (443 port)
  - 인증서는 위에서 생성한녀석 선택

<details>

<summary>최종 이런 모양</summary>

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/aws-acm-ssl-certificate/01.png?raw=true)

![AWS ACM 인증서 선택 화면](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/aws-acm-ssl-certificate/02-sanitized.png?raw=true)

</details>


### target group을 80만 여는경우

왜그런지모르겠는데 443 포트를 따로 열어서 받는경우 request가 정상적으로 안들어옴..

<details>

<summary>실패한 conf</summary>

  ```bash
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;

    upstream backend {
        server backend:8081;
    }

    server {
        listen 80;
        server_name api.example.com;
        return 301 https://api.example.com$request_uri;   # http로 들어오면 https로 redirect 해주는 부분
    }

    server {
        listen 443;
        server_name api.example.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ~ ^/(swagger|webjars|configuration|swagger-resources|v2|csrf) {
                       proxy_pass http://backend;
                       proxy_set_header Host $host;
                       proxy_set_header X-Real-IP $remote_addr;
                       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                       proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
  ```

</details>

<details>

<summary>성공한 conf</summary>

  ```bash
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    types_hash_max_size 2048;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;

    upstream backend {
        server backend:8081;
    }

    server {
        listen 80;
        server_name api.example.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ~ ^/(swagger|webjars|configuration|swagger-resources|v2|csrf) {
                       proxy_pass http://backend;
                       proxy_set_header Host $host;
                       proxy_set_header X-Real-IP $remote_addr;
                       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                       proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
  ```

</details>

nginx.conf 설정은 저렇게 때리고
targetgroup은 80포트로만 만든다음에
https , http 리스너 전부 targetgroup 80포트에만 연결해주니까 드디어 정상적으로 돌아감.
젠장 이걸로 삽질 하루웬종일했네..
