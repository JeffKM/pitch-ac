# Phase S6: ScoutLab 5대 리그 확장 — 운영 가이드

## 현재 진행 상태

| Task       | 내용                                   | 상태    | 비고                                    |
| ---------- | -------------------------------------- | ------- | --------------------------------------- |
| **S600**   | 프론트엔드 리그 필터 버그 수정         | ✅ 완료 | 커밋 `5da2f72`                          |
| **S600-b** | --match-position 플래그 구현           | ✅ 완료 | 커밋 `4248d6c`                          |
| **S601**   | La Liga 전체 스크래핑 (match-position) | ✅ 완료 | 393명, 1572건, 실패 0                   |
| **S602**   | Serie A 전체 스크래핑 (match-position) | ✅ 완료 | 141명, 552건, 실패 37→재시도 37/37 성공 |
| **S603**   | Bundesliga 전체 스크래핑               | ⏳ 대기 | S602 완료 후                            |
| **S604**   | Ligue 1 전체 스크래핑                  | ⏳ 대기 | S603 완료 후                            |
| **S605**   | PL 재스크래핑 (match-position 전환)    | ⏳ 대기 | S604 완료 후                            |
| **S606**   | 5대 리그 Similarity 수집               | ⏳ 대기 | S605 완료 후                            |
| **S607**   | 데이터 검증 + UI 통합 테스트           | ⏳ 대기 | 전체 완료 후                            |

---

## S601: La Liga (완료)

### 결과

- **선수**: 393명
- **메트릭**: 1,572건
- **실패**: 0
- **소요 시간**: ~4시간
- **로그 파일**: `scrape-laliga-match-position.log`

---

## S602: Serie A (완료)

### 결과

- **선수**: 141명
- **메트릭**: 552건 (AM/W 132, CB 128, MF 124, FB 96, FW 72)
- **1차 실패**: 37명 → 재시도 37/37 전원 성공
- **중복**: 0건 (upsert 정상)
- **소요 시간**: 1차 ~8,213초 + 재시도 ~2,331초
- **로그 파일**: `scrape-seriea-match-position.log`

---

## S603: Bundesliga 스크래핑

### 사전 준비

```sql
DELETE FROM scoutlab_metrics
WHERE comparison_position = 'AM/W'
  AND player_id IN (
    SELECT id FROM scoutlab_players WHERE league = 'Bundesliga'
  );
```

### 실행

```bash
nohup npm run scrape:scoutlab -- --league="Bundesliga" --match-position \
  > scrape-bundesliga-match-position.log 2>&1 &
echo "PID: $!"
```

### 모니터링

```bash
tail -20 scrape-bundesliga-match-position.log
grep -c "팀:" scrape-bundesliga-match-position.log  # 총 18팀
```

---

## S604: Ligue 1 스크래핑

### 사전 준비

```sql
DELETE FROM scoutlab_metrics
WHERE comparison_position = 'AM/W'
  AND player_id IN (
    SELECT id FROM scoutlab_players WHERE league = 'Ligue 1'
  );
```

### 실행

```bash
nohup npm run scrape:scoutlab -- --league="Ligue 1" --match-position \
  > scrape-ligue1-match-position.log 2>&1 &
echo "PID: $!"
```

### 모니터링

```bash
tail -20 scrape-ligue1-match-position.log
grep -c "팀:" scrape-ligue1-match-position.log      # 총 18팀
```

---

## S605: PL 재스크래핑 (AM/W → match-position 전환)

### 사전 준비

```sql
-- PL 기존 AM/W 메트릭 삭제 (359명 × 4 조합 = ~1,436행)
DELETE FROM scoutlab_metrics
WHERE comparison_position = 'AM/W'
  AND player_id IN (
    SELECT id FROM scoutlab_players WHERE league = 'Premier League'
  );
```

### 실행

```bash
nohup npm run scrape:scoutlab -- --league="Premier League" --match-position \
  > scrape-pl-match-position.log 2>&1 &
echo "PID: $!"
```

### 모니터링

```bash
tail -20 scrape-pl-match-position.log
grep -c "팀:" scrape-pl-match-position.log           # 총 20팀
```

---

## S606: 5대 리그 Similarity 수집

> S601~S605 완료 필수 (선수 마스터 데이터가 있어야 FK 유효)

