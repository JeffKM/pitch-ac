# pitch-ac 도메인 용어집 (CONTEXT.md)

> 이 문서는 pitch-ac 프로젝트의 도메인 용어를 정의합니다.
> 구현 세부사항이 아닌, 도메인 개념과 그 경계만을 다룹니다.

---

## 핵심 도메인

### pitch-ac

유럽 5대 리그(EPL, La Liga, Serie A, Bundesliga, Ligue 1)의 경기·순위·선수 데이터를 맥락과 함께 시각화하는 축구 데이터 플랫폼. 모든 숫자에 리그 순위, 백분위, 전년 비교 등 맥락을 자동으로 결합하여 의미를 즉시 해석할 수 있게 한다.

### 5대 리그 (Big 5 Leagues)

EPL(잉글랜드), La Liga(스페인), Serie A(이탈리아), Bundesliga(독일), Ligue 1(프랑스). pitch-ac가 다루는 대상 리그의 전체 범위.

---

## ScoutLab 도메인

### ScoutLab

외부 Streamlit 앱(scoutlab.streamlit.app)에서 제공하는 선수 백분위 랭킹 데이터를 스크래핑하여 pitch-ac에서 재시각화하는 스카우팅 분석 시스템. pitch-ac의 핵심 기능이자 사이트 중심축. 원본 ScoutLab과 동일한 데이터/차트 구조를 유지하되, 메트릭 영어명에 한국어 맥락 부연 + 팝오버 상세 해설을 제공하고, 코믹 디자인 시스템(차트 내부 포함)을 적용하여 접근성과 매력을 높인다.

### 메트릭 (Metric)

선수의 특정 능력을 수치화한 개별 지표. 각 메트릭은 **value**(실제 수치)와 **percentile**(비교 그룹 내 백분위, 0~100)을 가진다. 예: "Shots per 90" — value=3.2, percentile=85.

### 카테고리 (Category)

관련 메트릭들을 묶는 상위 분류. 11개 존재: Final Product, Shooting, Creation, Crossing, Set Pieces, Receiving, Dribbling, Progression, Passing Accuracy, Active Defending, Aerial. 각 카테고리는 자체 평균 백분위를 가진다.

### Mode

메트릭 값의 기준화 방식. **per90**(90분당 정규화 — 출장 시간이 다른 선수 비교에 적합)과 **total**(시즌 누적 — 총 기여도 평가에 적합) 두 가지.

### Adjustment

팀 점유율 보정 여부. **padj**(possession-adjusted — 팀 볼 소유율을 감안한 수치)와 **raw**(보정 없는 원본 수치) 두 가지. 예: 점유율 높은 팀 선수는 raw 패스 수가 높지만, padj로 정규화하면 상대적으로 낮아진다.

### 비교 그룹 (Comparison Position)

백분위를 계산할 때 비교 대상이 되는 포지션 그룹. CB(센터백), FB(풀백), MF(미드필더), AM/W(공격형 미드필더/윙어), FW(포워드) 5개. 같은 선수라도 비교 그룹에 따라 백분위가 달라진다. 예: 살라의 슈팅 — AM/W 대비 85백분위, FW 대비 70백분위.

### 유사 선수 (Similarity)

특정 선수와 메트릭 프로필이 가장 유사한 선수 20명의 목록. 유사도 점수(0~1)로 순위 매김. 스카우팅에서 대안 선수 탐색에 사용.

### 액션맵 (Action Map)

피치 위에 선수의 행동을 라인 좌표로 표현한 시각화. carries(볼 운반), passes(패스), crosses(크로스) 3가지 타입. 각 라인은 progressive(전진적, 핑크)와 threatening(위협적, 사이안)으로 분류된다. 메트릭에서 파생 불가한 고유 데이터.

---

## 매치데이 도메인

### 게임위크 (Gameweek, GW)

리그의 경기 라운드 단위. 각 리그마다 최대 라운드 수가 다르다 (PL: 38, Bundesliga: 34 등).

### 경기 상태 (Fixture Status)

경기의 진행 상태. **SCHEDULED/TIMED**(예정), **IN_PLAY/PAUSED**(진행 중), **FINISHED**(종료), **POSTPONED**(연기). football-data.org 무료 플랜 제약으로 라이브 데이터는 미지원.

### 매치픽 (Match Pick)

매치데이 하위 기능. 유저가 경기 결과를 예측하는 참여형 콘텐츠. buildup-football.com의 매치픽과 유사한 개념. 경기 상세 페이지 내에서 접근.

### 맥락 (Context)

pitch-ac의 핵심 차별점. 모든 수치에 반드시 함께 제공되는 해석 보조 정보. 리그 순위, 포지션 백분위, 전년 비교 중 최소 1개.

---

## 전술 시각화 도메인 (계획)

### CV 파이프라인

중계 영상에서 컴퓨터 비전으로 데이터를 추출하는 처리 과정. 현재 계획: YOLO(선수 탐지) + ByteTrack(추적) + Homography(좌표 변환) + K-Means(팀 분류).

### 추출 레벨 (Extraction Level)

CV 파이프라인에서 추출하는 데이터의 복잡도 단계:

- **L1**: 선수 위치 (x,y 좌표) — 프레임별 22명 위치
- **L4**: 팀 분류 — 홈/어웨이 구분
- **L5**: 포메이션 추론 — 프레임별 진형 판단

L1+L4로 시작하여 안정화 후 L5로 확장.

### 피치맵 (Pitch Map)

CV로 추출한 좌표 데이터를 105×68m 피치 위에 시각화한 추상화된 뷰. 원본 영상 프레임은 포함하지 않는다 — 저작권 리스크 최소화를 위한 의도적 설계.

### 오프라인 배치 (Offline Batch)

경기 종료 후 영상을 확보하여 처리하는 방식. 실시간(니어 리얼타임)과 대비되는 개념. pitch-ac는 "경기 후 전술 분석 리포트" 포지셔닝으로 오프라인 배치를 채택.

### Tactics 섹션

CV 기반 전술 시각화를 제공하는 pitch-ac의 독립 탑레벨 섹션 (장기 목표). News와 별도로 존재. 경기 목록 → 분석 리포트 선택 → 타임라인 재생의 사용자 흐름. 우선순위는 ScoutLab UX 완성 이후.

### News 섹션

이적 뉴스, 팀 소식 등 축구 뉴스를 집약하는 탑레벨 섹션. 트위터/기사 등 외부 소스를 큐레이션하여 표시. Coming Soon 상태에서 점진적으로 구현 예정.
