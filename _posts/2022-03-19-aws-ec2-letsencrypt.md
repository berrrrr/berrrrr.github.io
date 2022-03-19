---
layout: post
title: "[AWS EC2] AWS Let's Encrypt 인증서 갱신"
subtitle: "[AWS EC2] AWS Let's Encrypt 인증서 갱신"
categories: programming
tags: infra
comments: true
---

💡 Let's Encrypt 무료 인증서는 무료답게 3개월마다 인증서를 갱신해줘야한다^^
갱신하는방법을 알아보자

**AWS Linux 2.0 기준**입니다. 

우선 nginx를 멈춰야함 

```bash
sudo systemctl stop nginx
```

httpd 살려줌

```json
sudo systemctl start httpd
```

그 다음 인증서 갱신해줌

```bash
sudo certbot renew
```

위 명령어 쳐서 콘솔창에 아래와 같이 뜨면 인증이 제대로 된것이다

```bash
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/twidy.app.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cert is due for renewal, auto-renewing...
Plugins selected: Authenticator apache, Installer apache
Renewing an existing certificate for twidy.app and www.twidy.app
Performing the following challenges:
http-01 challenge for twidy.app
http-01 challenge for www.twidy.app
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed with reload of apache server; fullchain is
/etc/letsencrypt/live/twidy.app/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all renewals succeeded:
  /etc/letsencrypt/live/twidy.app/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

3개월마다 위와같이 수동갱신이 귀찮으면 크론탭에 등록을 해주자

```bash
$ sudo -i
$ crontab -e
30 2 * * * sudo certbot renew
```

다 갱신됏으면 이제 httpd 죽이고 nginx 를 되살려주면된다

```bash
sudo systemctl stop httpd
sudo systemctl start nginx
```

## lesson learned

열받게 nginx되살리는데 자꾸 아래와같이 80,443포트를 이미 사용하고있다면서 nginx가 되살아나지않는현상이 발생..ㅡㅡ  찾아보니까 apache가 포트를 점거해서 이럴수있다고한다

```bash
sudo apachectl stop
```

이렇게 꺼주니까 해결됐음.....

위 원인 외에 추가로 삽질하시는분들은

```bash
sudo nginx -t
```

요걸로 nginx.conf 에 syntax 오타는 없는지 등등 점검하면좋다