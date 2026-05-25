# pitch-ac PRD v3 — 5대 리그 데이터 플랫폼

## 핵심 정보

**목적**: 유럽 5대 리그(EPL, La Liga, Serie A, Bundesliga, Ligue 1)의 경기·순위·선수 데이터를 코믹 스타일 UI로 시각화하는 축구 데이터 플랫폼. **ScoutLab 스카우팅 분석이 사이트의 핵심 중심축**이며, 복잡한 데이터를 쉽고 재밌게 전달하는 것이 목표.
**사용자**: 유럽 축구 팬 — 5대 리그 매치데이·순위 확인, 선수 스카우팅 분석에 관심 있는 사용자.
**슬로건**: "THE ULTIMATE 5-LEAGUE DATA HUB"
**피벗 이력**: PL 전체 데이터 → 맨시티 카툰 팬사이트 → **5대 리그 데이터 플랫폼** (현재).
**핵심 원칙**: ScoutLab 원본과 동일한 데이터/차트 구조를 유지하되, 메트릭 영어명에 한국어 맥락 부연 + 팝오버 해설 제공. 코믹 디자인 시스템을 차트 내부까지 적용하여 접근성과 매력을 높인다.

---

## 사용자 여정

```
1. 홈페이지 (진입점) — ScoutLab 쇼케이스 중심
   ↓ 히어로 + 오늘/이번 라운드 경기 + 5대 리그 순위 한눈에
   ↓ ScoutLab 데이터 스니펫으로 스카우팅 유입 유도
   ↓ (향후) 트렌딩 뉴스, 이번 라운드 베스트 11

2-A. 매치데이 대시보드
   ↓ 5대 리그 날짜별 경기 목록 (킥오프+2.5h 자동 동기화)
   ↓ 경기 카드 클릭 → 경기 상세
   ↓ (향후) 매치픽 — 유저 경기 결과 예측 참여

3. 경기 상세 페이지
   ↓ 프리매치: 팀 폼, H2H, 부상자
   ↓ 포스트매치: 스코어, 골 이벤트, 순위 시뮬레이션

2-B. Ranking (순위표)
   ↓ 5대 리그 팀 순위표 (승점/승/무/패/골득실/폼)
   ↓ UCL/UEL 순위표
   ↓ 선수 순위 (득점/어시/공격포인트/클린시트)

2-C. ScoutLab (스카우팅) ★ 핵심
   ↓ 10개 분석 탭 + 한국어 맥락 부연 + 팝오버 상세 해설
   ↓ 코믹 디자인 차트 (차트 내부까지 코믹 스타일)
   ↓ 5대 리그 선수 60+ 고급 메트릭 기반 스카우팅 분석

2-D. News (이적뉴스/팀소식)
   ↓ 트위터/기사 등 외부 소스 큐레이션
```

---

## 기능 명세

### 1. 핵심 기능

| ID       | 기능명                          | 설명                                                                                                        | 핵심 이유                          | 관련 페이지          |
| -------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| **F201** | 5대 리그 매치데이 대시보드      | 5대 리그 탭 전환 + 게임위크별 전 경기 목록. 경기 상태(NS/FT/POSTP) 배지, 팀 크레스트, 킥오프 시간           | 서비스 진입점, 경기 일정·결과 확인 | 매치데이 대시보드    |
| **F202** | 경기 상세 (프리매치/포스트매치) | 경기 헤더(팀명/스코어/순위) + 탭 구조(Pre-match/Post-match). H2H, 부상자, 팀 폼, 골 이벤트, 순위 시뮬레이션 | 경기 맥락 제공, 데이터 깊이 확보   | 경기 상세 페이지     |
| **F203** | 5대 리그 순위표                 | 리그별 전체 순위표. 순위/팀/경기수/승무패/득실/승점/최근 폼. UCL/UEL/강등권 색상 구분                       | 리그 전체 현황 파악                | Ranking 페이지       |
| **F204** | ScoutLab Player Card            | 선수 검색 + 11개 카테고리별 메트릭 테이블 (백분위 바). 시즌/리그/포지션/모드(P90/Total, PAdj/Raw) 필터      | 선수 데이터 분석의 진입점          | ScoutLab 메인        |
| **F205** | ScoutLab Summary                | 선수의 10개 카테고리 평균 백분위를 수평 바 차트로 요약                                                      | 한눈에 선수 강점/약점 파악         | ScoutLab Summary     |
| **F206** | ScoutLab Radar                  | 10축 레이더 차트 (카테고리 백분위 기반). 비교 모드 시 2중 오버레이                                          | 선수 능력치 시각화                 | ScoutLab Radar       |
| **F207** | ScoutLab Progression            | 시즌별 메트릭 변화 추이 라인 차트. 카테고리/메트릭 드롭다운 선택                                            | 선수 성장/하락 추이 분석           | ScoutLab Progression |
| **F208** | ScoutLab Action Maps            | 피치 위 액션 라인 오버레이 (carries/passes/crosses). progressive=핑크, threatening=사이안                   | 공간 활용 패턴 시각화              | ScoutLab Action Maps |
| **F209** | ScoutLab Scatter                | 5대 리그 선수 산점도. X/Y축 메트릭 선택, 리그별 색상 구분                                                   | 리그 횡단 선수 비교                | ScoutLab Scatter     |
| **F210** | ScoutLab Similarity             | 유사 선수 20명 테이블 (유사도 점수 기반). 상위 3명 하이라이트                                               | 스카우팅 대안 선수 탐색            | ScoutLab Similarity  |
| **F211** | ScoutLab Ranking                | 메트릭별 선수 랭킹 테이블 + 백분위 배지. 카테고리/메트릭 필터                                               | 특정 능력치 기준 최고 선수 식별    | ScoutLab Ranking     |
| **F212** | ScoutLab Compare                | 2선수 나란히 비교: 메트릭 테이블 + 레이더 차트 2중 오버레이. 승자 하이라이트                                | 선수 간 직접 비교                  | ScoutLab Compare     |
| **F213** | ScoutLab Glossary               | 11개 카테고리 × 50+ 메트릭 용어 정의 사전                                                                   | 전문 용어 이해 지원                | ScoutLab Glossary    |

