---
layout: post
title: Flying Large Constellations using Automation and Big Data (2016)
subtitle: Flying Large Constellations using Automation and Big Data (2016)
categories: datascience
tags: paper
comments: true
---


## Flying Large Constellations using Automation and Big Data (2016)
빅데이터와 자동화를 이용한 대규모 인공위성그룹(satellite constellation) 운영   

## Author
Gilles Kbidy1  
L-3 Communications Telemetry & RF Products, San Diego, CA, 92123

## Abstract
Over the last few years, the space industry has seen an emerging trend in the number and size of commercial constellations launched to meet new consumer demands, especially in lower earth orbits where optical imagery or communication satellite fleets are growing rapidly. Regardless of the mission, the requirements to manage and fly these constellations are transforming control centers across the world to be more scalable, adaptable and able to embrace modern internet technologies. This paper will present how L-3 Telemetry and RF Products was able to adapt and deploy its InControlTM Command and Control (C2) product to fly some of the largest constellations operating today. Architecture tradeoffs, modern design approaches, performance results and lessons learned will be discussed based on past experience and ongoing/future mission programs. One key aspect of being able to provide scalability for large constellation control centers involves the use of automation at various levels, with the ultimate objective of achieving lights-out operations. Large constellations present interesting automation challenges that must be addressed for all phases of the mission lifecyle. We will review best-practice automation strategies and techniques to manage these large numbers of satellites, and identify where traditional methods are no longer practical. In this environment, satellite control becomes a truly passive monitoring activity with operators only getting involved during anomaly resolution or exceptional activities. Another aspect of automation involves data and configuration management. When designed to handle many satellites, the C2 system must be able to effect dynamic changes to its underlying configuration and database system with no service interruption, and L-3 will present proven methods to do so. In addition, we will also focus on the use of Big Data technology to address constellation data archiving requirements and solve large, complex data persistence and availability issues. Many control centers have now embraced Big Data technologies as part of their ground system architecture. Here, we discuss how the InControlTM product uses Big Data as an integral part of its architecture but also as an ideal solution to manage constellation data coming from potentially hundreds of sources. In this context, data from any satellite in the constellation must be properly routed, stored, backedup, tracked and retrievable in near real-time. The data footprint and availability requirements are vastly increased compared to more traditional control centers. Large constellations are becoming an integral part of our everyday life, let’s embrace the new methods and technologies to fly them.  
지난 몇 년 동안, 우주 산업은 새로운 소비자 수요에 맞추기 위해 발사된 상업용 인공위성 그룹의 수와 크기, 특히 ooptical imagery와 인공위성 통신이 빠르게 성장하고 있는 새로운 추세를 보였다. mission에 상관없이, 이러한 인공위성 배치를 관리하기 위한 요구사항은 전세계의 control center를 보다 확장 가능하고 IT 신기술을 적용할 수 있도록 변화하고있다. 본 paper는 거대한 인공위성 그룹을 운영하기 위해 어떻게 control command 및 control product를 적용했는지 설명한다. Architecture tradeoffs, modern design approaches, performance results, lessons learned이 진행중인/진행될 과제에 기반하여 논의된다. large constellation control center에 확장성을 제공할 수 있다는 한 가지 key는다양한 level에서 자동화를 사용하는 것, 궁극적으로는 lights-out operation을 자동화하는것이다. 대형 인공위성 그룹은 mission lifecycle의 모든 단계에서  흥미로운 자동화 과제를 제시한다. 많은 수의 위성을 관리하기 위한 best practice 자동화 전략과 기법을 검토하고, 기존의 방법에서 더 이상 실용적이지 않은 곳을 파악할 것이다. 이 환경에서 위성 제어는 비정상적인 해결이나 예외적인 활동 중에만 운영자가 수동으로 관여하게된다. 자동화의 또 다른 측면인 데이터 구성 및 관리를 포함한다. 많은 위성을 다루도록 설계되었을 때, C2 시스템은 서비스 중단 없이 시스템 기본 구성과 데이터베이스 시스템을 동적으로 수정할 수 있어야하며, L-3는 이에 대한 검증된 방법을 제시할 것이다. 또한, 우리는 인공위성 그룹의 data archiving에 대한 요구 사항을 해결하고 크고 복잡한 데이터의 지속성 및 가용성 문제를 해결하기 위해 Big data technology를 사용하는 데 초점을 맞출 것이다. 현재 많은 제어 센터가 Big data technology를 을 ground system의 아키텍처의 일부로 채택하고 있다. 여기서, 우리는 InControlTM 시스템이 어떻게 빅 데이터를 필수적으로 사용하면서 수많은곳에서 오는 인공위성 그룹의 데이터를 관리하기 위한 이상적인 솔루션으로 사용하는지에 대해 논한다. 때문에 모든 위성으로부터의 데이터는 near real time으로 적절하게 라우팅, 저장, 백업, 추적 및 검색되어야 한다. 기존 Control center에 비해 데이터 설치 공간과 가용성에 대한 요구사항이 크게 증가했다. 인공위성 그룹은  우리의 일상 생활의 필수적인 부분이 되고 있으므로, 위성을 띄울 수 있는 새로운 방법과 기술을 수용하자.

