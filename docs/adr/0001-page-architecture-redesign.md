# 페이지 아키텍처 리디자인 — ScoutLab 중심 전환

탑레벨 5페이지(HOME/MATCHDAY/RANKING/NEWS/SCOUTING) 구조를 유지하되, 사이트 중심축을 ScoutLab으로 설정. HOME은 종합 대시보드에서 ScoutLab 쇼케이스 중심으로 전환. 유저 참여형 기능(매치픽)은 독립 탭이 아닌 MATCHDAY 하위에 배치.

## Considered Options

- **6~7개 탑레벨 탭** (Tactics, Community 등 추가) — 모바일 탭바 복잡성 증가로 기각
- **HOME = 종합 대시보드** (현재) — ScoutLab이 핵심인데 여러 섹션 중 하나로 묻힘
- **매치픽을 독립 탭(PLAY/COMMUNITY)으로** — 매치데이와 문맥이 같아 분리 불필요

## 확정 구조

| 페이지   | 역할                               | 변경                               |
| -------- | ---------------------------------- | ---------------------------------- |
| HOME     | ScoutLab 쇼케이스 + 경기/순위 요약 | 패널 재구성 (ScoutLab 데이터 중심) |
| MATCHDAY | 경기 일정/결과 + 매치픽(하위)      | 자동 동기화 + 매치픽 추가          |
| RANKING  | 5대 리그 + UCL/UEL + 선수 순위     | UCL/UEL 탭, 선수 순위 탭 추가      |
| NEWS     | 이적뉴스/팀소식 큐레이션           | Coming Soon → 점진 구현            |
| SCOUTING | 10탭 분석 도구 (핵심)              | 한국어 부연 + 코믹 디자인          |
