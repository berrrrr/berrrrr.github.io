---
layout: post
title: "[MLOps] MIG"
subtitle: "[MLOps] MIG"
categories: programming
tags: mlops
comments: true
---

### 1단계: GPU 설정

**A. GPU 확인 - MIG 비활성화 상태 확인**
만약 NVLink가 구축된 장비라면, `nvidia-smi topo -m` 명령어를 통해 아래 처럼 GPU 간 연결 상태가 `NVXX`의 형태로 나타는 것을 확인하실 수 있습니다.
**B. GPU에 MIG 모드 활성화**

```bash
nvidia-smi -i 0 -mig 1
```

0번 gpu  MIG 활성화
⇒ MIG를 활성화하면 다른 GPU와 NVLink 연결이 끊기고  PCIe기반으로 변경됨
**C. GPU 인스턴스(GI) 생성**
GPU에 MIG 모드를 활성화한 이후, 가장 먼저 해야 할 일은 GPU 인스턴스를 생성하는 것입니다. 이 인스턴스는 MIG를 통해 물리 GPU를 논리적으로 분할한 단위이며, 실제로 워크로드가 올라갈 수 있는 기반이 됩니다.
생성 가능한 인스턴스 유형은 다음 명령어를 통해 확인할 수 있습니다:

```bash
nvidia-smi mig -lgip
```

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/nvidia-mig-on-kubernetes/01.png?raw=true)

출력 예시는 위와 같으며, 각 인스턴스는 `Ng.Mgb` 형식으로 표기됩니다. 여기서 `N`은 SM 단위(GPU 코어 수), `M`은 메모리 크기(GB 단위)를 의미합니다.
예를 들어, `1g.10gb`는 GPU 전체를 7등분 했을 때 그중 하나에 해당하는 인스턴스이며, 10GB의 메모리와 1/7의 SM을 제공합니다. H100 기준으로는 SM을 최대 7개까지 나눌 수 있습니다. 각 인스턴스 타입의 오른쪽에는 Free/Total 개수가 표기되어 있어 현재 사용 가능한 인스턴스 개수를 확인할 수 있습니다.

다음 명령어는 3g.40gb MIG 인스턴스(Profile ID 9)를 0번 GPU에 생성하는 명령어입니다.

```bash
nvidia-smi mig -cgi 9 -i 0
```

- `cgi 9`는 **MIG 프로파일 ID 9**, 즉 **3g.40gb**를 의미합니다.
- `i 0`은 **0번 GPU**에 인스턴스를 생성하겠다는 뜻입니다.
또한, GPU 인스턴스는 최대 7개까지 생성할 수 있으며, 서로 다른 프로파일(예: 1g.10gb, 2g.20gb 등)로도 구성 가능합니다.
**조합 예시**
- `3g.40gb`: 최대 2개 생성 가능
- `4g.40gb`: 최대 1개 생성 가능
- `3g.40gb + 4g.40gb` 조합은 동시에 사용 가능 (총 SM이 7이기 때문)
즉, 인스턴스를 어떤 순서로 생성하느냐에 따라 남는 자원이 달라질 수 있으므로 주의해야 합니다. 보통은 다음 두 가지 방식으로 많이 나뉘어 사용됩니다.
1. `1g.10gb` 인스턴스 7개 생성 (7-way 분할)
2. `3g.40gb` + `4g.40gb` 인스턴스 조합 (2-way 분할)
 [https://docs.nvidia.com/datacenter/tesla/pdf/MIG_User_Guide.pdf](https://docs.nvidia.com/datacenter/tesla/pdf/MIG_User_Guide.pdf)

### 2단계: ** Kubernetes 컴포넌트 재배포**

Kubernetes를 활용해 GPU 클러스터를 운영할 때는 **`nvidia-device-plugin`****을 반드시 재배포**해야 합니다. 이는 Kubernetes가 GPU 리소스를 정확히 인식하고, MIG(Multi-Instance GPU) 구성이 변경되었을 때 이를 반영하기 위해 필요합니다. 참고로 `nvidia-device-plugin`은 NVIDIA에서 제공하는 디바이스 플러그인으로, GPU를 Kubernetes의 리소스로 노출하고 스케줄링 가능하게 만들어줍니다.
**MIG 활성화를 위한 재배포 방법**
`nvidia-device-plugin`의 환경 변수에 다음과 같이 `MIG_STRATEGY`를 설정해준 후 재배포해야 합니다 ([참고](https://docs.nvidia.com/datacenter/cloud-native/kubernetes/latest/index.html#using-mig-strategies-in-kubernetes))
**MIG 구성 변경 시 처리 방법**
MIG 인스턴스 구성을 변경하면 (예: 7등분 → 통합 → 2등분), `nvidia-device-plugin`이 이를 자동으로 반영하지 않습니다. 하지만 **플러그인을 재배포할 필요는 없고**, 단순히 **파드를 재시작**하면 새로운 구성이 반영됩니다:

### **3단계 : 모니터링 셋업**

정답은 **`dcgm-exporter`****를 활용하는 것**입니다. Kubernetes 기반으로 GPU 클러스터를 운영 중이라면, 대부분 `dcgm-exporter`를 통해 GPU 상태를 모니터링하고 있을 것입니다. `dcgm-exporter`는 NVIDIA에서 공식 제공하는 Prometheus Exporter로, GPU의 온도, 전력, 메모리 사용량 등 다양한 상태 정보를 **Prometheus 지표 형식으로 수집**해주는 컴포넌트입니다.
하지만 기본 설정 상태에서는 `dcgm-exporter`도 **GPU 단위의 지표**(예: GPU Utilization)만 수집합니다. 따라서 앞서 설명한 `nvidia-device-plugin`과 마찬가지로, **MIG 환경에서도 개별 인스턴스를 인식하고 지표를 분리 수집할 수 있도록 설정을 변경한 후 재배포**해야 합니다.<br><br>이를 위해 `dcgm-exporter`의 컨테이너 실행 시 다음과 같이 인자를 추가해주어야 합니다. ([출처](https://docs.nvidia.com/datacenter/dcgm/latest/gpu-telemetry/dcgm-exporter.html#dcgm-exporter-customization))

```yaml
containers:
  - name: dcgm-exporter
    args:
      - -d
      - f
```

위와 같이 dcgm-exporter를 재배포하면, 이제 더 이상 `DCGM_FI_DEV_GPU_UTIL` 지표는 수집되지 않고, 대신 `DCGM_FI_PROF_SM_ACTIVE`라는 지표가 수집됩니다. 이 지표는 기존의 GPU 사용률 지표처럼 0부터 100 사이의 숫자로 표현되며, MIG 인스턴스별 SM 사용률(SM Active Ratio)을 나타냅니다. 예를 들어 GPU 0번을 두 개의 MIG 인스턴스로 분할한 경우, 각각은 gpu_instance ID를 기준으로 구분됩니다. Prometheus에서는 다음과 같이 각 인스턴스의 SM 사용률이 별도의 지표로 나타납니다:
정리하자면, **MIG 환경에서는 GPU 단위가 아닌 MIG 인스턴스 단위로 지표가 세분화**됩니다.
연산 사용률은 `DCGM_FI_PROF_SM_ACTIVE`, 메모리 사용량은 `DCGM_FI_DEV_FB_USED`, `DCGM_FI_DEV_FB_FREE`, `DCGM_FI_DEV_FB_TOTAL` 지표를 기반으로 모니터링할 수 있습니다.