### 2. 지원 기능

| ID       | 기능명             | 설명                                                                                                  | 핵심 이유                        | 관련 페이지      |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------- |
| **F214** | 글로벌 내비게이션  | 데스크탑 상단 헤더(Home/Matchday/Ranking/Scouting/News + 테마 토글), 모바일 하단 탭 바                | 모든 기능 접근 기반 인프라       | 전체 페이지 공통 |
| **F215** | 코믹 디자인 시스템 | Bangers/Permanent Marker 폰트, 3px 검정 테두리, 코믹 컬러 팔레트(cream/skyblue/yellow/red/green/navy) | 브랜드 아이덴티티, 시각적 차별화 | 전체 페이지 공통 |
| **F216** | 기본 인증          | 이메일 회원가입/로그인/로그아웃, Google OAuth (기존 구현 유지)                                        | 향후 개인화 기반                 | 로그인/회원가입  |
| **F217** | 종이 질감 배경     | SVG feTurbulence 노이즈 + 미세 라인 패턴으로 종이 질감 구현. 다크모드 대응                            | 홈페이지 비주얼 차별화           | 홈페이지         |

### 3. 신규 기능 (구현 예정 — 우선순위 순)

| ID       | 기능명                    | 설명                                                                                                     | 우선순위 | 관련 페이지   |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| **F218** | ScoutLab 한국어 맥락 부연 | 메트릭 영어명 유지 + 한국어 괄호 부연 + 팝오버 상세 해설. 번역체가 아닌 맥락적 자연스러운 설명           | 1        | ScoutLab 전체 |
| **F219** | ScoutLab 코믹 차트 디자인 | 레이더/산점도/라인 차트 내부에 코믹 색상 팔레트, 종이 질감 배경, 말풍선 스타일 툴팁 적용                 | 2        | ScoutLab 전체 |
| **F220** | MATCHDAY 자동 동기화      | 킥오프 시간 + 2.5시간 오프셋 기반 Cron 트리거로 경기 결과 자동 반영. 경기 없는 날은 동기화 안 함         | 3        | 매치데이      |
| **F221** | HOME ScoutLab 쇼케이스    | HOME 패널을 ScoutLab 중심으로 재구성. 히어로+경기+5대리그순위+QuickLinks 확정, 뉴스/베스트11 패널은 보류 | 4        | 홈페이지      |
| **F222** | RANKING UCL/UEL 순위      | Champions League, Europa League 순위표 탭 추가 (football-data.org 무료 플랜 지원)                        | 5        | Ranking       |
| **F223** | RANKING 선수 순위         | 득점왕/어시왕/공격포인트/클린시트 등 주요 스탯별 선수 순위 (데이터 적재 완료 후)                         | 5        | Ranking       |
| **F224** | MATCHDAY 매치픽           | 유저가 경기 결과를 예측하는 참여형 콘텐츠. 경기 상세 페이지 내 하위 기능. 인증 필요                      | 6        | 매치데이 상세 |
| **F225** | NEWS 이적뉴스/팀소식      | 트위터/기사 등 외부 소스에서 이적 뉴스, 팀 소식을 큐레이션하여 표시                                      | 7        | News          |

