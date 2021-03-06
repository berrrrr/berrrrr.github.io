---
layout: post
title: CHARTing the Future – An Offline Data Analysis & Reporting Toolkit to support Automated Decision-making in Flight Operations (2018)
subtitle: CHARTing the Future – An Offline Data Analysis & Reporting Toolkit to support Automated Decision-making in Flight Operations (2018)
categories: datascience
tags: paper
comments: true
---

## CHARTing the Future – An Offline Data Analysis & Reporting Toolkit to support Automated Decision-making in Flight Operations (2018)
CHARTing the Future - offline data analysis, 위성운영 의사결정 자동화 지원을 위한 reporting toolkit   

## Author
J. Schulster,1, R. Evill2   
LSE Space GmbH, Darmstadt, Hessen, 64293, Germany J. Roggisart3, S. Phillips4, R. Dyer5   
EUMETSAT Darmstadt, Hessen, 64293, Germany and   
N. Feldmann6 Serco Services GmbH, Darmstadt, Hessen, 64293, Germany   

EUMETSAT(European Organisation for the Exploitation of Meteorological Satellites)에서 낸 논문이다. 

## Abstract 
This paper will attempt to present a history of the needs within EUMETSET flight operations for spacecraft health monitoring, performance reporting and lifetime assessment of low-earth orbit missions, and how these needs have evolved with the development of various in-house tools and systems. The factors driving the needs and solutions adopted are discussed, including the storage and visualization satellite telemetry in formats closely following their on-board acquisition, processing and transmission as possible. The advantages and limitations of delegating all possible tasks to ‘software capable’ engineers in the flight control teams are also discussed. The paper gives some examples of how powerful, interconnected satellite and ground data sets can be leveraged for performance and lifetime reporting and analysis, and some ideas on how these features could be used in the future for both existing and development-phase missions.  
이 논문은 EUMETSET에서 low-earth orbit mission에 대한 heath monitoring, performance reporting, lifetime assesment에 대한 needs와 다양한 in-house tools and systems의 개발로 이러한 needs가 어떻게 진화해왔는지를 기록한다. 이러한 needs를 견인하는 요소들과 진행된 solution에 대해 storage와 visualization을 포함하여 이야기한다. software capable에 많은 작업을 위임하는것에 대한 이점과 한계에 대해서도 논한다. 이 논문은 성능보고 및 lifte time 보고를 위해 상호 연결된 satellite 와 ground data set이 얼마나 강력하게 활용될 수 있는지에 대한 몇가지 예와, 이러한 기능이 향후 기존의 혹은 개발 단계인 미션 모두에게 어떻게 사용될 수 있는지에 대한 몇 가지 아이디어를 제시한다.

## Introduction
satellite telemetry data의  오프라인 처리, 해석, 분석 및 표시는 관련 보조 데이터 소스와 결합되어 모든 우주선의 안전하고 지속 가능한 운영에 중요하다.  
보통 earth observation remote sensing mission에서는 각 4000 ~ 10000개 패킷으로 정의된 ECSS PUS표준을 사용한 방식을 사용함.   
처음 개발된 METOP시리즈는 ECSS/PUSS표준과 telemetry architecture를 사용하여 디자인됨.  
이 논문은 low-earth orbit satellite fleet에 대한 보고 및 분석에 대해 직면한 challeng와 발견한 solution에 대해 설명한다. 이 논문은 inhouse tool의 prototype과 위성 상태 모니터링, 분석 및 보고에 대한 요구사항과 이러한 tool을 견인하는 needs와 요구사항의 identification을 다룬다.   
본 논문에서는 METOP(satellite system)에서 Copernicus Sentinel-3로 진화하면서 알게된 lesson을사용자 관점에서 데이터 스토리지 아키텍처의 요구 사항에 따라 설명한다.  
섹션2에서는 CHART와 CHART의 도구, data architecture concept를 다룬다.  
섹션3에서는 PUS mission의 data storage과 CHART라이브러리(functional widgets)을 다룬다.  
섹션4에서는 CHART REPORT TEMPLATE의 기능성과 가용성을 다룬다.  
섹션5에서는 CHART events 와 activity의 컨셉을 다룬다.  
섹션6 미래의 데이터 주도 운영과 프로세스를 다룬다.  
마지막에는 이러한 도구의 잠재적이고 진행중인 향후 기능과 사용에 대한 결론을 다룬다.  

