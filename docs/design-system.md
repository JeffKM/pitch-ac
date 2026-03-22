# pitch-ac 디자인 시스템

맨시티 카툰 팬사이트의 디자인 시스템.
참고: [UI 구성 요소 계층](https://meooowong.tistory.com/8) — 파운데이션 < 엘리먼트 < 모듈 < 페이지

---

## 1. 파운데이션 (Foundation)

디자인의 기본 설계 요소. 모든 UI의 토대.

### 1.1 컬러 시스템

OKLCH 색상 공간 사용. `globals.css`의 CSS 변수로 정의.

#### 시멘틱 컬러 (shadcn/ui 기반)

| 토큰                 | 라이트                    | 다크                   | 용도              |
| -------------------- | ------------------------- | ---------------------- | ----------------- |
| `--background`       | `oklch(0.98 0.005 230)`   | `oklch(0.14 0.03 260)` | 페이지 배경       |
| `--foreground`       | `oklch(0.15 0.04 260)`    | `oklch(0.95 0.01 230)` | 기본 텍스트       |
| `--card`             | `oklch(1 0 0)`            | `oklch(0.18 0.03 260)` | 카드 배경         |
| `--primary`          | `oklch(0.65 0.12 230)`    | `oklch(0.7 0.13 230)`  | 맨시티 스카이블루 |
| `--secondary`        | `oklch(0.95 0.015 230)`   | `oklch(0.22 0.04 260)` | 보조 배경         |
| `--muted`            | `oklch(0.95 0.01 230)`    | `oklch(0.22 0.04 260)` | 비활성 배경       |
| `--muted-foreground` | `oklch(0.5 0.03 260)`     | `oklch(0.65 0.04 230)` | 보조 텍스트       |
| `--accent`           | `oklch(0.82 0.12 85)`     | `oklch(0.75 0.1 85)`   | 골드 강조         |
| `--destructive`      | `oklch(0.577 0.245 27.3)` | 동일                   | 에러/위험         |
| `--border`           | `oklch(0.9 0.015 230)`    | `oklch(0.28 0.04 260)` | 기본 테두리       |
| `--mcity`            | = `--primary`             | = `--primary`          | 맨시티 브랜드     |
| `--gold`             | = `--accent`              | = `--accent`           | 골드/액센트       |

#### 코믹 컬러 팔레트

앱 내 카드, 배지, 버튼에 사용하는 코믹풍 색상.

| 토큰              | Tailwind 클래스    | 라이트                 | 다크                   | 용도                     |
| ----------------- | ------------------ | ---------------------- | ---------------------- | ------------------------ |
| `--comic-skyblue` | `bg-comic-skyblue` | `oklch(0.78 0.08 220)` | `oklch(0.55 0.1 220)`  | 맨시티 블루, 등번호 배지 |
| `--comic-green`   | `bg-comic-green`   | `oklch(0.72 0.17 155)` | `oklch(0.52 0.14 155)` | 승리, 상승, LIVE 상태    |
| `--comic-yellow`  | `bg-comic-yellow`  | `oklch(0.88 0.15 90)`  | `oklch(0.75 0.13 90)`  | 활성 탭, 강조 배지       |
| `--comic-red`     | `bg-comic-red`     | `oklch(0.58 0.22 25)`  | `oklch(0.55 0.2 25)`   | 패배, 하락, 레드카드     |
| `--comic-pink`    | `bg-comic-pink`    | `oklch(0.68 0.16 10)`  | `oklch(0.6 0.14 10)`   | 보조 강조                |
| `--comic-black`   | `bg-comic-black`   | `oklch(0.15 0 0)`      | `oklch(0.95 0 0)`      | 테두리, 기본 텍스트      |
| `--comic-cream`   | `bg-comic-cream`   | `oklch(0.95 0.03 90)`  | `oklch(0.25 0.02 90)`  | 비활성 배경, 부드러운 면 |
| `--comic-white`   | `bg-comic-white`   | `oklch(1 0 0)`         | `oklch(0.18 0.03 260)` | 카드/패널 배경           |

#### 차트 컬러

비교 페이지 등에서 두 선수를 구분할 때 사용.

| 토큰        | Tailwind 클래스 | 용도            |
| ----------- | --------------- | --------------- |
| `--chart-1` | `text-chart-1`  | 선수 A (블루)   |
| `--chart-2` | `text-chart-2`  | 선수 B (네이비) |

#### 상태 표시 색상 규칙

상태를 나타낼 때 반드시 코믹 토큰 사용. **Tailwind 기본색(green-500, red-600 등) 사용 금지.**

| 상태      | 색상 토큰        | 사용 예시                         |
| --------- | ---------------- | --------------------------------- |
| 상승/승리 | `comic-green`    | SeasonDelta +, PercentileBar 90%+ |
| 하락/패배 | `comic-red`      | SeasonDelta -, 레드카드           |
| 경고/중립 | `comic-yellow`   | PercentileBar 50~69%, 옐로카드    |
| LIVE      | `comic-green`    | LivePulse, ScoreFlash             |
| 비활성    | `comic-black/40` | 비활성 탭, 보조 텍스트            |

---

### 1.2 타이포그래피

4개 폰트 패밀리. 코믹풍 헤딩과 본문 구분이 핵심.

#### 폰트 패밀리

| 역할      | 폰트 변수                       | Tailwind 사용법                                   | 용도               |
| --------- | ------------------------------- | ------------------------------------------------- | ------------------ |
| 코믹 헤딩 | `--font-bangers`                | `font-[family-name:var(--font-bangers)]`          | 제목, 스코어, 배지 |
| 코믹 본문 | `--font-permanent-marker`       | `font-[family-name:var(--font-permanent-marker)]` | 서브텍스트, 레이블 |
| 카툰 UI   | `--font-fredoka`                | `font-[family-name:var(--font-fredoka)]`          | UI 컨트롤          |
| 시스템    | `--font-geist-sans` (body 기본) | 별도 지정 불필요                                  | 일반 텍스트        |

#### Bangers 타이포 스케일 (헤딩)

| 토큰                | 크기 | 용도                              |
| ------------------- | ---- | --------------------------------- |
| `--comic-text-xs`   | 12px | 뱃지, 인라인 라벨                 |
| `--comic-text-sm`   | 14px | CardTitle, 탭 라벨, 작은 제목     |
| `--comic-text-base` | 18px | 섹션 헤딩, 스탯 라벨              |
| `--comic-text-lg`   | 20px | 중간 제목                         |
| `--comic-text-xl`   | 24px | 페이지 서브타이틀                 |
| `--comic-text-2xl`  | 30px | 페이지 타이틀, 로고               |
| `--comic-text-3xl`  | 48px | 스코어, 대형 수치                 |
| `--comic-text-4xl`  | 60px | 히어로 섹션 스코어 (match-header) |
| `--comic-text-5xl`  | 72px | 마케팅 히어로                     |
| `--comic-text-6xl`  | 96px | 마케팅 메가 헤딩                  |

#### Permanent Marker 타이포 스케일 (본문)

| 토큰                | 크기 | 용도                   |
| ------------------- | ---- | ---------------------- |
| `--comic-body-xs`   | 10px | 포지션 태그, 순위 표시 |
| `--comic-body-sm`   | 12px | 서브텍스트, 날짜       |
| `--comic-body-base` | 14px | 일반 본문, 설명 텍스트 |
| `--comic-body-lg`   | 16px | 강조 본문              |

#### 줄간격 / 자간

| 줄간격 토큰               | 값    | 자간 토큰                 | 값     |
| ------------------------- | ----- | ------------------------- | ------ |
| `--comic-leading-tight`   | 1     | `--comic-tracking-none`   | 0px    |
| `--comic-leading-snug`    | 1.2   | `--comic-tracking-tight`  | 0.25px |
| `--comic-leading-normal`  | 1.333 | `--comic-tracking-normal` | 0.45px |
| `--comic-leading-relaxed` | 1.4   | `--comic-tracking-wide`   | 1px    |
| `--comic-leading-loose`   | 1.5   | `--comic-tracking-wider`  | 1.2px  |

#### 타이포 조합 스니펫

자주 사용하는 조합. 복사해서 쓸 것.

```
# CardTitle (모든 카드 헤더)
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black

# 페이지 타이틀 (h1)
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black

# 서브텍스트 (날짜, 포지션, 순위)
font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60

# 본문 텍스트
font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black

# 스코어 (경기 상세)
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-4xl)] text-comic-black

# 수치 (스탯 카드)
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black tabular-nums

# 뱃지 라벨
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] text-comic-black
```

---

### 1.3 보더 시스템

코믹풍의 핵심. 모든 카드/패널에 검정 실선 테두리.

| 토큰                   | 값  | 용도                          |
| ---------------------- | --- | ----------------------------- |
| `--comic-border-width` | 3px | 카드, 패널, 네비게이션 테두리 |
| `--comic-border-thin`  | 2px | 카드 내부 분리선 (얇은 선)    |

#### 보더 스니펫

```
# 카드 보더 (필수)
border-[var(--comic-border-width)] border-comic-black

# 내비게이션 보더
border-comic-black border-b-[var(--comic-border-width)]   # 헤더 하단
border-comic-black border-t-[var(--comic-border-width)]   # 탭바 상단

# 카드 내부 분리선
border-comic-black/20 border-t-[var(--comic-border-thin)]

# 이미지 링 (프로필 사진 등)
ring-[var(--comic-border-width)] ring-comic-black
```

---

### 1.4 간격 & 라운딩

| 토큰                    | 값   | 용도                    |
| ----------------------- | ---- | ----------------------- |
| `--comic-panel-gap`     | 16px | 카드 간 간격            |
| `--comic-panel-padding` | 24px | 카드 내부 패딩          |
| `--comic-panel-radius`  | 4px  | 카드/패널 모서리 라운딩 |

#### 라운딩 스니펫

```
# 카드/패널 (4px)
rounded-[var(--comic-panel-radius)]

# 원형 (프로필 사진)
rounded-full

# 축구 피치 배경 (예외적 하드코딩 허용)
rounded-lg
```

---

### 1.5 그리드 & 레이아웃

| 패턴             | 클래스                                  | 용도                |
| ---------------- | --------------------------------------- | ------------------- |
| 2컬럼 반응형     | `grid grid-cols-1 gap-6 md:grid-cols-2` | 라인업 피치 좌우    |
| 3컬럼 스탯 비교  | `grid grid-cols-[1fr_auto_1fr] gap-2`   | 비교 테이블, 이벤트 |
| 스쿼드 그리드    | `grid grid-cols-2 gap-4 sm:grid-cols-3` | 선수 카드 목록      |
| 컨텐츠 최대 너비 | `container mx-auto max-w-5xl px-4`      | 페이지 래퍼         |

---

### 1.6 아이콘

lucide-react 개별 임포트. 크기는 `size-*` 유틸리티.

| 크기        | 클래스   | 용도                 |
| ----------- | -------- | -------------------- |
| 작은 아이콘 | `size-3` | 인라인 표시 (트렌드) |
| 기본 아이콘 | `size-4` | 이벤트, 버튼 아이콘  |
| 중간 아이콘 | `size-5` | 탭바 아이콘          |
| 큰 아이콘   | `size-6` | 네비게이션           |

---

## 2. 엘리먼트 (Elements)

단일 UI 구성 요소. 파운데이션을 조합해 만든 최소 단위.

### 2.1 카드 (Card)

모든 카드의 기본 스타일. shadcn/ui `<Card>` 컴포넌트에 코믹 클래스 적용.

```tsx
<Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
  <CardHeader className="pb-2">
    <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
      제목
    </CardTitle>
  </CardHeader>
  <CardContent>{/* 내용 */}</CardContent>
</Card>
```

### 2.2 배지 (Badge)

상태나 카테고리 표시.

| 종류        | 배경                | 폰트    | 텍스트색           |
| ----------- | ------------------- | ------- | ------------------ |
| 활성/강조   | `bg-comic-yellow`   | Bangers | `text-comic-black` |
| NS (미시작) | `bg-comic-cream`    | PM      | `text-comic-black` |
| LIVE        | `bg-comic-green/20` | Bangers | `text-comic-green` |
| FT (종료)   | `bg-comic-yellow`   | Bangers | `text-comic-black` |
| 포지션      | `bg-comic-yellow`   | Bangers | `text-comic-black` |
| 등번호      | `bg-comic-skyblue`  | Bangers | `text-comic-white` |

### 2.3 탭 (Tabs)

```
TabsList: bg-comic-cream 배경 + 코믹 보더
TabsTrigger (기본): text-comic-black
TabsTrigger (활성): data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black
```

### 2.4 상태 표시기

#### LivePulse

```tsx
<span className="relative flex size-2">
  <span className="absolute inline-flex size-full animate-ping rounded-full bg-comic-green opacity-75" />
  <span className="relative inline-flex size-2 rounded-full bg-comic-green" />
</span>
```

#### ScoreFlash

스코어 변경 시 2초간 `text-comic-green` 전환.

#### SeasonDeltaIndicator

| 상태    | 색상                  |
| ------- | --------------------- |
| 상승(+) | `text-comic-green`    |
| 하락(-) | `text-comic-red`      |
| 동일(=) | `text-comic-black/40` |

#### PercentileBar

| 범위     | 색상                |
| -------- | ------------------- |
| 90%+     | `bg-comic-green`    |
| 70~89%   | `bg-comic-skyblue`  |
| 50~69%   | `bg-comic-yellow`   |
| 50% 미만 | `bg-comic-black/30` |

---

## 3. 모듈 (Modules)

엘리먼트를 조합한 복합 구성 요소.

### 3.1 FixtureCard (경기 카드)

- 카드 기본 스타일 + `hover:bg-comic-cream`
- LIVE 상태: `bg-comic-green/10` 배경
- 팀명: Bangers / 순위: PM `text-comic-black/50`
- 하단 구분선: `border-comic-black/20 border-t-[var(--comic-border-thin)]`

### 3.2 PlayerCard (선수 카드)

- 카드 기본 스타일 + `hover:bg-comic-cream`
- 이름: Bangers `--comic-text-sm`
- 포지션: PM `--comic-body-xs`
- 배지: `bg-comic-yellow` (포지션), `bg-comic-skyblue` (등번호)

### 3.3 MatchHeader (경기 헤더)

- 카드 기본 스타일
- 스코어: Bangers `--comic-text-4xl`
- 팀명: Bangers `--comic-text-xl`
- 날짜/순위: PM `--comic-body-sm`

### 3.4 StatContextCard (맥락 스탯 카드)

- `bg-comic-cream` (일반 카드와 배경 차별화)
- 수치: Bangers `--comic-text-2xl`
- 레이블: PM `--comic-body-xs`

### 3.5 CompareStatTable (스탯 비교 테이블)

- 카드 기본 스타일
- 선수명: `text-chart-1` / `text-chart-2` (구분 색상)
- 수치: PM `--comic-body-base` + tabular-nums
- 보조 텍스트: PM `--comic-body-xs` + `text-comic-black/40`

### 3.6 EventTimeline (이벤트 타임라인)

- 카드 기본 스타일
- 선수명: PM `--comic-body-sm`
- 분 표시: PM `--comic-body-xs` + `text-comic-black/40`
- 이벤트 아이콘: 옐로카드=`bg-comic-yellow`, 레드카드=`bg-comic-red`, 골=`text-comic-skyblue`, 교체=`text-comic-skyblue`

### 3.7 LineupDisplay (라인업)

- 카드 기본 스타일
- 피치 배경: `bg-gradient-to-b from-green-600 to-green-700` (실제 축구 피치 — 예외적 하드코딩 허용)
- 팀명: PM `--comic-body-sm`
- 포메이션: PM `--comic-body-xs` + `text-comic-black/40`
- 선수 도트: `bg-white/20`, `text-white` (피치 위이므로 예외)

---

## 4. 페이지 & 화면 공통요소

### 4.1 AppHeader (데스크탑 GNB)

- `bg-comic-white` + 하단 보더 `border-b-[var(--comic-border-width)]`
- 로고: Bangers `--comic-text-2xl` + `tracking-[var(--comic-tracking-wide)]`
- 활성 메뉴: `bg-comic-yellow text-comic-black`
- 비활성 메뉴: `bg-comic-black text-comic-white`

### 4.2 MobileTabBar (바텀 내비게이션)

- `bg-comic-white` + 상단 보더 `border-t-[var(--comic-border-width)]`
- 활성: `bg-comic-yellow` 아이콘 배경 + Bangers 라벨
- 비활성: `text-comic-black/40`

### 4.3 페이지 타이틀 통일 규칙

모든 페이지의 `<h1>`:

```
font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black
```

서브텍스트:

```
font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/60
```

---

## 5. 금지 사항 (Anti-patterns)

절대 사용하지 말 것:

| 금지 패턴                                   | 올바른 대안                                         |
| ------------------------------------------- | --------------------------------------------------- |
| `text-green-500`, `text-green-600`          | `text-comic-green`                                  |
| `text-red-500`, `text-red-600`              | `text-comic-red`                                    |
| `bg-green-400`, `bg-green-500`              | `bg-comic-green`                                    |
| `bg-yellow-400`, `bg-yellow-500`            | `bg-comic-yellow`                                   |
| `bg-red-500`                                | `bg-comic-red`                                      |
| `text-blue-500`                             | `text-comic-skyblue`                                |
| `text-muted-foreground` (코믹 컴포넌트 내)  | `text-comic-black/40`                               |
| `bg-muted` (코믹 컴포넌트 내)               | `bg-comic-cream`                                    |
| `text-primary` (코믹 컴포넌트 내)           | `text-comic-skyblue`                                |
| `bg-primary` (코믹 컴포넌트 내)             | `bg-comic-skyblue`                                  |
| `text-sm`, `text-xs` (폰트 사이즈 하드코딩) | `text-[length:var(--comic-*)]`                      |
| `ring-1 ring-border`                        | `ring-[var(--comic-border-width)] ring-comic-black` |

### 예외 허용

| 예외 패턴                                | 이유                             |
| ---------------------------------------- | -------------------------------- |
| 피치 배경 `from-green-600 to-green-700`  | 실제 축구 피치 시각화            |
| 피치 위 선수 `text-white`, `bg-white/20` | 피치 배경 위 가독성              |
| `rounded-full` (프로필 사진)             | 원형 이미지는 코믹 radius 부적합 |

---

## 6. 체크리스트

새 컴포넌트 작성 시 확인:

- [ ] 카드 사용 시 코믹 보더 (`border-[var(--comic-border-width)] border-comic-black`) 적용?
- [ ] 카드 배경 `bg-comic-white` 또는 `bg-comic-cream`?
- [ ] 라운딩 `rounded-[var(--comic-panel-radius)]`?
- [ ] 제목에 Bangers 폰트 + 코믹 텍스트 토큰 사용?
- [ ] 본문/서브텍스트에 Permanent Marker + 코믹 바디 토큰 사용?
- [ ] 텍스트색 `text-comic-black` (또는 `/60`, `/40` 변형)?
- [ ] 상태 색상에 코믹 토큰 사용? (green-500 등 금지)
- [ ] 이미지 ring에 `ring-comic-black` 사용?