### 4. 보류 기능 (조건부)

| 기능명                     | 조건                                  |
| -------------------------- | ------------------------------------- |
| HOME 이번 라운드 베스트 11 | ScoutLab 데이터 업데이트 주기 확인 후 |
| HOME 트렌딩 뉴스 패널      | NEWS 기능(F225) 구현 후               |

### 5. 장기 기능 (미구현)

- CV 전술 시각화 (Tactics 섹션) — ScoutLab UX 완성 이후 착수
- 바이럴 카드 생성 + SNS 공유 최적화
- 사용자 커스텀 대시보드 (팀/리그 즐겨찾기)
- AI 기반 경기 예측
- 프리미엄 구독 (광고 제거, 한정 기능)

---

## 메뉴 구조

```
pitch-ac 내비게이션 (데스크탑 상단 고정 헤더)
├── [Logo] pitch-ac
│   └── 기능: F214 (로고 클릭 시 홈으로 이동)
├── Home (홈)
│   └── 기능: F217
├── Matchday (매치데이)
│   └── 기능: F201, F202
├── Ranking (순위)
│   └── 기능: F203
├── Scouting (스카우팅)
│   └── 기능: F204~F213
├── News (뉴스)
│   └── Coming Soon
├── [Theme Toggle]
│   └── 기능: F215 (다크/라이트 모드 전환)
└── 인증 (비로그인 시)
    ├── Log In → F216
    └── Sign Up → F216

모바일 하단 탭 바 (5탭)
├── Home (탭 1) → F217
├── Matchday (탭 2) → F201
├── Ranking (탭 3) → F203
├── News (탭 4) → Coming Soon
└── Scouting (탭 5) → F204~F213
```

---

## 페이지별 상세 기능

### 홈페이지 (`/`)

> **구현 기능:** `F214`, `F215`, `F217`, `F221` | **메뉴 위치:** Home

| 항목            | 내용                                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | ScoutLab 쇼케이스 중심 랜딩 페이지. 대중적 데이터(경기/순위)로 유입 → ScoutLab으로 자연스럽게 유도                                                                                                                                                      |
| **진입 경로**   | 루트 URL `/`, 로고 클릭                                                                                                                                                                                                                                 |
| **사용자 행동** | 히어로·경기·순위 확인 → ScoutLab 데이터 스니펫에 관심 → 스카우팅 페이지로 이동                                                                                                                                                                          |
| **패널 구성**   | 1. HeroBanner (오늘 경기 + CTA)<br>2. 이번 라운드/오늘 경기 (A+D 통합)<br>3. 5대 리그 순위 한눈에 (상위 3~4팀)<br>4. _(보류: 트렌딩 뉴스 — NEWS 구현 후)_<br>5. _(보류: 이번 라운드 베스트 11 — ScoutLab 업데이트 주기 확인 후)_<br>6. QuickLinks + CTA |
| **다음 이동**   | 경기 카드 → 매치데이, 순위 → Ranking, ScoutLab 스니펫 → Scouting                                                                                                                                                                                        |

---

### 매치데이 대시보드 (`/matchday`)

> **구현 기능:** `F201`, `F214`, `F215`, `F220`, `F224` | **메뉴 위치:** Matchday

| 항목            | 내용                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 5대 리그 날짜별 전 경기 목록을 보여주는 대시보드. 킥오프+2.5h 자동 동기화로 경기 결과 자동 반영                                                                                                                                                                            |
| **진입 경로**   | 헤더 Matchday 클릭, 모바일 탭 2 클릭                                                                                                                                                                                                                                       |
| **사용자 행동** | 날짜 스트립 네비게이션으로 날짜 전환, 경기 카드 클릭으로 상세 이동, (향후) 매치픽으로 경기 결과 예측                                                                                                                                                                       |
| **주요 기능**   | - 날짜 기반 경기 목록 (URL `?date=YYYY-MM-DD`)<br>- 경기 카드: 팀 크레스트(SVG) + 팀명 + 스코어/킥오프 시간<br>- 경기 상태 배지: NS=cream, FT=yellow, POSTP=red<br>- **자동 동기화**: 킥오프+2.5h Cron 트리거 (F220)<br>- (향후) **매치픽**: 경기 상세 내 유저 예측 (F224) |
| **다음 이동**   | 경기 카드 클릭 → 경기 상세 페이지                                                                                                                                                                                                                                          |

---

### 경기 상세 페이지 (`/matchday/[fixtureId]`)

> **구현 기능:** `F202`, `F214`, `F215` | **메뉴 위치:** 매치데이 대시보드에서 진입

