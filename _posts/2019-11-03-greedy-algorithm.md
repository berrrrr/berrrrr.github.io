---
layout: post
title: Greedy Algorithm (Kruskal, Prim, Dajikstra) 비교 (4줄정리)
subtitle: Greedy Algorithm (Kruskal, Prim, Dajikstra) 비교 (4줄정리)
categories: programming
tags: algorithm
comments: true
---

Greedy Algorithm (Kruskal, Prim, Dajikstra)이 무엇인지 알아보고 차이가 무엇인지 비교해보자

## Kruskal Algorithm
1. edge를 오름차순 정렬한다 
2. edge 값이 작은 아이들부터 연결한다
3. cycle이 생긴다면 연결하지않는다
4. 반복하여 최종적으로 MST가 완성된다

## Prim Algorithm
1. 시작점 node를 정한다.
2. 시작점 node에서 가장 edge가 적은 node를 방문한다. 
3. 방문한 node에서 또 가장 작은 edge를 찾아 인접 node를 방문한다.
4. 이런식으로 모든 node를 방문하면 MST가 완성된다. 

## Dijkstra Algorithm
1. 시작점 node를 정한다
2. 시작점 node와 인접한 node를 방문하며 다른 node들과 시작점node 간의 최소 distance를 구한다. 
3. 인접한 node들을 계속 방문하며 최소 distance를 갱신한다. 
4. 모든 node를 방문하고 마지막으로 갱신된 상태가 MST 이다. 