## origins of CHART
EUMETSAT는 spacecraft housekeeping data를 신속하고 안정적으로 분석할 수 있는 데이터 보관 및 검색 시스템의 필요성을 느낌. space database가 성숙함에 따라 data를 재처리할수있을만큼 유연하고 data manipulation과 automatic reporting을 할 수 있는 scripting interface를 제공하는 시스템이 필요해졌음.  
데이터 재처리를 위해, METOP 패킷을 TM frame에서 추출하여 timestamped raw binary format 파일로 저장했다.  
데이터 접근을 위해 MATLAB으로 스크립트를 작성했고 이를 통해 통계 등등의 작업을 진행했다.  
패킷 기반 아카이빙은 빠른 검색, 직관적인 추적성, 빠른 업데이트 등이 많은 장점을 가지고 있어서 FCT는 다른 패킷데이터에도 확장을 하기 시작했다.  
처음에 이 작업들은 Mysql datasource를 MATLAB plugin으로 연계하여 진행하였다.  
이후 Oracle로 데이터를 이관하고, 각 packet은 oracle table을 가지고 추가될때마다 table에 row를 추가함. 데이터 저장은 XML을 분석하여 이루어졌다. 


데이터 저장 및 검색에대한 전체적인 개념은 다음의 그림과 같다.   
![161_1](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/161_1.png?raw=true)  
다음 단계는 저장된 데이터에 간단하고 직접적인 액세스를 허용하는 사용자 인터페이스를 구현하는 것이었다. 더 쉽게 접근할 수 있게 원격 측정 파라미터를 선택할 수 있는 플로팅 도구를 사용하여 웹 인터페이스를 개발하였다.  
plot을 빠르게 생성할 수 있고, 통계 계산(각 orbit에 대한 평균, 최소, 최대 및 표준 편차)과 지리 위치 데이터(감지 시간의 경도, 위도)를 포함하여 추가적인 처리를 위해 이미지 또는 CSV 형식 파일로 내보낼 수 있다.   
GUI로 eclipse information의 시계열데이터를 overlay하는 등 향상된 plot 기능을 가지며, 해상도와 검색 기간을 설정해 데이터를 dynamic sub-sampling할 수 있다. 
![161_2](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/161_2.png?raw=true)  

report의 자동생성, data의 시각화를 위해 CHART를 만든거고, 이 기능을 위해  "widget(위젯)" 이라는 기능을 도입했다. 위젯으로 다양한 형식, 테이블로 데이터를 plot할 수 있다. 위젯은 xml로 작성되며 html상에서 사용자가 시각화된 위젯을 볼 수 있다.  
CHART를 만드는 일련의 작업들은 Scheduler를 통해 돌아가며 Scheduler 역시 XML file로 작성된다.  
CHART는 새로운 개발을 비교적 쉽게 구현할 수 있도록하며 Derived Tables 또는 Events로 데이터 처리 알고리즘을 쉽게 만들 수 있는 기능을 제공한다. 대부분의 CHART 코드는 Python으로 개발되었으며 사용자는 운영 데이터베이스에서 read하고 테스트 데이터베이스에 write하는데 이를 통해 쉽게 새로운 알고리즘을 개발하여 원하는 방식으로 데이터를 처리할 수 있다. 때문에 새로운 알고리즘을 개발하고, 시험하고, 검증하고, 배포하는 데 걸리는 시간이 비교적 짧다. 

## Data storage for PUS Missions
METOP용으로 개발된 CHART의 instance는 모든 satellite에 적용할 수 있는 많은 일반적인 특징을 다루었고, 패킷 기반 시스템의 주기적 원격측정에 적합한 저장 체계를 가지고 있었다. 단, asynchronous하고 non-fixed한 telemetry for METOP은 CHART가 개발되었을 때 이미 TMREP MySQLTM 데이터베이스에 의해 처리되고있었다. TMREP가 개발되어야 했던 기간에는 그러한 "futrue proofing"이 배제되었고, TMREP를 CHART에 넣거나 다시 개발할만한 동기가 없었다.  
ECSS 패킷 활용 표준에 따라 설계된 우주선에 일반적으로 적용할 수 있는 Prototyping a database architecture for CHART은 EUMETSAT의 모든 2016년 PUS 기반 future mission에 대해 처음 시험되었다. 목표는 housekeeping telemetry data의 ECSS/PUS 아키텍처에 따른 미래의 모든 spacecraft에 대해 최소한의 사용자 정의 없이 일반적으로 사용할 수 있는 data storage schema를 제공하는 것이었다.  decode, format, data를 수집하고 보정하기 위한 모든 resource는 가능한 수정하지 않고 재사용할 수 있어야 한다.  
CHART의 METOP 사용 경험을 통해 위성으로부터 수신한 raw telemetry data의 장점을 최대한 살린 data storage architecture의 분명한 장점을 확인할 수 있었다. mnemonic codes, on-board acquisition architecture, source packet structure 등을 적용하여 telemetry data의 무결성과 완전성을 보장할수있게 노력하였기때문이다.   
extensive prototyping을 통해  cyclic 과 non-cyclic 또는 asyncronous telemetry packet 사이에 자연스러운 구분이 존재한다는 것을 발견하고, 이를 각각 고유한 개별 테이블에 저장하였고, 테이블들을 명명 규칙(naming convention)을 사용하여 구분하였다.  
이러한 설계는 몇가지 명백한 장점을 가진다. 1) METOP의 data architecture를 닮았다. 때문에 변경을 최소화하고, 사용자가 따로 정의하지 않고도 resource를 재사용할 수 있다. 2) 높은 data storage 효율성을 가진다. 3) data sensing, storage, routing, formatting or transmission을 할 때 data gap이 상대적으로 줄어든다.  
높은 관심을 받는 데이터는 subsystem에 의해 하위 테이블에 관리되는데, 이를 통해 reporte templet을 만들거나 test할때 더 효율적으로 할 수 있다.   
반대로, 데이터 저장에 대한 이 아키텍처의 일부 단점도 명백하다. 1) PID와 PUS 타입에 기초한 테이블로의 원격 측정의 분할은 비전문 사용자에게는 그다지 직관적이지 않다.  2) error detection에 취약하다. 3) 가변길이 패킷은 예외로 취급되며 따로 table로 관리된다. 


