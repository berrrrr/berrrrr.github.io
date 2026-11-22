---
layout: post
title: "[Watch Face Studio] 사진으로 디지털 워치페이스 만들기"
subtitle: "원형 배경, 시간 태그, 상시표시 화면 설정과 WFS 템플릿 재사용"
categories: hobby
tags: [watch-face-studio, python]
comments: true
---

사진을 배경 이미지로 넣고 그 위에 디지털 시계를 배치한다. 제목은 배경에 포함하고, 현재 시각은 기기 시간을 읽는 별도 레이어로 표시한다. 아래 예제는 450 × 450 px 원형 워치페이스를 기준으로 한다.

![원형 사진 배경 하단에 디지털 시각과 두 줄 제목을 배치한 예제]({{ '/assets/img/watch-face-studio/mandalorian-grogu-preview.png' | relative_url }})

## 1. 일반 화면과 상시표시 화면용 이미지 준비

사진 비율을 유지한 채 450 × 450 px 캔버스를 채운다. **중심 (225, 225), 반지름 225 px**의 원으로 표시 영역을 확인한다. 세로 사진은 잘라낼 영역을 위아래로 옮겨 얼굴과 주요 피사체가 원 안에 들어오게 한다.

| 이미지 | 구성 |
| --- | --- |
| 일반 배경 | 사진 하단에 어두운 그라데이션을 적용하고 제목을 넣는다. 예제에서는 높이의 44% 지점부터 아래쪽으로 점차 어둡게 했다. |
| 상시표시 화면(AOD) 배경 | 같은 구도를 검은 바탕에 배치한다. 예제의 불투명도는 사진 12%, 제목 48%다. |
| 미리보기 | 일반 배경 위에 예시 시각을 합성한다. 프로젝트 목록에 표시할 이미지로 사용한다. |

실제 화면에 사용할 두 배경은 **시간 숫자를 비운 PNG**로 내보낸다. 배경에 `10:08` 같은 예시 시각이 들어가면 실제 시간이 바뀌어도 이전 숫자가 남는다.

## 2. 디지털 시계 레이어 설정

1. Watch Face Studio에서 원형 프로젝트를 만들거나 기존 프로젝트를 **Save As**로 복사한다.
2. 일반 화면에 배경 이미지를 추가한 뒤 그 위에 **Digital Clock → Time** 컴포넌트를 배치한다.
3. 시계의 텍스트 필드에 아래 태그를 입력한다. 시와 분을 두 자리로 표시하는 24시간제 형식이다.

```text
[HOUR_0_23_Z]:[MIN_Z]
```

예제에서 시계 영역은 **X=65, Y=268, 너비 320, 높이 83 px**이며 글자 크기는 72, 정렬은 가운데다. 텍스트 영역의 중심이 다이얼 중심선인 X=225에 맞는다. 12시간제를 쓰려면 시 태그를 `[HOUR_1_12_Z]`로 바꾼다. [삼성 개발자 문서의 디지털 시계 설정 예제](https://developer.samsung.com/codelab/watch-face-studio/tag-expression.html)

## 3. AOD 설정 및 동작 확인

AOD 편집 화면에서 어두운 배경 이미지를 선택하고 시계 레이어를 같은 좌표에 배치한다. 일반 화면용 배경과 AOD용 배경은 각 모드에서 하나씩만 보이도록 설정한다.

**Run 미리보기**에서 시간을 `09:59`에서 `10:00`으로 바꾼다. 시와 분이 모두 갱신되고 숫자가 잘리지 않는지 확인한다. 같은 상태에서 AOD로 전환해 배경 밝기와 시각의 가독성을 확인한 뒤 프로젝트를 저장한다. 기존 페이스와 별도로 설치할 때는 빌드 설정에서 앱 이름과 패키지 이름도 구분한다.

## 4. 같은 레이아웃으로 새 페이스 만들기

한두 개를 만들 때는 저장한 프로젝트를 복사하고 **일반 배경, AOD 배경, 미리보기**를 교체하면 된다. 여러 장을 일괄 처리할 때는 Python으로 일반 `.wfs` 프로젝트의 이미지 리소스를 교체할 수 있다.

아래 코드는 **동일한 레이아웃의 템플릿**을 `template.wfs`로 준비한 경우다. 먼저 ZIP 목록을 열고 `honeyface.json`에서 두 배경 레이어의 `image` 값이 가리키는 파일명을 확인한다. 예를 들어 값이 `file://res/drawable-nodpi/portrait.png`라면 ZIP 내부 경로는 `res/drawable-nodpi/portrait.png`다. 템플릿에 따라 이름이 다르므로 아래의 교체 경로를 맞춘다.

```bash
python3 -m zipfile -l template.wfs
```

작업 폴더에 새 배경 두 장과 예시 시각을 합성한 `preview.png`를 각각 450 × 450 px PNG로 준비한다. 아래 예제는 Pillow로 360 × 360 미리보기도 함께 생성한다.

```python
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from PIL import Image

template = Path("template.wfs")
output = Path("photo-dial.wfs")
marker = b"normal_watchface"

if not template.read_bytes().endswith(marker):
    raise ValueError("이 예제는 normal_watchface 형식의 템플릿을 사용한다.")

preview = Path("preview.png")
with Image.open(preview) as image:
    small = BytesIO()
    image.resize((360, 360), Image.Resampling.LANCZOS).save(small, "PNG")

images = {
    "res/drawable-nodpi/portrait.png": Path("active.png").read_bytes(),
    "res/drawable-nodpi/ambient.png": Path("ambient.png").read_bytes(),
    "latest_preview.png": preview.read_bytes(),
    "res/drawable-nodpi/preview.png": small.getvalue(),
    "res/drawable-nodpi/preview_circular.png": small.getvalue(),
}

with ZipFile(template) as source:
    missing = images.keys() - set(source.namelist())
    if missing:
        raise ValueError(f"템플릿 내부 경로를 확인한다: {sorted(missing)}")

    with ZipFile(output, "x") as target:
        for entry in source.infolist():
            data = images.get(entry.filename)
            target.writestr(entry, source.read(entry) if data is None else data)

with output.open("ab") as file:
    file.write(marker)
```

### ZIP은 열리는데 Invalid project file이 뜨는 경우

Watch Face Studio 1.9.9에서 확인한 일반 WFS 프로젝트에는 **ZIP 데이터가 끝난 뒤** `normal_watchface` 식별자가 붙어 있다. ZIP을 재생성하면 이 바이트가 빠진다. 위 코드에서 `ZipFile`을 닫은 다음 바이너리 추가 모드(`ab`)로 식별자를 쓰는 이유다.

생성한 `photo-dial.wfs`를 Watch Face Studio에서 다시 열고 일반 화면과 AOD의 이미지가 각각 교체됐는지 확인한다. 이 스크립트는 템플릿의 빌드 설정을 복사하므로, 별도 앱으로 설치할 경우 새 프로젝트의 패키지 이름을 지정한 뒤 빌드한다.
