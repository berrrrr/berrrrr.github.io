---
layout: post
title: "[Docker] Docker Compose 명령어 정리"
subtitle: "[Docker] Docker Compose 명령어 정리"
categories: programming
tags: devops
comments: true
---

> ** 기본적인 docker-compose 명령어 정리**

서비스 풀받고 하나만 재실행하기

```python
docker-compose pull [서비스명]
docker-compose up -d --no-deps [서비스명]
```


Docker Compose는 여러 컨테이너를 정의하고 관리하는 툴입니다. 자주 사용하는 명령어를 **카테고리별로 정리**했습니다.
---
**1️⃣ 컨테이너 실행 및 중지**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose up</td>
<td>docker-compose.yml을 기반으로 컨테이너 실행 (로그 출력)</td>
</tr>
<tr>
<td>docker-compose up -d</td>
<td>백그라운드에서 컨테이너 실행 (Detached mode)</td>
</tr>
<tr>
<td>docker-compose down</td>
<td>실행 중인 모든 컨테이너 및 네트워크 중지 및 삭제</td>
</tr>
<tr>
<td>docker-compose stop</td>
<td>실행 중인 컨테이너만 중지 (삭제 X)</td>
</tr>
<tr>
<td>docker-compose start</td>
<td>중지된 컨테이너 다시 시작</td>
</tr>
<tr>
<td>docker-compose restart</td>
<td>모든 컨테이너 재시작</td>
</tr>
</table>
**💡 예제:** 백그라운드에서 컨테이너 실행

```plain text
docker-compose up -d
```

---
**2️⃣ 특정 컨테이너만 실행 / 중지**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose up -d \[서비스명\]</td>
<td>특정 컨테이너만 실행</td>
</tr>
<tr>
<td>docker-compose stop \[서비스명\]</td>
<td>특정 컨테이너만 중지</td>
</tr>
<tr>
<td>docker-compose restart \[서비스명\]</td>
<td>특정 컨테이너만 재시작</td>
</tr>
<tr>
<td>docker-compose down \[서비스명\]</td>
<td>특정 컨테이너만 삭제</td>
</tr>
</table>
**💡 예제:** jmc-be 컨테이너만 재시작

```plain text
docker-compose restart jmc-be
```

---
**3️⃣ 컨테이너 빌드 / 이미지 관련**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose build</td>
<td>Dockerfile을 기반으로 컨테이너 빌드</td>
</tr>
<tr>
<td>docker-compose build \[서비스명\]</td>
<td>특정 컨테이너만 빌드</td>
</tr>
<tr>
<td>docker-compose up -d --build</td>
<td>컨테이너를 다시 빌드하고 실행</td>
</tr>
<tr>
<td>docker-compose pull</td>
<td>docker-compose.yml의 모든 이미지 최신 버전 가져오기</td>
</tr>
<tr>
<td>docker-compose pull \[서비스명\]</td>
<td>특정 서비스의 최신 이미지 가져오기</td>
</tr>
</table>
**💡 예제:** flag-be 컨테이너만 빌드하고 실행

```plain text
docker-compose up -d --build flag-be
```

---
**4️⃣ 컨테이너 상태 확인**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose ps</td>
<td>실행 중인 컨테이너 목록 확인</td>
</tr>
<tr>
<td>docker-compose logs</td>
<td>실행 중인 모든 컨테이너의 로그 확인</td>
</tr>
<tr>
<td>docker-compose logs -f</td>
<td>실시간 로그 확인 (Follow mode)</td>
</tr>
<tr>
<td>docker-compose logs \[서비스명\]</td>
<td>특정 컨테이너의 로그 확인</td>
</tr>
</table>
**💡 예제:** mysql_db 컨테이너의 로그 확인

```plain text
docker-compose logs mysql_db
```

---
**5️⃣ 컨테이너 삭제**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose rm</td>
<td>모든 컨테이너 삭제 (이미지, 볼륨, 네트워크 유지)</td>
</tr>
<tr>
<td>docker-compose rm -f</td>
<td>강제로 컨테이너 삭제</td>
</tr>
<tr>
<td>docker-compose down</td>
<td>컨테이너, 네트워크 삭제</td>
</tr>
<tr>
<td>docker-compose down -v</td>
<td>컨테이너, 네트워크 + 볼륨까지 삭제</td>
</tr>
</table>
**💡 예제:** 모든 컨테이너 강제 삭제

```plain text
docker-compose rm -f
```

