---
layout: post
title: "[DevOps] Grafana Loki에서 Pod·Container 로그 조회하기"
subtitle: "[DevOps] Grafana loki에서 pod, container 로그 조회"
categories: programming
tags: devops
comments: true
---

{% raw %}

## 개요

Kubernetes 파드 및 컨테이너에서 생성되는 로그는 kubectl logs 뿐만 아니라 Web Console (Grafana) 에서 확인 할 수 있습니다. 이 문서는 Kubernetes Log 를 Grafana 에서 수집하는 원리와 배경을 설명합니다.


> Grafana 에서 LB Access Log 를 확인하는 방법은  를 참고하세요.


**Grafana Endpoint**
- 전사: https://example.com
- 예시 서비스: https://example.com

Grafana 는 인터넷망에서 접근 할 수 있으며 ZPA 를 활성화 한 상태에서만 접근이 가능합니다. 또한 원할한 모니터링을 위해 별도의 긴급대응 절차 없이 어디에서나 ZPA 만 있으면 접근 할 수 있도록 구성되어 있습니다.

> Grafana 접근이 안된다면 GROO 기안 \[사내 시스템 계정 신청서\] 를 신청하여 접근 권한을 발급 받으실 수 있습니다.

## 로그를 활용하기에 앞서서

- **파드 로컬 볼륨에 로그를 남기지 않도록 하기**<br>특별한 경우가 아니라면, 파드의 로컬 볼륨에 로그를 남기는 것을 권장하지 않습니다. 노드의 볼륨은 노드 안에 있는 모든 파드가 공유하여 사용하는 공유 자원입니다. 특정 파드가 많은 볼륨을 사용 하는 경우 파드가 축출되어 서비스 장애로 이어질 수 있습니다.<br>로그를 로컬 파일에 별도로 남기려고 하는 경우 LogRotation 을 올바르게 설정해야합니다. DevOps 팀에서 제한하는 파드의 로컬 볼륨은 최대 2GB 입니다.
- **어플리케이션 로그는 stdout/stderr 로 기록하기**<br>컨테이너에서 권장하는 로그 기록 방식은 stdout 혹은 stderr 입니다. Grafana 에서는 로그 라인별로 stdout,stderr 를 구분하고 있으니 이것을 활용 할 수 도 있습니다.
- **민감 정보는 로그에 남기지 않도록 주의하기**<br>한번 기록된 로그는 삭제하기 어렵습니다. 어플리케이션 로그가 로그 서버에 저장되지 않도록 유의해주세요. 특히 개인정보가 로그에 남지 않도록 유의 부탁드립니다.
- **로그 누락 없음을 보장하지 않음**<br>DevOps 팀은 최대한 너그러운 정책으로 모든 로그를 받으려고 하고 있습니다. 이렇다보니 쏟아지는 로그가 초당 수십만건씩 됩니다. 로그가 유실되지 않도록 최대한 노력하겠지만 유실이 발생 할 수 있음을 양해 부탁드립니다.
- **로그의 순서를 보장하지 않음**<br>성능을 최대화 하기 위해 컨테이너에서 생성된 로그는 Grafana 에서 보여질 때 순서를 보장하지 않습니다.

## 로그 수집 설정하기

이미 클러스터의 모든 노드에 DaemonSet 으로 로그 수집 컨테이너가 설치되어 있어서 개발자가 별도의 설정을 하지 않아도 로그가 수집되고 있습니다. Grafana 에 접근하신 후 Explorer 메뉴에서 데이터 소스 `클러스터:kubernetes` 를 선택하셔서 로그를 확인 할 수 있습니다.

다만 로그를 효율적으로 수집할 수 있도록 가이드를 한번씩 살펴보시고 어플리케이션 별로 적용 부탁드립니다.

### Multiline 설정

노드에 설치된 로그 수집 컨테이너는 로그를 Line 별로 읽은 다음, Kafka 로 전송합니다. Kafka 로 전송된 로그는 변환 절차를 거쳐 각 Grafana 인스턴스의 Loki 로 전송됩니다. 이런 구성은 로그의 순서를 보장하지 않습니다 로그가 여러 줄로 되어있는 경우 하나의 Context 를 파악하기 힘들게 됩니다.
Multiline 설정은 이런 문제를 완벽하게 해결해줍니다. 로그 수집기에게 힌트를 주어서 다음 패턴이 도달하기 전까지는 하나의 로그 행으로 인식하게 만들 수 있습니다.
또한 로그 수집 프로세스에 부하를 감소 시킬 수 있으므로 어플리케이션이 로그를 여러 행에 걸쳐 표현하는 경우 Multiline 을 꼭 설정해주세요.