| 항목            | 내용                                                                                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 개별 경기의 프리매치/포스트매치 데이터를 보여주는 상세 페이지                                                                                                                                                                                                                                           |
| **진입 경로**   | 매치데이 대시보드에서 경기 카드 클릭                                                                                                                                                                                                                                                                    |
| **사용자 행동** | 경기 헤더(팀명/스코어/순위) 확인, 탭 전환(Pre-match/Post-match), 서브 카드 탐색                                                                                                                                                                                                                         |
| **주요 기능**   | - **경기 헤더**: 팀 크레스트 + 팀명 + 스코어 + 리그 순위<br>- **Pre-match 탭**: Team Form (최근 5경기), H2H 전적 (DB 직접 조회), 부상자 목록<br>- **Post-match 탭**: 골 이벤트 타임라인, 순위 시뮬레이션 (승/무/패 가정 시 순위 변동)<br>- 코믹 보더 카드 UI, Bangers/PM 폰트<br>- 공유 버튼 (URL 복사) |
| **다음 이동**   | 뒤로 가기 → 매치데이 대시보드                                                                                                                                                                                                                                                                           |

---

### Ranking 페이지 (`/ranking`)

> **구현 기능:** `F203`, `F214`, `F215`, `F222`, `F223` | **메뉴 위치:** Ranking

| 항목            | 내용                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 5대 리그 + UCL/UEL 순위표 + 선수 순위 페이지                                                                                                                                                                                                                                                                        |
| **진입 경로**   | 헤더 Ranking 클릭, 모바일 탭 3 클릭                                                                                                                                                                                                                                                                                 |
| **사용자 행동** | 리그 탭 전환(5대 리그 + UCL/UEL), 팀/선수 순위 토글, 순위표 스크롤                                                                                                                                                                                                                                                  |
| **주요 기능**   | - **팀 순위**: 5대 리그 탭 + UCL/UEL 탭 (F222)<br>- 순위표 컬럼: #, Team, P, W, D, L, GF, GA, GD, Pts, Form<br>- 팀 로고(SVG 크레스트) + 팀명<br>- UCL/UEL/강등 색상 하이라이트<br>- **선수 순위** (F223): 득점왕/어시왕/공격포인트/클린시트 등 주요 스탯별 (데이터 적재 후)<br>- 반응형 컬럼 (모바일: 핵심만 표시) |
| **다음 이동**   | (향후 팀 클릭 시 팀 상세, 선수 클릭 시 ScoutLab Player Card)                                                                                                                                                                                                                                                        |

---

### ScoutLab (`/scouting` + 10개 서브 탭)

> **구현 기능:** `F204`~`F213`, `F214`, `F215`, `F218`, `F219` | **메뉴 위치:** Scouting

| 항목            | 내용                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | **pitch-ac의 핵심 중심축.** Big 5 리그 선수 60+ 고급 메트릭 기반 스카우팅 분석 플랫폼. 원본 ScoutLab과 동일한 데이터/차트 구조를 유지하되 한국어 맥락 부연 + 코믹 디자인으로 접근성과 매력을 높임                                                                                                                                                                                                                                      |
| **진입 경로**   | 헤더 Scouting 클릭, 모바일 탭 5 클릭, HOME ScoutLab 스니펫에서 유입                                                                                                                                                                                                                                                                                                                                                                    |
| **사용자 행동** | 선수 검색 → 상세 메트릭 확인 → 탭 전환(Summary/Radar/Progression 등) → 비교/유사 선수 탐색                                                                                                                                                                                                                                                                                                                                             |
| **주요 기능**   | - **탭 내비게이션**: 10개 탭 (Player Card, Summary, Radar, Progression, Action Maps, Scatter, Similarity, Ranking, Compare, Glossary)<br>- **한국어 맥락 부연** (F218): 메트릭 영어명 유지 + 괄호 한국어 부연 + 팝오버 상세 해설 (번역체 X, 자연스러운 맥락적 설명)<br>- **코믹 차트 디자인** (F219): 차트 내부까지 코믹 색상 팔레트, 종이 질감 배경, 말풍선 스타일 툴팁<br>- **공통 필터 바**: 시즌/리그/팀/선수 + 포지션 + 모드 토글 |

#### ScoutLab 서브 페이지

