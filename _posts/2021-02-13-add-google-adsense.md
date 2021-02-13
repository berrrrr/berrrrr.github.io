---
layout: post
title: 블로그에 google adsense 붙이기 
subtitle: 블로그에 google adsense 붙이기 
categories: etc
tags: blog
comments: true
---

블로그에 google adsense 붙이는 방법을 알아보자

## 1. adsense 가입 
제일 먼저 할일은 애드센스에 가입하는 일이다.

[구글 adsense](https://www.google.com/adsense/signup/new/lead?hl=ko&sourceid=aso&subid=ww-ko-et-nelson_adsense&gclid=EAIaIQobChMIjffAkf3m7gIVO8EWBR1PhQG6EAAYASABEgJeN_D_BwE&referer=https://www.google.com/) 요기에 들어가서 내 웹사이트와 이메일주소를 넣고 가입하도록하자.

## 2. review받기
가입하면 사이트 head에 뭔 코드를 넣으라고한다. 
```
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
```
대충 이렇게 생겼다. (언제 어케 달라질지 모르니 구글이 준 코드로 넣자.)  

넣으라는대로 `<head>~</head>` 사이에 코드를 넣고  완료했다고 하면 리뷰상태에 돌입한다.    
대충 1~2주걸린다고 써있는데 내 경우에는 1주일정도 걸렸던거같다.  
웬만해서는 통과하는듯..?? 

## 3. 광고삽입하기
리뷰가 통과되면 **Your site is now ready to serve AdSense ads** 라는 제목의 메일이 온다.  
이제 우리 블로그는 애드센스를 달 자격을 얻게되었다.  
광고를 넣기만하면되는데 조금 막막하다. 어떻게넣을까싶다.  
그런데 놀랍게도 구글이 모든것을 준비해놧다....  
승인된 계정으로 로그인하고 [adsense홈](https://www.google.com/adsense/) 들어가면 애드센스 홈이 열려있다. 아직 광고 게재는 안했지만 수익현황을 볼수있는 대쉬보드도 있다 ㅎ.  
이제 광고를 넣어보자. 좌측 메뉴에서 Ads > Overview 에 들어가면 모든게 끝난다.  
![ads_2](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/ads_2.png?raw=true)
### 3.1 By Site
사이트별 광고를 볼수있는데, 내가 검토받은 사이트가 목록에 떠있다. Edit을 누르면 사이트에 어떻게 광고를 넣을지 자동으로 삽입해서 코드 생성해주는 Auto Ads 라는 기능도 있다. Auto Ads를 키고 Apply to site를 누르면 좌측에서 광고삽입시 내 사이트에서 어떻게 보일지 미리보기도 가능하고, 코드도 생성해준대로 넣어주면된다.

### 3.2 By ad unit
사이트에 맞게 구글에서 맞춤 생성해주는 옵션 말고 내가 수동으로 광고 틀(?)을 생성해서 끼워넣는 방법이다.  
Create new unit 에서 내가 원하는 형식의 광고틀을 생성할수있는데, 보통은 Display ads를 사용하면되고 나도 이걸 사용해서 광고틀을 생성했다.   
내가 원하는 모양이 뭘지 잘 골라서 원하는걸로 선택하도록하자.  
Display ads 로 누르고 들어가면 상단에 ad unit에 대한 이름을 입력할수있다. 아무거나 입력하고,  Square, Horizontal, Vertical 세가지 모양중 내가 원하는 모양을 고르자.   
![ads_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/ads_1.png?raw=true)
여기서도 마찬가지로 어떤 모양이될지 미리보기를 제공한다.   
우측에서 responsive(자동으로 사이즈지정) / fixed(수동으로 사이즈지정) 중 사이즈를 골라서 내가 원하는대로설정할수있다.  
생성되면, 구글에서 내가 선택한 모양대로 client코드와 slot코드를 넣어서 맞춤형 광고 코드를 생성해준다.  
그 코드를 그대로 내 블로그에 넣어주면된다.  