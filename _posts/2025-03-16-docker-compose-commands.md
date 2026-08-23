---
layout: post
title: "[Docker] Docker Compose 명령어 정리"
subtitle: "자주 사용하는 Docker Compose 명령어와 실전 조합"
categories: programming
tags: devops
comments: true
---

Docker Compose를 사용하면서 자주 찾게 되는 명령어를 상황별로 정리했다.

요즘 Docker Compose v2에서는 `docker compose`를 사용한다. 기존의 `docker-compose` 명령도 사용법은 거의 같지만, 아래 예시는 현재 방식인 `docker compose`로 작성했다.

## 특정 서비스의 최신 이미지만 받아서 다시 실행하기

가장 자주 사용하는 조합부터 보면 다음과 같다.

```bash
docker compose pull app
docker compose up -d --no-deps app
```

`app`의 최신 이미지를 받은 뒤, DB 같은 의존 서비스는 건드리지 않고 해당 서비스만 다시 생성한다. 다만 컨테이너가 교체되는 동안 짧은 중단이 생길 수 있으므로 이 명령 자체가 무중단 배포를 보장하는 것은 아니다.

## 1. 서비스 실행 및 중지

| 명령어 | 설명 |
| --- | --- |
| `docker compose up` | 서비스를 실행하고 로그를 현재 터미널에 출력한다. |
| `docker compose up -d` | 서비스를 백그라운드에서 실행한다. |
| `docker compose stop` | 컨테이너를 삭제하지 않고 중지한다. |
| `docker compose start` | 중지된 컨테이너를 다시 시작한다. |
| `docker compose restart` | 실행 중인 서비스를 다시 시작한다. |
| `docker compose down` | 프로젝트의 컨테이너와 기본 네트워크를 중지하고 삭제한다. |

```bash
docker compose up -d
```

## 2. 특정 서비스만 실행하거나 중지하기

명령어 마지막에 Compose 파일에 정의한 서비스 이름을 붙이면 해당 서비스만 대상으로 실행할 수 있다.

| 명령어 | 설명 |
| --- | --- |
| `docker compose up -d app` | `app` 서비스와 필요한 의존 서비스를 실행한다. |
| `docker compose up -d --no-deps app` | 의존 서비스를 건드리지 않고 `app`만 실행한다. |
| `docker compose stop app` | `app`만 중지한다. |
| `docker compose restart app` | `app`만 다시 시작한다. |
| `docker compose rm -fs app` | `app`을 중지하고 해당 컨테이너를 삭제한다. |
| `docker compose down app` | 현재 Compose에서 `app` 컨테이너와 관련 리소스를 내린다. |

현재 Docker Compose는 `down`에도 서비스 이름을 받을 수 있다. 다만 오래된 Compose 환경에서는 지원하지 않을 수 있으므로, 호환성이 필요하다면 특정 서비스 제거에는 `docker compose rm -fs app`을 사용하는 편이 명확하다.

```bash
docker compose restart app
```

## 3. 빌드와 이미지 갱신

| 명령어 | 설명 |
| --- | --- |
| `docker compose build` | Compose 파일에 정의된 이미지를 빌드한다. |
| `docker compose build app` | `app` 이미지만 빌드한다. |
| `docker compose build --no-cache app` | 기존 build cache를 사용하지 않고 빌드한다. |
| `docker compose up -d --build` | 이미지를 빌드한 뒤 서비스를 실행한다. |
| `docker compose pull` | registry에서 모든 서비스의 이미지를 받는다. |
| `docker compose pull app` | `app`의 이미지만 받는다. |

```bash
docker compose up -d --build app
```

## 4. 상태와 로그 확인

| 명령어 | 설명 |
| --- | --- |
| `docker compose ps` | Compose 프로젝트의 컨테이너 상태를 확인한다. |
| `docker compose logs` | 모든 서비스의 로그를 출력한다. |
| `docker compose logs app` | `app`의 로그만 출력한다. |
| `docker compose logs -f app` | `app`의 새 로그를 계속 따라간다. |
| `docker compose logs --tail=100 app` | 최근 로그 100줄만 출력한다. |

```bash
docker compose logs --tail=100 -f app
```

## 5. 컨테이너와 볼륨 삭제