| 탭          | 경로                    | 핵심 컴포넌트                                 | 설명                                                |
| ----------- | ----------------------- | --------------------------------------------- | --------------------------------------------------- |
| Player Card | `/scouting`             | player-card-header, metric-category-table     | 선수 정보 + 11개 카테고리 메트릭 테이블 (백분위 바) |
| Summary     | `/scouting/summary`     | category-percentile-bars                      | 10개 카테고리 평균 백분위 수평 바 차트              |
| Radar       | `/scouting/radar`       | scoutlab-radar-chart (recharts)               | 10축 레이더 차트, 비교 모드 2중 오버레이            |
| Progression | `/scouting/progression` | progression-chart (recharts LineChart)        | 시즌별 메트릭 변화 추이                             |
| Action Maps | `/scouting/action-maps` | pitch-svg, action-map-overlay                 | 피치 위 carries/passes/crosses 라인 오버레이        |
| Scatter     | `/scouting/scatter`     | scatter-plot (recharts ScatterChart)          | 5대 리그 선수 산점도, 리그별 색상 구분              |
| Similarity  | `/scouting/similarity`  | similarity-table                              | 유사 선수 20명 (2열 그리드, 상위 3명 하이라이트)    |
| Ranking     | `/scouting/ranking`     | ranking-table, ranking-filter-panel           | 메트릭별 선수 랭킹 + 백분위 배지                    |
| Compare     | `/scouting/compare`     | metric-compare-table, scoutlab-compare-search | 2선수 메트릭 나란히 비교 + 레이더 오버레이          |
| Glossary    | `/scouting/glossary`    | scoutlab-glossary-data                        | 11개 카테고리 × 50+ 메트릭 용어 정의 사전           |

---

### News 페이지 (`/news`)

> **구현 기능:** `F225` (미구현) | **메뉴 위치:** News

| 항목          | 내용                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| **역할**      | 이적 뉴스, 팀 소식 등 축구 뉴스를 큐레이션하여 표시                                                        |
| **현재 상태** | Coming Soon placeholder (Newspaper 아이콘)                                                                 |
| **계획**      | 트위터/기사 등 외부 소스에서 이적 뉴스, 팀 소식 수집 → 큐레이션 표시. 구현 후 HOME에 트렌딩 뉴스 패널 노출 |

---

### 로그인 / 회원가입 페이지

> **구현 기능:** `F216`, `F214` | **메뉴 위치:** 헤더 Log In/Sign Up (비로그인 시)

| 항목            | 내용                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| **역할**        | 사용자 인증 전용 페이지 (기존 구현 유지)                                            |
| **진입 경로**   | 헤더 Log In/Sign Up 클릭                                                            |
| **사용자 행동** | 이메일/비밀번호 입력 또는 Google 로그인 버튼 클릭                                   |
| **주요 기능**   | - 이메일 + 비밀번호 폼<br>- Google OAuth 버튼<br>- 로그인 후 이전 페이지로 리디렉션 |
| **다음 이동**   | 로그인 성공 → 이전 페이지 또는 홈                                                   |

---

## 데이터 모델

### 핵심 테이블

#### teams

| 필드       | 설명            | 타입/관계                      |
| ---------- | --------------- | ------------------------------ |
| id         | 고유 식별자     | Integer (football-data.org ID) |
| name       | 팀 이름         | Text                           |
| short_name | 팀 약칭 (3자리) | Text                           |
| logo_url   | 팀 크레스트 URL | Text (SVG)                     |
| league_id  | 소속 리그 ID    | Integer                        |
| season     | 시즌            | Text                           |

#### players

| 필드      | 설명                    | 타입/관계                      |
| --------- | ----------------------- | ------------------------------ |
| id        | 고유 식별자             | Integer (football-data.org ID) |
| name      | 선수 이름               | Text                           |
| photo_url | 선수 사진 URL           | Text                           |
| team_id   | 소속 팀                 | → teams.id                     |
| position  | 포지션 (GK/DEF/MID/FWD) | Text                           |
| number    | 등번호                  | Integer                        |

#### fixtures

| 필드             | 설명                         | 타입/관계                      |
| ---------------- | ---------------------------- | ------------------------------ |
| id               | 고유 식별자                  | Integer (football-data.org ID) |
| gameweek         | 게임위크 번호 (nullable)     | Integer                        |
| kickoff_at       | 킥오프 시각 (UTC)            | Timestamp                      |
| home_team_id     | 홈 팀                        | → teams.id                     |
| away_team_id     | 원정 팀                      | → teams.id                     |
| status           | 경기 상태 (NS/LIVE/FT/POSTP) | Text                           |
| home_score       | 홈 팀 득점                   | Integer                        |
| away_score       | 원정 팀 득점                 | Integer                        |
| goals            | 골 이벤트 JSONB              | JSONB                          |
| league_id        | 리그 ID (PL=2021 등)         | Integer                        |
| competition_name | 대회 표시명                  | Text                           |
| updated_at       | 마지막 갱신 시각             | Timestamp                      |