## CHART Report Templates
report는 XML 기반 report templates을 사용하여 생성된다. 이전에 설명한 바와 같이 각 임무에 대해 Core CHART library 또는 user-defined library에 정의된 widget을 사용한다. 위젯은 absolute times, relative times, ‘mission events’ 또는 CHART 이벤트 표에 정의된 이벤트 발생(예: spacecraft mode change, equipment status change, end of an operational activity or a satellite reconfiguration) 에 근거하여 report template 내에서 실행되도록 정의할 수 있다. 운영 및 지상 모니터링 한계 세트 등 위위젯 지원에 필요한 데이터 세트를 위성 운영 데이터베이스 테이블에서 자동으로 수집하거나 추출할 수 있다.  
XML로 작성된 보고서 '템플릿'은 특정 subsystem이나 instruments에 대한 전문 지식을 바탕으로 flight control team 내의 서브시스템 엔지니어들에 의해 정의, 프로토타입화 및 검증된다. 보고서 템플릿은 필요에 따라 다른 팀이나 다른 미션에서 재사용할 수 있으며 필요에 따라 조정할 수 있다.  cross-team support는 특정 위젯 사용방법을 공유하여 이루어지며 매우 권장된다. 

### The CHART widget library – development, customization & validation
그래프, 히스토그램, 막대 차트, 등 보고에 대한 가장 일반적인 위젯은 이른바 core library에 포함된다. 문서는 위키 페이지를 통해 온라인으로 제공된다. 보고서 템플릿 내의 위젯을 사용하면 python3에 대한 지식이 필요 없고 XML 코딩 표준에 대한 매우 기본적인 지식만 있으면 된다. 위젯은 mission이나 project 특징에 따라 커스터마이징 가능하다. 


## CHART Events & Activities for PUS-based Missions
이벤트는 원격 측정 또는 파생 매개변수 정의 또는 합성 매개변수 정의를 통해 데이터 지점의 상태 변화를 나타내기 위해 정의될 수 있다.  
ECSS-PUS 기반 임무의 경우,  Service 5 on-board event reports는 activity on-board the satellite의 상태 또는 실행을 나타내는 데 사용되기 때문에 CHART에서 'event'로 정의되도록 한다.  
일반적으로 on-board event를 CHART 이벤트로서 handling하는 방법은 다음과 같이 여러가지 방법이 있다. 1) Core Library widget graphics을 사용해 plot한다. 2) Core library widget에서 이벤트에 비례하여 시작 시간과 종료 시간을 생성하도록 허용한다. 이를 통해 예를 들어 궤도 제어 조작기, 계기 보정 및 오염 제거 활동 이후의 선내 사건과 관련된 특정 보고서를 작성할 수 있다.

