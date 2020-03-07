---
layout: post
title: Time Complexity
subtitle: Time Complexity
categories: programming
tags: algorithm
comments: true
---

보통 DS(Datat Structure)가 얼마나 효율적인지 판단할때 사용하는 Runtime Analysis 방법 중, 가장 많이 사용되는것이 Time complexity(시간복잡도) 척도이다. 가장 기본이 되는 연산인 Elementary Operation이 몇 번 발생하는가를 이용하여 측정한다. 

## O(Big-Oh) 빅오 표기법
모든 N >= N0 에 대해 f(N) <= cg(N) 이 성립하는 양의 상수 c와 N0가 존재하면 f(N) = O(g(N)) 이다.  
N0와 같거나 큰 모든 N에 대하여 f(N)이 cg(N)보다 크지 않은것.  
따라서 g(N)을 f(N)의 **upper bound(상한)** 이라고 한다.  
ex) if run-time of an algorithm is 2N^2 + 3N + 5  
then 2N^2 + 3N + 5 <= O(N^2) where 4g(N) = 4N^2, N>=3 

### 자주사용되는 함수의 O 표기법
O(1) : 상수시간
O(logN) : 로그시간
O(N) : 선형시간
O(NlogN) : 로그선형시간
O(N^2) : 제곱시간
O(N^3) : 세제곱시간
O(N^k) : 다항식시간
O(2^N) : 지수시간

## Ω(Big-Omega) 빅 오메가 표기법
모든 N >= N0 에 대해 f(N) >= cg(N) 이 성립하는 양의 상수 c와 N0가 존재하면 f(N) = Ω(g(N)) 이다.  
N0와 같거나 큰 모든 N에 대하여 f(N)이 cg(N)보다 작지 않은것.  
따라서 g(N)을 f(N)의 **lowwer bound(하한)** 이라고 한다.

## Θ(Theta) 쎄타 표기법
모든 N >= N0 에 대해 c1g(N) >= f(N) >= c2g(N) 이 성립하는 양의 상수 c1, c2, N0가 존재하면 f(N) = Θ(g(N)) 이다.  
Θ 표기는 O표기와 Ω 표기가 동일한 경우에 사용.