> 라이브 관련 필드(`live_stats`, `lineups`, `minute`)는 football-data.org 무료 티어 제약으로 제거됨.

#### standings

| 필드          | 설명        | 타입/관계  |
| ------------- | ----------- | ---------- |
| id            | 고유 식별자 | UUID       |
| team_id       | 팀          | → teams.id |
| league_id     | 리그 ID     | Integer    |
| season        | 시즌        | Text       |
| position      | 순위        | Integer    |
| played        | 경기 수     | Integer    |
| won           | 승          | Integer    |
| drawn         | 무          | Integer    |
| lost          | 패          | Integer    |
| goals_for     | 득점        | Integer    |
| goals_against | 실점        | Integer    |
| goal_diff     | 골득실차    | Integer    |
| points        | 승점        | Integer    |
| form          | 최근 폼     | Text       |

#### player_season_stats

| 필드       | 설명                      | 타입/관계    |
| ---------- | ------------------------- | ------------ |
| id         | 고유 식별자               | UUID         |
| player_id  | 선수                      | → players.id |
| season     | 시즌                      | Text         |
| goals      | 시즌 골 수                | Integer      |
| assists    | 시즌 어시스트 수          | Integer      |
| xg         | 기대 골 (nullable)        | Real         |
| xa         | 기대 어시스트 (nullable)  | Real         |
| context    | 맥락 데이터 (순위/백분위) | JSONB        |
| radar_data | 레이더 차트용 능력치      | JSONB        |
| updated_at | 마지막 갱신 시각          | Timestamp    |

### ScoutLab 테이블

#### scoutlab_players

| 필드        | 설명                           | 타입         |
| ----------- | ------------------------------ | ------------ |
| id          | 고유 식별자                    | Serial PK    |
| name        | 선수 이름                      | Text         |
| team        | 소속 팀                        | Text         |
| league      | 리그명                         | Text (CHECK) |
| position    | 포지션 (CB/FB/MF/AM/W/AM·W/FW) | Text (CHECK) |
| season      | 시즌                           | Text         |
| nationality | 국적                           | Text         |
| age         | 나이                           | Integer      |
| height      | 키                             | Integer      |
| minutes     | 출전 시간                      | Integer      |

> 복합 유니크: `(name, team, season)`

#### scoutlab_metrics

| 필드          | 설명                     | 타입                            |
| ------------- | ------------------------ | ------------------------------- |
| id            | 고유 식별자              | Serial PK                       |
| player_id     | 선수                     | → scoutlab_players.id (CASCADE) |
| mode          | per90 / total            | Text                            |
| adjustment    | padj / raw               | Text                            |
| final_product | 최종 생산물 메트릭 JSONB | JSONB                           |
| shooting      | 슈팅 메트릭 JSONB        | JSONB                           |
| creation      | 창조 메트릭 JSONB        | JSONB                           |
| passing       | 패스 메트릭 JSONB        | JSONB                           |
| ball_carrying | 볼 캐리 메트릭 JSONB     | JSONB                           |
| defending     | 수비 메트릭 JSONB        | JSONB                           |
| aerial        | 공중전 메트릭 JSONB      | JSONB                           |
| possession    | 점유 메트릭 JSONB        | JSONB                           |
| set_pieces    | 세트피스 메트릭 JSONB    | JSONB                           |
| goalkeeping   | 골키핑 메트릭 JSONB      | JSONB                           |
| discipline    | 규율 메트릭 JSONB        | JSONB                           |

> 각 카테고리 JSONB: `{ "metric_name": { "value": N, "percentile": N } }`

#### scoutlab_radar

| 필드      | 설명         | 타입                            |
| --------- | ------------ | ------------------------------- |
| id        | 고유 식별자  | Serial PK                       |
| player_id | 선수         | → scoutlab_players.id (CASCADE) |
| axes      | 축 라벨 배열 | TEXT[]                          |
| values    | 값 배열      | REAL[]                          |

#### scoutlab_action_maps

| 필드      | 설명                       | 타입                            |
| --------- | -------------------------- | ------------------------------- |
| id        | 고유 식별자                | Serial PK                       |
| player_id | 선수                       | → scoutlab_players.id (CASCADE) |
| map_type  | carries / passes / crosses | Text                            |
| lines     | 라인 데이터 JSONB          | JSONB                           |

#### scoutlab_similarity

| 필드            | 설명            | 타입                            |
| --------------- | --------------- | ------------------------------- |
| id              | 고유 식별자     | Serial PK                       |
| player_id       | 선수            | → scoutlab_players.id (CASCADE) |
| similar_players | 유사 선수 JSONB | JSONB                           |

### 레거시 테이블 (유지하되 미활용)