| 명령어 | 설명 |
| --- | --- |
| `docker compose rm` | 중지된 서비스 컨테이너를 삭제한다. |
| `docker compose rm -f` | 확인 질문 없이 중지된 컨테이너를 삭제한다. |
| `docker compose down` | 컨테이너와 Compose가 만든 네트워크를 삭제한다. |
| `docker compose down --remove-orphans` | Compose 파일에서 제거된 orphan 컨테이너도 함께 삭제한다. |
| `docker compose down -v` | 컨테이너와 네트워크에 더해 volume까지 삭제한다. |

`down -v`는 DB 데이터가 들어 있는 volume도 삭제할 수 있다. 개발 환경을 완전히 초기화하려는 상황이 아니라면 실행 전에 대상 volume을 꼭 확인해야 한다.

```bash
docker compose down --remove-orphans
```

## 6. 실행 중인 서비스 내부에서 명령 실행하기

Compose가 관리하는 컨테이너라면 container 이름을 직접 찾기보다 `docker compose exec`를 사용하는 편이 편하다.

| 명령어 | 설명 |
| --- | --- |
| `docker compose exec app bash` | `app` 컨테이너에서 Bash를 실행한다. |
| `docker compose exec app sh` | Bash가 없는 Alpine 계열 컨테이너 등에서 `sh`를 실행한다. |
| `docker compose exec db mysql -u root -p` | `db` 서비스의 MySQL client를 실행한다. |
| `docker compose run --rm app COMMAND` | 일회성 컨테이너에서 명령을 실행하고 종료 후 삭제한다. |

```bash
docker compose exec app bash
```

컨테이너가 Compose 밖에서 실행됐거나 실제 container 이름으로 접근해야 한다면 기존 `docker exec`를 사용한다.

```bash
docker exec -it CONTAINER_NAME bash
```

## 7. 네트워크와 볼륨 확인

다음 명령은 Compose 전용이 아니라 Docker 전체의 network와 volume을 확인하는 명령이다.

```bash
docker network ls
docker volume ls
```

특정 리소스를 삭제할 때는 이름을 명시한다.

```bash
docker network rm NETWORK_NAME
docker volume rm VOLUME_NAME
```

사용하지 않는 volume 전체를 정리하려면 다음 명령을 사용할 수 있지만, 삭제 목록을 먼저 확인하는 것이 좋다.

```bash
docker volume prune
```

## 실전 조합

### 의존 서비스는 유지하고 특정 서비스만 다시 생성하기

```bash
docker compose up -d --no-deps --force-recreate app
```

### 특정 서비스의 최신 이미지를 적용하기

```bash
docker compose pull app
docker compose up -d --no-deps app
```

### 서비스 하나를 삭제한 뒤 다시 실행하기

```bash
docker compose rm -fs app
docker compose up -d app
```

### DB 컨테이너에서 데이터베이스 목록 확인하기

password를 명령어에 직접 적지 않고 prompt로 입력한다.

```bash
docker compose exec db mysql -u root -p -e "SHOW DATABASES;"
```

### 여러 서비스의 로그를 한꺼번에 따라가기

```bash
docker compose logs -f app worker
```

## 자주 쓰는 명령어 요약

| 상황 | 명령어 |
| --- | --- |
| 전체 서비스 실행 | `docker compose up -d` |
| 특정 서비스 실행 | `docker compose up -d app` |
| 특정 서비스만 다시 시작 | `docker compose restart app` |
| 최신 이미지로 특정 서비스 갱신 | `docker compose pull app && docker compose up -d --no-deps app` |
| 특정 서비스 로그 확인 | `docker compose logs -f app` |
| 특정 서비스 내부 접속 | `docker compose exec app bash` |
| 프로젝트 종료 및 컨테이너 삭제 | `docker compose down` |

이 정도만 기억해도 개발 환경에서 Docker Compose 서비스를 실행하고, 갱신하고, 문제를 확인하는 대부분의 작업을 처리할 수 있다.

## 참고 자료

- [Docker Compose CLI reference](https://docs.docker.com/reference/cli/docker/compose/)
- [docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/)
- [docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/)
- [docker compose rm](https://docs.docker.com/reference/cli/docker/compose/rm/)