## Introduction
이 논문의 목적은 현대의 control center에서 대규모 인공위성 그룹을 운영하는 여러가지 전략과 기술을 논하는것이다. L-3 Communications Telemetry & RF Product 에서 대규모 인공위성 그룹 운영을 위한 Command and Control InControl 소프트웨어를 배포했다. 여기서는 그에대한 lessons learned와 future project를 논의할것이다. 

## Modern Architecture Solutions and Tradeoffs
### A. Hrdware Infrastructure
Blade server( 한 박스에 서버와 네트워크를 축소시켜 통합하고 운영체제를 사전 설치해 공급) vs Standard Rack server(rack에 서버를 장착해서 사용. 트워크나 디스크, 전원 등의 구성요소가 플러그앤플레이로 작동) 중에 Standard Rack server가 운영에 더 적합하다. (비용 등의 문제때문에)

### B. Virtualization
아래와 같은 장점이 있으므로 VM ware 등의 가상화를 사용
- Faster provisioning
- Hardware-layer abstraction
- Fault-tolerance
- Snapshots
- Higher resource usage

### C. Cloud Computing
Amazon EC2에 서비스 배포

### D. Linux Containers
Docker 등 기술을 가까운 미래에 사용하여 적용할것이다. 

### E. Remote access and security
DMZ에 웹서버를 올려놓고 VPN을 통해 안전한 원격 제어.

## Big Data as a Storage Solution
대형 인공위성 그룹의 다양한 phase로 구성된 lifecycle 데이터를 지원하기 위해  MongoDB, Cassandra, HBase같은 nosql 솔루션을 사용. satellite data 저장에 nosql을 사용하는 것은 satellite ground system industry의 새로운 trend이다. 

### G. Key Features of a Big Data Storage Solution
NoSql database의 key feature는
- Scalability
- Commercial Off-The-Shelf (COTS) hardware
- Replication
- Performance

### H. Data analytics and retrieval
NoSql을 사용함으로써 Hadoop Map Reduce, Spark같은 분석 tool 연동 가능. 과거 데이터를 활용해 constellation 의 potential failure을 예측할수있음. 특히 NoSql은 대규모 데이터에 대한 빠른 검색을 보장. 

## Fleet Operations Automation
full automation of command and control operations는 특히 대형 인공위성 그룹 운영에는 필수적. risk management 와 cost effectiveness 을 위해 반드시 필요. 

### I. Automation and Scheduling across the entire Ground System
All components subject to automation는 scripting  혹은 programming interfaces 가 반드시 필요.  우리가 개발한 시스템은 고객의 요구사항을 매우 쉽게 볼 수 있음.   
특히 대규모 인공위성 그룹에 대한 day-to-day nominal operation은 자동화가 필요.  
health checks, back orbit data dump and upload of any required instructions 같은 작업들은 모두 자동화됨.  
ground asset을 고려하여 자동으로 생성된 schedule은 operational domain에 로드되고 event execution time에 지정된 작업이 자동으로 실행됨.   
AOS (Acquisition of Signal) 과 LOS (Loss of Signal) 사이에 자동으로 동작 가능하며 각 이 과정은 각 mission의 AOS/LOS 에 대해 반복됨.   

### J. Alarm monitoring
Alarm monitoring은 automation의 핵심.  
infra level에서, Nagios같은 상용 모니터링툴로 infra 모니터링하여 alarm, trigger를 자동화함.  
C2 application level에서, satellite feet 모니터링 제공 필요, web base의 alarm, warning 볼 수 있는 모니터링 화면 제공. 

### K. Satellite Procedure Automation
Spacecraft Manufacturer’s factory procedures 자동화. 사전에 입력된 input을 script화 하여 batch automatic execution할수있도록함. (input을 일반화하는데6개월 가량 소요될수있음)  
혹은 Satellite Manufacturers에서 필요한 구체적 작업 내용에 대한 procedure와 trigger를 개발. 높은 수준의 monitoring 필요.   
운영자들이 반복절차를 정의하여 점점 자동화로 바꿔나감. 

### L. Fault-tolerance Automation
back up server를 사용. 보통 three-tier strategy(local main server, redundant server, back up server)를 사용하여 시스템이 중단되었을때 redundant 혹은 back up server가 control할 수 있도록함. (서버 이중화, or 서버 삼중화)

### M. Automation of Database and Configuration Management Activities
update와 upgrade를 단순화 하기 위해 2-tier structure 사용이 필요.    
- single common database : generic definitions
- add-on database :  definitions that are unique to each satellite


### Towards satellite replacement automation
Templates, shared databases or existing missions 은 reuse 가능하므로 new addition에 대한 준비를 최소화 할 수 있음. 제거할때도 마찬가지로 instance를 중지하고 미래에 참조할수있도록 archiving할 수 있음. cloud architecture를 사용하여 Templates, shared databases or existing missions을 필요에따라 추가/재할당 할 수 있음. 

## Conclusion
we presented concepts and recommendations for an architecture that is both scalable and modular for a modern fleet-capable satellite control center.  
대규모 인공위성 제어를 위한 확장가능하고 모듈화된 시스템 아키텍쳐를 제안했다.  