- `cartoon_assets`: 카툰 에셋 (향후 Phase 8 활용 예정)
- `speech_bubbles`: 말풍선 대사 (향후 Phase 8 활용 예정)
- `glossary`: 축구 용어 사전
- `injuries`: 부상 선수 정보
- `sync_logs`: 동기화 이력

---

## 기술 스택

### 핵심 인프라

| 카테고리            | 기술                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| **프레임워크**      | Next.js 16+ (App Router), React 19, TypeScript 5.6+ strict                       |
| **스타일링**        | Tailwind CSS v4 (CSS-first, `@theme inline`), shadcn/ui (new-york), Lucide React |
| **폰트**            | Geist Sans (본문), Fredoka (UI), Bangers (코믹 타이틀), Permanent Marker (서브)  |
| **상태관리/데이터** | TanStack Query v5, Zustand v5                                                    |
| **차트/시각화**     | Recharts (레이더, 라인, 산점도)                                                  |
| **OG 이미지**       | `next/og` (satori)                                                               |
| **백엔드/DB**       | Supabase (PostgreSQL, 인증, RLS), `@supabase/ssr`                                |
| **데이터 소스**     | football-data.org (무료 플랜, 10 요청/분)                                        |
| **스카우팅 데이터** | ScoutLab (Playwright 스크래퍼로 수집, Supabase DB 캐시)                          |
| **모니터링**        | Sentry (`@sentry/nextjs`)                                                        |
| **배포**            | Vercel (Cron, Edge Functions)                                                    |
| **코드 품질**       | ESLint, Prettier, Husky, lint-staged                                             |

### football-data.org 연동

| 항목           | 상세                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **인증**       | `X-Auth-Token` 헤더                                                    |
| **Rate Limit** | 10 요청/분 (슬라이딩 윈도우)                                           |
| **리그 코드**  | PL(2021), PD(2014), SA(2019), BL1(2002), FL1(2015)                     |
| **이미지**     | `crests.football-data.org` (SVG 크레스트, `dangerouslyAllowSVG: true`) |
| **제약 사항**  | 라이브 스코어, 라인업, 경기 통계(점유율/슈팅), 카드/교체 이벤트 미지원 |
| **클라이언트** | `lib/api/football-data/client.ts` + `rate-limiter.ts`                  |

---

## API 라우트

### 데이터 조회

| 엔드포인트                   | 메서드 | 설명                                                 |
| ---------------------------- | ------ | ---------------------------------------------------- |
| `GET /api/matchday/fixtures` | GET    | 게임위크별 경기 목록 (`?league=epl&gw=N`), 캐시 60초 |
| `GET /api/matchday/fixture`  | GET    | 개별 경기 상세 (`?id=N`)                             |
| `GET /api/scoutlab/ranking`  | GET    | 메트릭별 선수 랭킹 (`?category=X&metric=Y&season=Z`) |
| `GET /api/health`            | GET    | 헬스 체크                                            |

### Cron 동기화

| 엔드포인트                        | 주기                | 설명                          |
| --------------------------------- | ------------------- | ----------------------------- |
| `GET /api/cron/sync-fixtures`     | 매일 06:00 UTC      | 시즌 전체 경기 동기화         |
| `GET /api/cron/sync-teams`        | 주 1회 월요일 04:00 | 팀 정보 + 순위표 동기화       |
| `GET /api/cron/sync-players`      | (필요 시)           | 선수 데이터 동기화            |
| `GET /api/cron/sync-stats`        | (필요 시)           | 시즌 스탯 동기화              |
| `GET /api/cron/calculate-context` | (필요 시)           | 맥락 데이터(순위/백분위) 계산 |

### 디버그 (개발용)

| 엔드포인트                               | 설명                                    |
| ---------------------------------------- | --------------------------------------- |
| `GET /api/debug/football-data/fixtures`  | football-data.org 경기 데이터 직접 확인 |
| `GET /api/debug/football-data/standings` | 순위표 원본 확인                        |
| `GET /api/debug/football-data/teams`     | 팀 정보 원본 확인                       |
| `GET /api/debug/football-data/quota`     | API 요청 잔여량 확인                    |
| `GET /api/debug/football-data/sync`      | 동기화 상태 확인                        |

---

## 데이터 동기화 전략

| 데이터 유형      | 동기화 주기                                  | 방법                          |
| ---------------- | -------------------------------------------- | ----------------------------- |
| 팀/선수 기본정보 | 시즌 초 1회 + 주 1회                         | Vercel Cron                   |
| 경기 일정        | 매일 1회 (킥오프 시간 갱신)                  | Vercel Cron                   |
| 경기 결과        | **킥오프 + 2.5시간 오프셋** (경기 종료 시점) | Vercel Cron (동적 스케줄)     |
| 순위표           | 경기 결과 동기화와 함께                      | Vercel Cron                   |
| ScoutLab 데이터  | 수동 (Playwright)                            | `npm run scrape:scoutlab` CLI |