## CHARTing the Future - Data Drivien Operations Automation
모든 미래의 EUMETSAT PUS-based satellite missions에 대한  requirements 와 needs사이의 최대 공통성을 확보하기 위한 프로젝트에서, 부분적으로는 새로운 모니터링-분석(ME-MON_A) 요소에  Multi-Mission Environment concept 을 적용하는 노력이 이루어지고 있다.  
need for a tele-command history interface, an event viewer for all PUS Service 5 On-board Event Reports, specific display to cover all variable-length packet telemetry reports 같은 몇가지 공통적인 요소는 이미 명백하다.  
모니터링 및 분석을 위한 특정 data applications울 통해 오프라인 모니터링 기능을 전체 데이터 분석으로 확장할 수 있다.  
ECSS PUS standard의 특성과 spacecraft monitoring and control에 대한 이점은 CHART와 같은 진단 도구들에 의해 다양한 보고와 진단을 목적으로 활용될 수 있다. 추가 처리와 계산을 통해 기존의 analogue plot을 넘어 데이터 분석 능력을 향상시킬 수 있다.  
각 패킷의 알려진 context를 감지, 포맷, 라우팅 및 저장 또는 다운링크 측면에서 활용함으로써, 이들 안에서 각 패킷과 데이터 포인트를 구문 분석할 뿐만 아니라 on-board data handling architecture의 상태를 완전히 문맥화 할 수 있게 된다. 결국 많은 일반적인 FCCT 엔지니어링 작업을 자동화할 수 있다.  
PUS architecture는 본질적으로 위성 유지보수 활동과 같은 현장 계획 이벤트 및 현장 이벤트 보고와 관련하여 "event driven(이벤트 주도형)" 보고에 의존한다. 그러나 ECSS-PUS standards data를 따르는 미션의 경우 이벤트 기반 보고의 개념은 새로운 것이 아니다. 시스템 레벨의 위성 'state model'은 commanding history, on-board event reports 및 housekeeping telemetry의 조합에서 파생될 수 있다. 이를 통해 복잡한 event driven functions과 보고서 기능을 사용할 수 있다.  
PUS telemetry 을 사용한 automated reporting의 미래는 특정 이벤트 집합 또는 특정 PUS service type에 특정한 사전 정의된 function set 을 통해 이벤트에서 실행된다. 여기에는 1) packet type definition에 기반한 일반적인 이벤트 기반 처리 및 보고와 2) 특정 운영 시나리오에 맞게 맞춤화된 맞춤형 이벤트 기반 처리 및 보고라는 두가지 목표가 있다. 

## Conclusions
일반적인 ECSS-PUS 기반 임무에 대한 오프라인 분석 및 보고 도구 시제품 제작 작업에서 몇 가지 결론을 도출할 수 있다. 첫째, 온보드 소프트웨어에 의해 암호화되고 활용되는 데이터 구조를 가능한 한 가깝게 따르는 데이터 아키텍처를 유지함으로써 동일한 업계 최고 PUS 코드-리브리에 기반한 서로 다른 임무에 대한 아키텍처를 최대한 재사용할 수 있다. 데이터 처리, 데이터 스토리지 및 TT&C 서브시스템에서 온보드 이상 발생원을 식별하는 측면에서 데이터 무결성을 극대화할 수 있는 이점이 추가되었다. 마지막 이점은 다른 비행관리팀 직원들 간의 지식 전달을 용이하게 하는 것이다.  CHART의 자체 개발은 운영 중인 오프라인 모니터링 분석 및 위성 성능 및 건강 보고를 위한 성능 좋고 유연하며 미래에 대비할 수 있는 시스템을 제공하고 유지하는 데 성공했음을 입증했다. 개발된 시스템은 EUMETSAT의 모든 미래 우주 자산을 지원하기 위해 MME(Multi-Mission Environment)로 구축될 예정이다.  
운영 자동화를 위한 모델의 훈련과 같은 데이터 분석 및 인공지능을 위한 위성 원격측정 및 기타 데이터 소스의 향후 사용에 있어, 지식 영역의 적절한 분석과 최적화를 위해서는 완전한 데이터 컨텍스트의 보존이 필수적이다.  
추가 작업과 프로젝트는 이상 감지 알고리즘뿐만 아니라 우주 날씨 및 공간 상황 인식과 같은 다른 도메인에 대한 적용 측면에서 데이터 세트의 현재 사용을 넘어설것이다. (예를들어 태양계 충격 감지를 통한 지구에 근접한 환경의 micrometeorite models population). 완전히 일반적인 데이터 아키텍처의 구현은 미래의 많은 임무에서 사용될 수 있는 일반적인 알고리즘과 응용 프로그램의 개발을 촉진할 것이다.  
개발자와 엔지니어 간의 긴밀한 상호작용을 통해 pseudo-AGILE approach을 취하는 개발의 프로토타이핑 단계의 가치는 유의미했지만, 고전적인 'waterfall' 프로젝트 개발 접근법에 대한 이점은 이러한 맥락에서 평가하기 어렵다. 그러한 오프라인 시스템을 위한 향후 오픈 소스 인프라로의 잠재적 이동은 기회와 과제를 모두 제시한다. 아마도 가장 중요하고 논란의 여지가 있는 것은 데이터 내용을 익명으로 만들어 AI 시스템 개발을 위해 데이터 아카이브를 활용할 수 있도록 함으로써 향후 우주 운용 의사 결정의 자동화를 개선할 수 있는 잠재력일 것이다.