---
**6️⃣ 컨테이너 내부 접속**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker exec -it \[컨테이너명\] bash</td>
<td>컨테이너 내부에서 Bash 실행</td>
</tr>
<tr>
<td>docker exec -it \[컨테이너명\] sh</td>
<td>컨테이너 내부에서 sh 실행 (Alpine 등)</td>
</tr>
<tr>
<td>docker exec -it \[컨테이너명\] mysql -u root -p</td>
<td>MySQL 컨테이너 내부에서 MySQL 접속</td>
</tr>
</table>
**💡 예제:** mysql_db 컨테이너 내부로 접속

```plain text
docker exec -it mysql_db bash
```

---
**7️⃣ 특정 컨테이너 삭제 후 재실행**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker-compose rm -f \[서비스명\]</td>
<td>특정 컨테이너만 삭제</td>
</tr>
<tr>
<td>docker-compose up -d \[서비스명\]</td>
<td>특정 컨테이너만 다시 실행</td>
</tr>
</table>
**💡 예제:** jmc-be 컨테이너만 삭제 후 다시 실행

```plain text
docker-compose rm -f jmc-be
docker-compose up -d jmc-be
```

---
**8️⃣ 네트워크 및 볼륨 정리**
<table>
<tr>
<td>**명령어**</td>
<td>**설명**</td>
</tr>
<tr>
<td>docker network ls</td>
<td>Docker 네트워크 목록 확인</td>
</tr>
<tr>
<td>docker network rm \[네트워크명\]</td>
<td>특정 네트워크 삭제</td>
</tr>
<tr>
<td>docker volume ls</td>
<td>Docker 볼륨 목록 확인</td>
</tr>
<tr>
<td>docker volume rm \$(docker volume ls -q)</td>
<td>모든 Docker 볼륨 삭제</td>
</tr>
</table>
**💡 예제:** 모든 볼륨 삭제

```plain text
docker volume rm $(docker volume ls -q)
```

---
**🚀 실전 예제**
**🔥 1. 다운타임 없이 특정 컨테이너만 다시 실행**

```plain text
docker-compose up -d --no-deps jmc-be
```

📌 **설명:** jmc-be 컨테이너만 다시 실행 (db 같은 의존 서비스는 재시작하지 않음)
---
**🔥 2. 특정 컨테이너의 최신 이미지 가져와서 재실행**

```plain text
docker-compose pull flag-be
docker-compose up -d --no-deps flag-be
```

📌 **설명:** flag-be의 최신 이미지를 가져와서 적용 (MySQL 등 다른 서비스는 영향 없음)
---
**🔥 3. MySQL 컨테이너에서 DB 상태 확인**

```plain text
docker exec -it mysql_db mysql -u root -p1234 -e "SHOW DATABASES;"
```

📌 **설명:** mysql_db 컨테이너 내부에서 데이터베이스 목록 확인
---
**🔥 4. 특정 컨테이너 로그 실시간 보기**

```plain text
docker-compose logs -f flag-be
```

📌 **설명:** flag-be 컨테이너의 로그를 실시간으로 출력
---
**🎯 최종 정리 (자주 쓰는 명령어)**
<table>
<tr>
<td>**상황**</td>
<td>**명령어**</td>
</tr>
<tr>
<td>모든 컨테이너 실행</td>
<td>docker-compose up -d</td>
</tr>
<tr>
<td>특정 컨테이너 실행</td>
<td>docker-compose up -d \[서비스명\]</td>
</tr>
<tr>
<td>컨테이너 중지</td>
<td>docker-compose stop</td>
</tr>
<tr>
<td>특정 컨테이너만 재시작</td>
<td>docker-compose restart \[서비스명\]</td>
</tr>
<tr>
<td>특정 컨테이너 삭제 후 재실행</td>
<td>docker-compose rm -f \[서비스명\] && docker-compose up -d \[서비스명\]</td>
</tr>
<tr>
<td>특정 컨테이너의 최신 이미지 가져오기</td>
<td>docker-compose pull \[서비스명\] && docker-compose up -d --no-deps \[서비스명\]</td>
</tr>
<tr>
<td>특정 컨테이너 로그 보기</td>
<td>docker-compose logs -f \[서비스명\]</td>
</tr>
<tr>
<td>특정 컨테이너 내부 접속</td>
<td>docker exec -it \[컨테이너명\] bash</td>
</tr>
</table>
이제 **Docker Compose 명령어를 효율적으로 활용할 수 있습니다! 🚀**