> 경기 결과는 킥오프 시간 기반으로 종료 예상 시점에만 동기화. 경기 없는 날은 동기화 안 함.
> 라이브 데이터 동기화는 football-data.org 무료 티어 제약으로 제거됨.

---

## 정합성 검증

### 기능 명세 → 페이지 연결 검증

- [x] F201 (5대 리그 매치데이) → 매치데이 대시보드 존재
- [x] F202 (경기 상세) → 경기 상세 페이지 존재
- [x] F203 (5대 리그 순위표) → Ranking 페이지 존재
- [x] F204~F213 (ScoutLab 10개 기능) → ScoutLab 10개 탭 페이지 존재
- [x] F214 (글로벌 내비게이션) → 전체 페이지 공통 존재
- [x] F215 (코믹 디자인 시스템) → 전체 페이지 공통 적용
- [x] F216 (기본 인증) → 로그인/회원가입 페이지 존재
- [x] F217 (종이 질감 배경) → 홈페이지 존재

### 메뉴 구조 → 페이지 연결 검증

- [x] Home → 홈페이지 존재 (F217)
- [x] Matchday → 매치데이 대시보드 존재 (F201)
- [x] Ranking → Ranking 페이지 존재 (F203)
- [x] Scouting → ScoutLab 페이지 존재 (F204~F213)
- [x] News → Coming Soon placeholder 존재
- [x] Log In / Sign Up → 로그인/회원가입 페이지 존재 (F216)
- [x] 모든 참조 기능 ID가 기능 명세에 정의되어 있음

### 페이지별 상세 기능 → 역참조 검증

- [x] 홈페이지: F214, F215, F217 → 모두 정의됨
- [x] 매치데이 대시보드: F201, F214, F215 → 모두 정의됨
- [x] 경기 상세 페이지: F202, F214, F215 → 모두 정의됨
- [x] Ranking 페이지: F203, F214, F215 → 모두 정의됨
- [x] ScoutLab: F204~F213, F214, F215 → 모두 정의됨
- [x] 로그인/회원가입: F216, F214 → 모두 정의됨

### 데이터 모델 → 기능 역참조 검증

- [x] teams, fixtures, standings → F201 (매치데이), F202 (경기 상세), F203 (순위표)
- [x] players, player_season_stats → F202 (경기 상세)
- [x] scoutlab\_\* (6개 테이블) → F204~F213 (ScoutLab 전체)
- [x] 모든 기능이 최소 1개 이상의 데이터 테이블에 매핑됨

---

## ROADMAP 기능-Task 매핑 (참조)

> 상세 Task 정의 및 진행 상태는 `docs/ROADMAP.md` 참조.

| 기능 ID | 기능명               | 커버 Task            |
| ------- | -------------------- | -------------------- |
| F201    | 5대 리그 매치데이    | N201~N206, FD01~FD09 |
| F202    | 경기 상세            | 레거시 Phase 2~4     |
| F203    | 5대 리그 순위표      | N102                 |
| F204    | ScoutLab Player Card | S302                 |
| F205    | ScoutLab Summary     | S303                 |
| F206    | ScoutLab Radar       | S304                 |
| F207    | ScoutLab Progression | S305                 |
| F208    | ScoutLab Action Maps | S306                 |
| F209    | ScoutLab Scatter     | S307                 |
| F210    | ScoutLab Similarity  | S308                 |
| F211    | ScoutLab Ranking     | S309                 |
| F212    | ScoutLab Compare     | S310                 |
| F213    | ScoutLab Glossary    | S311                 |
| F214    | 글로벌 내비게이션    | N101                 |
| F215    | 코믹 디자인 시스템   | 7B1~7B6, 7C1~7C4     |
| F216    | 기본 인증            | 레거시 완료          |
| F217    | 종이 질감 배경       | HP01                 |
| F218    | ScoutLab 한국어 부연 | UX101~UX103          |
| F219    | ScoutLab 코믹 차트   | UX201~UX204          |
| F220    | MATCHDAY 자동 동기화 | MD101~MD103          |
| F221    | HOME 쇼케이스        | HP301~HP303          |
| F222    | RANKING UCL/UEL      | RK201~RK203          |
| F223    | RANKING 선수 순위    | RK301~RK303          |
| F224    | MATCHDAY 매치픽      | MP101~MP104          |
| F225    | NEWS 구현            | NW101~NW103          |