#### 설정하는 방법

Pod Annotation 에 `co.elastic.logs/multiline` 관련 설정을 넣으면 됩니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  ...
  template:
    metadata:
      labels:
        ...
      annotations:
        co.elastic.logs/multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}|^[[0-9]'
        co.elastic.logs/multiline.negate: 'true'
        co.elastic.logs/multiline.match: 'after'
```


멀티라인 설정에 대한 자세한 내용은 Elastic 문서를 참고하세요.
[https://www.elastic.co/guide/en/beats/filebeat/current/multiline-examples.html](https://www.elastic.co/guide/en/beats/filebeat/current/multiline-examples.html)

### 특정 Pod 의 로그 수집 제거하기

수집되면 안되는 로그나 무의미하게 생성되는 불필요한 로그는 수집에서 제외하여 로그를 효율적으로 사용 할 수 있습니다.

Multiline 과 동일하게 Pod Annotation 에 설정하여 로그 수집 제외를 할 수 있습니다.

```yaml
annotations:
  co.elastic.logs/exclude_lines: '*' # 전체

annotations:
  co.elastic.logs/exclude_lines: sqlalchemy # 1개

annotations:
  co.elastic.logs/exclude_lines: sqlalchemy,debug # 2개 이상
```


- exclude_lines 에 대한 문서<br>[https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-input-container.html#filebeat-input-container-exclude-lines](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-input-container.html#filebeat-input-container-exclude-lines)
- 정규식에 관한 문서<br>[https://www.elastic.co/guide/en/beats/filebeat/current/regexp-support.html](https://www.elastic.co/guide/en/beats/filebeat/current/regexp-support.html)


## 로그 쿼리하기


#### Kubernetes 로그


위에서 말한대로, Grafana 에 접속하여 Explorer 메뉴로 접근한다음 DataSource 에서<br>`클러스터:kubernetes:logfmt` 를 선택하세요.


> loki의 인덱싱, 쿼리 성능 향상을 위해 기존의 라벨 기반의 검색에서 라벨 + logfmt 필드 기반 검색으로 변경되었습니다.<br>사용 방법은 아래를 참고해주세요.

- 로그 라벨
  - `kube_namespace` : 검색하고자 하는 로그의 kubernetes namespace
  - `kind`: 검색하고자 하는 로그의 k8s resource kind
    - deployment
    - replicaset (deployment에 속하는 replicaset의 로그는 deployment를 이용해 검색해주세요)
    - statefulset
    - daemonset
    - cronjob
    - job (cronjob에 속하는 job의 로그는 cronjob를 이용해 검색해주세요)
  - `name`: 검색하고자하는 로그의 리소스 이름
  - `container_name`: pod 내 컨테이너 이름
  - `image_name`: container의 이미지 이름
  - `instance_type`: pod가 속한 노드의 인스턴스 타입
  - `az`: pod가 속한 노드의 AWS Availability Zone
- 로그 필드
  - `pod_name`
  - `instance_id`
  - `hostname`
  - `message`

#### 쿼리 예시

- `foo` namespace의 `bar` deployment의 `baz` container 로그 보기

```bash
{kube_namespace="foo", kind="deployment", name="bar", container_name="baz"}
  | logfmt | line_format `{{.message}}`
```

- **`주의!`** 아래 쿼리는 결과물은 같게 나오지만 위의 쿼리보다 쿼리 시간이 오래걸리고 리소스도 더 많이 사용됩니다!<br>**아래의 빠르고 효율적인 쿼리 작성하는 방법**을 참고해주세요

  ```bash
{kube_namespace="foo", kind="deployment", name="bar"} | logfmt
  | container_name = `baz`
  | line_format `{{.message}}`
  ```

- `foo` namespace의 `bar` statefulset의 `bar-0` pod 로그 보기

```bash
{kube_namespace="foo", kind="statefulset", name="bar"}
  | logfmt pod_name, message
  | pod_name = `bar-0`
  | line_format `{{.message}}`
```

- `foo` namespace의 `bar` deployment의 `baz` container의 pod별 로그 갯수

```bash
sum by(pod_name)
  (
    count_over_time(
      {kind="deployment", kube_namespace="foo", name="bar", container_name="baz"}
        | logfmt [$__auto]
    )
  )
```

- 로그의 일부분을 추출하여 json 으로 파싱하기
  - 필요한 필드만 파싱하도록 설정할 수 있습니다.

```bash
{kube_namespace="monitoring"}
  | logfmt message | line_format `{{.message}}`
  | pattern `<_> : <json>` | line_format `{{.json}}` | json | method = `POST`
```

- pod name에 특정 문자열이 포함된 녀석들 조회하기

```bash
{kube_namespace="ml", image_name="registry.example.com/apps/example-batch:pr-29"} | logfmt pod_name | pod_name =~ `example-batch.*`
```


> 더 많은 쿼리관련 자료 및 함수는 아래 Grafana Loki 문서를 참고해주세요
> - Loki 쿼리 관련:  [https://grafana.com/docs/loki/latest/query/](https://grafana.com/docs/loki/latest/query/)
> - logfmt 포맷 관련: [https://brandur.org/logfmt](https://brandur.org/logfmt)

### 빠르고 효율적인 쿼리 작성하는 방법


Label 필터를 최대한 상세하게 작성해주세요
- Label 필터란?
  - Grafana 쿼리 빌더에서의 상단 `Label filters`
  - Grafana raw 쿼리에서의 맨 첫 `{}` 블록

    ```bash
{kube_namespace="foo", kind="deployment", name="bar"} # << 여기!!!
  | logfmt message | line_format `{{.message}}`
    ```

쿼리 성능이 많이 차이납니다! (시간대 범위가 늘어날수록 차이는 훨씬 커져요)
- 예시: `bar` deployment의 로그를 검색할 때
  - **Bad**

    ```bash
{name="bar"}

# 기존 로깅 구조 기준
{kube_deployment="bar"}
    ```

  - **Good**

    ```bash
{kube_namespace="foo", name="bar", kind="deployment",
  conatiner_name="baz"}
    ```

Loki의 인덱싱과 쿼리는 Label을 기반으로 동작합니다.
여러분들이 쿼리를 날릴때, loki는 빠르게 쿼리 응답을 내놓기 위해, 이를 여러 쿼리로 나눕니다.<br>이 때, 시간과 log에 기록된 label을 기반으로 나누게 되는데, 이러한 동작 방식 때문에 label이 많고, label 값의 unique 값이 너무 많아지면, 나눠야 하는 쿼리도 너무 많아지지만, 불필요한 쿼리 조각들도 많이 생성되기 때문에 되려 쿼리 성능이 하락하고 리소스 사용량도 치솟게 됩니다. (아래 그림 참고)
예를 들어, 로깅 개선 이전에 아래 쿼리를 사용자가 입력했다고 가정하겠습니다.

```bash
{kube_namespace="foo", kube_deployment="bar"}
```


이렇게 되면, 실제로 loki는 아래와 같은 다양한 쿼리 조각들을 만들어 나눠 실행하게 됩니다.

```bash
{kube_namespace="foo", kube_deployment="bar",
    pod_name="bar-asdfawef",
    instance_id="i-aaaaaa", image_name="mysql:5.7"}
{kube_namespace="foo", kube_deployment="bar",
    pod_name="bar-afefw4r3",
    instance_id="i-cccccc", image_name="mysql:8"}
{kube_namespace="foo", kube_deployment="bar",
    instance_id="i-cccccc", image_name="ubuntu"}
```


한눈에 봐도 각 label의 unique 값이 많아질수록, 불필요한 수많은 쿼리가 생성될 것이란 것을 알 수 있습니다.

따라서, pod_name, az, instance_id, hostname 등 사실상 무한대에 가까운 unique 값을 label로 사용할 경우, 검색하는 시간대 범위가 넓어질 수록 해당 시간대 내의 cardinality가 기하급수적으로 늘어나므로, cardinality가 제한적인 라벨 데이터와 비교해서 쿼리 성능의 저하 및 리소스 낭비가 커지게 됩니다.

{% endraw %}
