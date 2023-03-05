---
layout: post
title: "[Argo Events] webhook event source service에 ingress 걸기"
subtitle: "[Argo Events] webhook event source service에 ingress 걸기"
categories: programming
tags: devops
comments: true
---
webhook event source service에 ingress 를 걸어줘야 dns통해서 편하게 웹훅 호출이 가능하다.  
ingress랑 어떻게 연결하는지 알아보자.

## ClusterIP Service

argo workflow에서 webhook event source를 생성하면 service가 자동으로 생성된다

`webhook-eventsource-svc` 라는 이름으로 뜨는데 보면 cluster IP를 물고있다 

포트는 내가 아래 설정한 포트 설정값으로 들어감

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
spec:
	######### k8s service 설정 
  service:
    ports:
      - port: 12000
        targetPort: 12000

	######### 웹훅 설정 
  webhook:
    example:
      port: "12000"
      endpoint: /example
      method: POST
```

서비스가 떴기에 같은 클러스터 내에서는 `http://{서비스명}.{네임스페이스명}:{포트}/{엔드포인트}` 형식으로 호출이 가능하다. 예를들어 `default` 네임스페이스에 위와 같은 이벤트소스를 띄웠다면 `[http://webhook-eventsource-svc.default:12000/example](http://webhook-eventsource-svc.default:12000/example)` 주소로 호출을 할 수 있다.

하지만 내가원하는건 클러스터 외부에서도 도메인주소를 통해 호출할수 있는 웹훅을 원했다

이를위해서는 위 서비스를 물고있는 ingress를 띄워줘야한다. 

ingress는 아래와 같은 설정값으로 띄울 수 있다. 

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webhook-eventsource-ing
  namespace: ml
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/target-type: 'ip' # 반드시 target-type을 ip로 명시 
    alb.ingress.kubernetes.io/healthcheck-path: /
spec:
  rules:
  - host: test.com # 내가사용할host (유효한 host)
    http:
      paths:
      - path: /*
        backend:
          service:
            name: webhook-eventsource-svc
            port:
              number: 12000
        pathType: ImplementationSpecific
  defaultBackend:
    service:
      name: webhook-eventsource-svc
      port:
        number: 12000
```

`annotations` 는 내가 사용하는 환경이 aws라.. alb class를 사용하고있는데 nginx class를 사용한다면 그에 해당하는 어노테이션을 찾아서 설정해주면 될거같다 

저렇게 설정했다면 나는 이제 `[http://test.com/example](http://test.com/example)` 로 workflow webhook을 호출할 수 있게 되었다.! 

## NodePort

사내 특정 클러스터환경에서 clusterIP로 인그레스를 띄웠더니 도메인이 안붙는 현상이 발생..

삽질하다가 플랫폼팀으로부터 들은 청천벽력과 같은 소식.. cni라는놈이 있는데 이게 어떤 구성이냐에 따라서 clusterIP를 사용 못하는 케이스도 있다고한다. 

여튼 그래서 노드포트로 서비스를 다시 띄워야하는데 이게 찾아보니까 웹훅 이벤트소스에서 굳이굳이 service targetport를 지정해줘서 내부적으로 service가 자동으로 뜬거였다. 공부 제대로 안하고 예제만 따라갔더니 크게 과오가왔다. 

그래서 이벤트소스에서 굳이 설정해줬던 service 항목을 지워주자 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: EventSource
metadata:
  name: webhook
spec:
	######### k8s service 설정  --> 지워버린다..^^ 
  #service:
  #  ports:
  #    - port: 12000
  #      targetPort: 12000

	######### 웹훅 설정 
  webhook:
    example:
      port: "12000"
      endpoint: /example
      method: POST
```

이러면 자동으로 서비스가 뜨지 않는다. 따라서 nodeport 타입 서비스를 임의로 띄워준다. 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webhook-eventsource-svc
  labels:
    app: webhook-eventsource-svc
spec:
  ports:
  - port: 12000
    protocol: TCP
  selector:
    controller: eventsource-controller
    eventsource-name: webhook
    owner-name: webhook
  type: NodePort # 중요 
```

이제 nodeport타입 서비스를 물게 ingress를 띄워준다. (target-type: ip 어노테이션은 삭제) 

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webhook-eventsource-ing
  namespace: ml
  annotations:
    kubernetes.io/ingress.class: alb 
    alb.ingress.kubernetes.io/healthcheck-path: /
spec:
  rules:
  - host: test.com # 내가사용할host (유효한 host)
    http:
      paths:
      - path: /*
        backend:
          service:
            name: webhook-eventsource-svc
            port:
              number: 12000
        pathType: ImplementationSpecific
  defaultBackend:
    service:
      name: webhook-eventsource-svc
      port:
        number: 12000
```