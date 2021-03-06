---
layout: post
title: 진짜 RESTful API란 무엇인가? Rest API uniform interface
subtitle: 진짜 RESTful API란 무엇인가? Rest API uniform interface
categories: programming
tags: spring
comments: true
---

# Rest API uniform interface
Uniform Interface(일관된 인터페이스)란, Resource(URI)에 대한 요청을 통일되고, 한정적으로 수행하는 아키텍처 스타일을 의미합니다. 이것은 요청을 하는 Client가 플랫폼(Android, Ios, Jsp 등) 에 무관하며, 특정 언어나 기술에 종속받지 않는 특징을 의미합니다. 이러한 특징 덕분에 Rest API는 HTTP를 사용하는 모든 플랫폼에서 요청가능하며, Loosely Coupling(느슨한 결함) 형태를 갖게 되었습니다.

## identification of resources
리소스가 uri로 식별되면 된다

## manipuliation of resource through representation
When making a request for a resource the server responds with a representation of the resource. This representation captures the current state of the resource in a format that the client can understand and manipulate. Abstractly the representation is a sequence of bytes along with metadata describing those bytes. This metadata is known as the media type of the representation. Typical API examples are HTML, JSON, and XML. Because the server sends a representation of the resource it is possible for the client to request a specific representation that fits the client’s needs. For example, a client can ask for the JSON representation of a resource or the XML representation of the resource. The server may provide this representation if it is capable of doing so. This concept is called content negotiation. You can use content negotiation in your API to allow multiple clients to access a different representations of the resource from the same URL.  
리소스를 요청할 때 서버는 리소스를 표현하여 응답한다. 이 표현은 클라이언트가 이해하고 조작할 수 있는 형식으로 리소스의 현재 상태를 캡처한다. 사실상, 표현은 그러한 바이트를 설명하는 메타데이터와 함께 바이트의 순서다. 이 메타데이터는 표현의 미디어 유형으로 알려져 있다. 대표적인 API 예로는 HTML, JSON, XML이 있다. 서버가 자원의 표현을 보내기 때문에 클라이언트가 클라이언트의 요구에 맞는 특정 표현을 요청할 수 있다. 예를 들어 클라이언트는 리소스의 JSON 표현 또는 리소스의 XML 표현을 요청할 수 있다. 서버는 그렇게 할 수 있는 경우 이 표현을 제공할 수 있다. 이 개념을 콘텐츠 협상이라고 한다. API에서 콘텐츠 협상을 사용하여 여러 클라이언트가 동일한 URL에서 다른 리소스 표현에 액세스할 수 있도록 할 수 있다.  

e.g  
```
GET /orders/12345
Accept: text/plain
```
위와 같이 요청시 -> plain text로 response

```
GET /orders/12345
Accept: application/json
```
위와 같이 요청시 -> JSON으로 response

## self-descriptive message
The representations served by a RESTful system contain all of the data required by the client to understand and act on the resource.
클라이언트가 resource를 가지고 어떤 일을 수행할때 필요한 모든 데이터가 응답되어야함.   
보통 안에 profile(docs) 링크를 명시하는식으로 구현.  


## Hypermedia As The Engine Of Application State(HATEOAS)
--> 거의 모든 rest api에서 지키지못함.
어플리케이션의 상태가 하이퍼링크를 통해서 항상 전이가 되어야함.
스프링에서는 spring-boot-hateoas 패키지로 좀 편하게 구현 가능. 

e.g  
github API를 보면 (https://developer.github.com/) HATEOAS를 가장 잘 지키고있다. 
```
{
  "timeline_url": "https://github.com/timeline",
  "user_url": "https://github.com/{user}",
  "current_user_public_url": "https://github.com/octocat",
  "current_user_url": "https://github.com/octocat.private?token=abc123",
  "current_user_actor_url": "https://github.com/octocat.private.actor?token=abc123",
  "current_user_organization_url": "",
  "current_user_organization_urls": [
    "https://github.com/organizations/github/octocat.private.atom?token=abc123"
  ],
  "security_advisories_url": "https://github.com/security-advisories",
  "_links": {
    "timeline": {
      "href": "https://github.com/timeline",
      "type": "application/atom+xml"
    },
    "user": {
      "href": "https://github.com/{user}",
      "type": "application/atom+xml"
    },
    "current_user_public": {
      "href": "https://github.com/octocat",
      "type": "application/atom+xml"
    },
    "current_user": {
      "href": "https://github.com/octocat.private?token=abc123",
      "type": "application/atom+xml"
    },
    "current_user_actor": {
      "href": "https://github.com/octocat.private.actor?token=abc123",
      "type": "application/atom+xml"
    },
    "current_user_organization": {
      "href": "",
      "type": ""
    },
    "current_user_organizations": [
      {
        "href": "https://github.com/organizations/github/octocat.private.atom?token=abc123",
        "type": "application/atom+xml"
      }
    ],
    "security_advisories": {
      "href": "https://github.com/security-advisories",
      "type": "application/atom+xml"
    }
  }
}
```

출처 https://sookocheff.com/post/api/how-rest-constraints-affect-api-design/