```bash
# 순차 실행 (Streamlit 동시 접속 1개 제한)
nohup npm run scrape:scoutlab -- --similarity-only --league="La Liga" \
  > scrape-similarity-laliga.log 2>&1 &

# 위 완료 후
nohup npm run scrape:scoutlab -- --similarity-only --league="Serie A" \
  > scrape-similarity-seriea.log 2>&1 &

# 위 완료 후
nohup npm run scrape:scoutlab -- --similarity-only --league="Bundesliga" \
  > scrape-similarity-bundesliga.log 2>&1 &

# 위 완료 후
nohup npm run scrape:scoutlab -- --similarity-only --league="Ligue 1" \
  > scrape-similarity-ligue1.log 2>&1 &

# PL은 이미 3명만 있으므로 전체 수집
nohup npm run scrape:scoutlab -- --similarity-only --league="Premier League" \
  > scrape-similarity-pl.log 2>&1 &
```

---

## S607: 데이터 검증 + UI 통합 테스트

### 데이터 검증 쿼리

```sql
-- 1. 리그별 선수 수
SELECT league, COUNT(*) as player_count
FROM scoutlab_players WHERE season = '25/26'
GROUP BY league ORDER BY league;
-- 기대: PL ~359, La Liga ~380, Serie A ~380, BL ~300, L1 ~300

-- 2. 리그별 포지션 분포 (match-position 검증)
SELECT p.league, m.comparison_position, COUNT(*) as cnt
FROM scoutlab_metrics m
JOIN scoutlab_players p ON m.player_id = p.id
WHERE m.mode = 'per90' AND m.adjustment = 'padj'
GROUP BY p.league, m.comparison_position
ORDER BY p.league, m.comparison_position;
-- 기대: 각 리그에서 CB/FB/MF/AM/W/FW 골고루 분포

-- 3. 선수 position ↔ comparison_position 일치 확인
SELECT p.position, m.comparison_position,
  CASE WHEN p.position = m.comparison_position THEN 'MATCH' ELSE 'MISMATCH' END as status,
  COUNT(*) as cnt
FROM scoutlab_metrics m
JOIN scoutlab_players p ON m.player_id = p.id
WHERE m.mode = 'per90' AND m.adjustment = 'padj'
GROUP BY p.position, m.comparison_position, status
ORDER BY status DESC, cnt DESC;
-- 기대: 대부분 MATCH, MISMATCH는 폴백 케이스만

-- 4. Similarity 완성도
SELECT p.league, COUNT(*) as sim_count
FROM scoutlab_similarity s
JOIN scoutlab_players p ON s.player_id = p.id
GROUP BY p.league ORDER BY p.league;

-- 5. 빈 메트릭 확인 (문제 선수 검출)
SELECT p.name, p.team, p.league
FROM scoutlab_metrics m
JOIN scoutlab_players p ON m.player_id = p.id
WHERE m.final_product = '{}' AND m.mode = 'per90' AND m.adjustment = 'padj';
```

### 프론트엔드 체크리스트

1. [ ] **Ranking**: 리그 필터 → 각 리그 선택 시 해당 리그만 표시
2. [ ] **Ranking**: "모든 리그" → 5대 리그 통합 Top 50 + 리그 컬럼 구분
3. [ ] **Scatter**: 리그 필터 적용 → 해당 리그 점만 표시
4. [ ] **Scatter**: "모든 리그" → 1,500+ 점 렌더링 성능 확인
5. [ ] **Compare**: 서로 다른 리그 선수 간 비교 정상 동작
6. [ ] **Player Card**: 각 리그 선수 검색 → 메트릭 표시 (본인 포지션 백분위)
7. [ ] **Similarity**: 선수별 20명 유사 선수 목록 표시

---

## 실패 선수 재시도

```bash
# 특정 선수만 재스크래핑
npm run scrape:scoutlab -- \
  --player="선수명" --team="팀명" --league="리그명" --match-position

# headless=false로 디버깅
npm run scrape:scoutlab -- \
  --player="선수명" --team="팀명" --league="리그명" --match-position --headless=false
```

---

## 주의사항

- Streamlit **동시 접속 1개 제한** — 병렬 실행 불가
- 네트워크 유선 연결 권장 (4시간+ 세션)
- `tmux`/`nohup` 필수 (터미널 세션 유지)
- 스크래퍼 중간 실패 시 upsert 기반이므로 재실행해도 안전
- `--match-position` 사용 시 포지션 매핑 불가한 선수는 AM/W 폴백 (로그에 경고 출력)
