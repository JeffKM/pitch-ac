// 축구 용어 더미 데이터 — 15개

import type { GlossaryTerm } from "@/types";

export const mockGlossaryTerms: GlossaryTerm[] = [
  {
    id: "xg",
    term: "xG",
    definition:
      "Expected Goals. 슈팅 상황의 품질을 0~1 사이 수치로 나타낸 지표. 슈팅 위치, 각도, 어시스트 유형 등을 기반으로 계산한다.",
    analogy:
      "야구의 타율처럼, 단순히 득점 여부가 아닌 득점 기회의 질을 측정한다. 같은 10골이라도 xG 5.0이면 운이 좋은 것, xG 15.0이면 기회를 낭비한 것이다.",
    example:
      "살라가 이번 시즌 22골을 넣었지만 xG는 18.4. 기대치보다 약 3.6골 더 넣은 것이다.",
  },
  {
    id: "xa",
    term: "xA",
    definition:
      "Expected Assists. 패스가 골로 이어질 확률을 수치화한 지표. 실제 어시스트가 아닌 골을 만들 수 있는 패스의 품질을 측정한다.",
    analogy:
      "마지막 패스의 '잠재력'을 수치로 표현한 것. 완벽한 스루패스라도 공격수가 놓치면 어시스트가 안 되지만, xA는 높게 기록된다.",
    example:
      "드 브루이너는 어시스트 12개에 xA 10.9. 실제 어시스트가 기대치보다 약간 높다.",
  },
  {
    id: "xgi",
    term: "xGI",
    definition:
      "Expected Goal Involvement. xG와 xA를 합산한 지표. 선수의 공격 기여도를 종합적으로 평가한다.",
    analogy:
      "공격수와 미드필더 모두를 공평하게 비교할 수 있는 종합 공격력 척도.",
    example:
      "살라의 이번 시즌 xGI는 xG(18.4) + xA(11.7) = 30.1로 리그 최고 수준이다.",
  },
  {
    id: "possession",
    term: "Possession",
    definition: "점유율. 경기 중 한 팀이 공을 소유한 시간의 비율(%)이다.",
    analogy:
      "요리사가 칼을 쥐고 있는 시간. 오래 쥐고 있다고 좋은 요리가 나오는 건 아니지만, 기회를 만드는 데 유리하다.",
    example: "맨시티는 리버풀전에서 52% 점유율을 기록했지만 3-2로 패배했다.",
  },
  {
    id: "key-pass",
    term: "Key Pass",
    definition:
      "슈팅으로 직접 이어지는 패스. 어시스트와 달리 골이 없어도 기록된다.",
    analogy:
      "농구의 어시스트와 유사하지만, 득점 여부와 무관하게 기회를 만든 패스를 카운트한다.",
    example:
      "오데고르는 이번 시즌 88개의 키패스로 리그 1위. 매 경기 평균 3.3번 슈팅 기회를 만들었다.",
  },
  {
    id: "progressive-pass",
    term: "Progressive Pass",
    definition:
      "공을 상대 골대 방향으로 유의미하게 전진시키는 패스. 일반적으로 10야드(9.14m) 이상 전진하는 패스를 의미한다.",
    analogy:
      "체스에서 말을 앞으로 전진시키는 수처럼, 팀을 공격적 위치로 이동시키는 패스.",
    example:
      "드 브루이너는 경기당 평균 12.4개의 프로그레시브 패스로 팀의 전진을 이끈다.",
  },
  {
    id: "shot-on-target",
    term: "Shot on Target",
    definition:
      "유효슈팅. 골대 안으로 향한 슈팅 또는 골키퍼가 막아야 했던 슈팅이다. 골대 바깥으로 나간 슈팅은 포함되지 않는다.",
    analogy: "농구의 자유투처럼, 실제로 득점 기회가 된 슈팅만을 카운트한다.",
    example:
      "할란드는 이번 시즌 유효슈팅율 62%로, 10번 슈팅하면 6번 이상 골대 안으로 향한다.",
  },
  {
    id: "clean-sheet",
    term: "Clean Sheet",
    definition:
      "무실점. 경기 전체에서 실점 없이 끝낸 경우를 말한다. 주로 골키퍼와 수비수의 성과 지표로 활용된다.",
    analogy: "야구의 완봉처럼, 상대팀을 완전히 봉쇄한 경기.",
    example:
      "알리송은 이번 시즌 12번의 클린시트로 리그 최다. 경기의 44%를 무실점으로 마쳤다.",
  },
  {
    id: "dribble",
    term: "Dribble",
    definition:
      "드리블 성공. 상대 수비수를 개인기로 제치고 공을 유지한 횟수이다. 시도 대비 성공률도 중요한 지표다.",
    analogy:
      "마치 권투 선수의 페인트처럼, 상대의 중심을 무너뜨리고 공간을 만들어내는 능력.",
    example:
      "사카는 이번 시즌 95번의 드리블 성공으로 리그 1위. 도전 성공률도 78%에 달한다.",
  },
  {
    id: "tackle",
    term: "Tackle",
    definition:
      "태클 성공. 상대 선수로부터 공을 빼앗는 데 성공한 횟수. 단순 시도가 아닌 성공적인 태클만 카운트한다.",
    analogy:
      "미식축구의 사이드라인 압박처럼, 공을 가진 상대의 전진을 막아내는 수비 기술.",
    example:
      "살리바는 경기당 평균 2.8번의 태클 성공으로 아스날 수비의 핵심이다.",
  },
  {
    id: "aerial-duel",
    term: "Aerial Duel",
    definition:
      "공중볼 경합. 헤딩 다툼에서 이긴 비율(승률)이 핵심 지표다. 센터백과 스트라이커에게 특히 중요하다.",
    analogy:
      "두 선수가 동시에 뛰어오르는 경합 — 키와 타이밍, 점프력 모두가 결합된 능력.",
    example:
      "반 다이크는 공중볼 승률 81%로 리그 최고의 공중볼 지배력을 보여준다.",
  },
  {
    id: "pass-accuracy",
    term: "Pass Accuracy",
    definition:
      "패스 성공률(%). 시도한 패스 중 성공한 비율이다. 단, 짧은 패스와 긴 패스의 난이도 차이를 고려해야 한다.",
    analogy:
      "농구 자유투 성공률처럼, 단순 수치보다 어떤 패스를 시도했는지의 맥락이 중요하다.",
    example:
      "드 브루이너의 패스 성공률은 84%이지만, 긴 전진 패스 비중이 높아 이는 매우 높은 수준이다.",
  },
  {
    id: "through-ball",
    term: "Through Ball",
    definition:
      "스루패스. 수비 라인 뒤의 공간으로 보내는 날카로운 패스. 오프사이드 트랩을 깨는 데 활용된다.",
    analogy:
      "체스의 나이트 이동처럼, 상대 수비 라인을 뚫고 공격수에게 1대1 기회를 만드는 패스.",
    example:
      "오데고르는 이번 시즌 정확한 스루패스를 22번 성공, 이 중 8번이 득점 기회로 이어졌다.",
  },
  {
    id: "cross",
    term: "Cross",
    definition:
      "크로스. 측면에서 중앙 페널티 지역으로 올리는 패스. 헤딩 득점을 노리는 공격 패턴에서 핵심이다.",
    analogy:
      "야구 투수가 타자 앞에 공을 배달하듯, 윙어가 스트라이커의 머리 앞에 공을 배달하는 것.",
    example:
      "리스 제임스는 이번 시즌 크로스 정확도 38%로 리그 풀백 중 최고 수준.",
  },
  {
    id: "interception",
    term: "Interception",
    definition:
      "인터셉트. 상대팀의 패스를 중간에 차단하여 공을 빼앗는 수비 기술이다.",
    analogy:
      "미식축구에서 쿼터백의 패스를 수비수가 가로채는 것처럼, 상대의 의도를 미리 읽어 패스를 막는 능력.",
    example:
      "반 다이크는 경기당 평균 1.6번의 인터셉트로 리버풀 수비 라인을 조율한다.",
  },
  {
    id: "goal",
    term: "Goal",
    definition:
      "골. 공이 상대 골라인을 완전히 넘어 득점으로 인정된 횟수. 자책골을 제외한 순수 득점 수다.",
    analogy:
      "야구의 홈런처럼, 가장 직접적이고 명확한 득점 기여 지표. 하지만 xG와 함께 봐야 진짜 실력을 알 수 있다.",
    example:
      "살라는 이번 시즌 22골로 리그 1위. xG(18.4)를 3.6골 초과하여 결정력도 탁월하다.",
  },
  {
    id: "shot",
    term: "Shot",
    definition:
      "슈팅. 골대 안팎을 불문하고 득점 의도를 가진 모든 발·머리 시도를 포함한다. 유효슈팅(on target)과 비유효슈팅의 합산이다.",
    analogy:
      "농구의 필드골 시도처럼, 골을 노리는 모든 시도를 카운트한다. 성공 여부보다 시도 빈도와 위치가 중요하다.",
    example:
      "할란드는 경기당 평균 4.2번의 슈팅으로 리그 최다. 그중 62%가 유효슈팅이다.",
  },
  {
    id: "corner-kick",
    term: "Corner Kick",
    definition:
      "코너킥. 수비팀이 자기 골라인 밖으로 걷어낸 공을 공격팀이 코너 아크에서 차는 세트피스 상황이다.",
    analogy:
      "야구의 4구 출루처럼, 직접 득점은 아니지만 공격 기회를 만드는 중요한 세트피스. 공중볼 싸움 능력이 결정적이다.",
    example:
      "맨시티는 이번 시즌 코너킥 7개 중 2골을 기록. 세트피스 훈련의 결실이다.",
  },
  {
    id: "foul",
    term: "Foul",
    definition:
      "파울. 상대 선수에 대한 반칙 행위로 심판이 프리킥을 선언한 건수. 경고·퇴장의 원인이 되기도 한다.",
    analogy:
      "농구의 파울처럼, 과도한 신체 접촉을 제한하는 규칙 위반. 너무 많으면 상대에게 세트피스 기회를 헌납한다.",
    example:
      "카세미루는 경기당 평균 2.1개의 파울로 중원 압박을 가하지만, 카드 경고에 주의해야 한다.",
  },
  {
    id: "average-rating",
    term: "Average Rating",
    definition:
      "평균 평점. 경기별 선수 퍼포먼스를 10점 만점으로 평가한 수치의 시즌 평균. 패스, 슈팅, 수비 기여 등 종합적 활약을 반영한다.",
    analogy:
      "학교 성적표의 평균 점수처럼, 단일 항목이 아닌 전반적인 활약도를 하나의 수치로 요약한다.",
    example:
      "드 브루이너의 평균 평점은 8.1로 리그 미드필더 중 최고. 매 경기 높은 수준을 일관되게 유지한다.",
  },
];

/** ID로 용어 조회 */
export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return mockGlossaryTerms.find((term) => term.id === id);
}

/** 용어명으로 검색 */
export function searchGlossaryTerms(query: string): GlossaryTerm[] {
  const q = query.toLowerCase();
  return mockGlossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(q) ||
      term.definition.toLowerCase().includes(q),
  );
}
