---
layout: post
title: Characterizing Clickbaits on Instagram
subtitle: Characterizing Clickbaits on Instagram
categories: datascience
tags: paper
comments: true
---
## Characterizing Clickbaits on Instagram

Clickbaits : 자극적인 제목으로 인터넷 유저들의 클릭을 유도하여 조회수를 높이는 쓰레기 기사나 광고(신조어)

기존의 광고방지 메커니즘은 텍스트기반이어서 시각적인 sns에는 적용이 어려움. 이미지와 텍스트 관계를 파헤쳐서 시각적sns(instagram)의 Clickbaits의 특성에 대한 새로운 접근법을 개발함. instagram의 Clickbatis의 유행을 조사하고 사용자 경험에 대한 부정적 효과를 조사함. 45만개 instgram post를 조사하고 12,659개 라벨을 수동으로 붙여서 무엇이 사람들로하여금 clickbatis라고 고려하게 만드는지 조사함. content-based feature가 follower 수 같은 meta feature보다 더 중요하다는것을 보여줌. 패션 관련 포스트의 11%가 clickbaits고 이 post들은 지속적으로 많은 해시태그를 동반함. clickbaits가 sns에 매우 널리 퍼져있음을 증명함. 


1) 패션관련 인스타그램 데이터를 2017년7월 2주동안 InstaLooter API를 이용해 수집함 (instalooter는 인스타그램의 사진이나 비디오를 크롤링하는 프로그램임)
https://github.com/althonos/InstaLooter 
https://instalooter.readthedocs.io/en/latest/index.html

2) 수집한 데이터를 crowdFlower라는 사이트에 소싱하여 라벨을 달았고 이 라벨이 hashtag와 일치하는지 조사함. 

3) 유명브랜드 상품사진 / 연관성없는 글귀사진 / 모호한 사진/ 풍경사진 4가지유형의 clickbaits 로 분류

4) clickbatis판별은 visual, text, metafeature 를 활용하여 판별함. 

5) 일반적인 포스트에 비해 clickbait 는 hashtag와 cation간 차이가 다른 양상을 보이며 나타났다. 

출처 
https://ds.kaist.ac.kr/files/published/2018/2018-06-icwsm-instagram-clickbait.pdf
