// ScoutLab 용어 정의 상수 — 11개 카테고리별 메트릭 설명
import type { ScoutlabCategory } from "@/types";

export interface ScoutlabGlossaryTerm {
  /** 메트릭 키 (DB JSONB 키 그대로, UPPER CASE) */
  key: string;
  /** 영문 표시명 ("xG") — 팝오버 제목용 */
  label: string;
  /** 한국어 짧은 부연 (10자 이내, "기대 득점") */
  brief: string;
  /** 맥락적 상세 설명 (2-3문장, 팝오버 본문) */
  description: string;
  /** 구체적 예시 (선택적, 팝오버 하단) */
  example?: string;
}

export interface ScoutlabGlossaryCategory {
  category: ScoutlabCategory;
  label: string;
  terms: ScoutlabGlossaryTerm[];
}

export const SCOUTLAB_GLOSSARY: ScoutlabGlossaryCategory[] = [
  {
    category: "final_product",
    label: "Final Product",
    terms: [
      {
        key: "NPG + OPA",
        label: "NPG + OPA",
        brief: "비PK골+도움",
        description:
          "페널티킥을 제외한 골과 오픈 플레이 도움을 합산한 값. PK 득점에 의존하지 않는 순수 공격 생산성을 보여준다.",
      },
      {
        key: "NPXG + OPXA",
        label: "npxG + opxA",
        brief: "기대 공격기여",
        description:
          "비PK 기대 득점(npxG)과 오픈 플레이 기대 도움(opxA)의 합산. 실제 결과가 아닌 기회의 질로 공격 기여도를 평가한다.",
        example:
          "이 수치가 높으면 좋은 슈팅 기회를 만들고, 동료에게도 좋은 찬스를 공급하고 있다는 뜻.",
      },
      {
        key: "DEEP SHOT INVOLVEMENT",
        label: "Deep Shot Involvement",
        brief: "근거리 슈팅 관여",
        description:
          "페널티 에어리어 안쪽에서 발생한 슈팅에 직접 관여(슈팅 or 어시스트)한 빈도. 위험 지역에서의 존재감을 측정한다.",
      },
      {
        key: "DEEP ZONE INVOLVEMENT",
        label: "Deep Zone Involvement",
        brief: "위험지역 관여",
        description:
          "상대 페널티 에어리어 인근 위험 지역에서 볼에 관여한 빈도. 공격 핵심 지역에서 얼마나 자주 플레이에 참여하는지 보여준다.",
      },
      {
        key: "OFFENSIVE ACTION VAEP",
        label: "Offensive Action VAEP",
        brief: "공격 행동 가치",
        description:
          "공격적 행동(패스, 드리블, 슈팅 등)이 팀의 득점 확률을 높인 총량. 골이나 어시스트 외에도 공격에 기여하는 모든 행동을 포착한다.",
      },
      {
        key: "BIG CHANCE INVOLVEMENT",
        label: "Big Chance Involvement",
        brief: "빅찬스 관여",
        description:
          "결정적 찬스에 직접 관여(슈팅 or 어시스트)한 빈도. xG가 높은 기회를 만들거나 마무리하는 능력을 보여준다.",
      },
      {
        key: "NPXG + OPXA - XA RECEIVED",
        label: "npxG + opxA − xA Received",
        brief: "순수 공격기여",
        description:
          "자신이 만든 기대 공격기여에서 동료로부터 받은 기대 도움을 뺀 값. 높을수록 동료 의존 없이 스스로 기회를 만드는 선수.",
      },
    ],
  },
  {
    category: "shooting",
    label: "Shooting",
    terms: [
      {
        key: "NPXG",
        label: "npxG",
        brief: "비PK 기대 득점",
        description:
          "PK를 제외한 기대 득점. PK는 xG가 약 0.76으로 높기 때문에, 이를 빼야 순수한 슈팅 기회의 질을 비교할 수 있다.",
      },
      {
        key: "OP XG",
        label: "OP xG",
        brief: "오픈플레이 기대골",
        description:
          "세트피스를 제외한 오픈 플레이에서의 기대 득점. 흐름 속에서 만드는 슈팅 기회의 질만 평가한다.",
      },
      {
        key: "SHOTS",
        label: "Shots",
        brief: "슈팅",
        description:
          "전체 슈팅 시도 횟수. 적극성과 공격 참여도를 보여주지만, 양보다 질이 중요할 수 있다.",
      },
      {
        key: "NPXGOT",
        label: "npxGOT",
        brief: "유효슈팅 기대골",
        description:
          "골대 안으로 향한 슈팅의 기대 득점. 유효 슈팅의 질을 평가하며, 골키퍼에게 실제 위협이 되는 슈팅인지 측정한다.",
      },
      {
        key: "SHOT VAEP",
        label: "Shot VAEP",
        brief: "슈팅 가치",
        description:
          "슈팅 행동이 팀의 득점 확률에 기여한 총 가치. 골로 이어지지 않아도 위협적인 슈팅의 가치를 수치화한다.",
      },
      {
        key: "DEEP SHOTS",
        label: "Deep Shots",
        brief: "근거리 슈팅",
        description:
          "페널티 에어리어 안쪽에서 시도한 슈팅. 좋은 위치에서 슈팅하고 있는지 보여주는 핵심 지표.",
      },
      {
        key: "BIG CHANCES",
        label: "Big Chances",
        brief: "결정적 기회",
        description:
          "xG가 높은 결정적 득점 기회. 보통 골키퍼와 1대1 또는 빈 골대 상황을 의미한다.",
      },
      {
        key: "NON-PENALTY GOALS",
        label: "Non-Penalty Goals",
        brief: "비PK 득점",
        description:
          "페널티킥을 뺀 순수 득점. PK 전담 선수의 골 수를 과대평가하지 않고, 오픈 플레이에서의 득점 능력만 비교할 때 유용하다.",
      },
      {
        key: "NPXG - XA RECEIVED",
        label: "npxG − xA Received",
        brief: "자력 기대 득점",
        description:
          "기대 득점에서 동료 패스의 기대 도움을 뺀 값. 높을수록 동료 도움 없이 스스로 득점 기회를 만드는 선수.",
      },
      {
        key: "NPXG PER SHOT (P60)",
        label: "npxG per Shot (P60)",
        brief: "슈팅당 기대골",
        description:
          "슈팅 한 번의 평균 질 (P60 보정). 높을수록 좋은 위치에서 슈팅하고 있다는 의미.",
      },
      {
        key: "NPXG PER SHOT (AVERAGE)",
        label: "npxG per Shot (Avg)",
        brief: "평균 슈팅 질",
        description:
          "슈팅당 평균 기대 득점. 무리한 슈팅이 많으면 낮고, 좋은 위치를 선점하면 높아진다.",
      },
      {
        key: "NPXGOT OVERPERFORMANCE%",
        label: "npxGOT Overperformance%",
        brief: "유효슈팅 초과",
        description:
          "유효 슈팅의 실제 성과가 기대치를 얼마나 초과했는지. 양수면 골키퍼를 뚫는 슈팅 능력이 뛰어나다는 뜻.",
      },
      {
        key: "NPGOALS OVERPERFORMANCE%",
        label: "NPGoals Overperformance%",
        brief: "득점 초과율",
        description:
          "실제 비PK 득점이 기대 득점을 얼마나 초과했는지. 장기적으로 0에 수렴하는 경향이 있어, 극단적 값은 운의 영향일 수 있다.",
      },
    ],
  },
  {
    category: "creation",
    label: "Creation",
    terms: [
      {
        key: "XGCHAIN",
        label: "xGChain",
        brief: "연계 기대 득점",
        description:
          "골로 이어진 공격 시퀀스에 참여한 선수에게 부여되는 xG. 직접 슈팅하지 않아도 공격 빌드업에 기여한 정도를 측정한다.",
      },
      {
        key: "OP CROSS%",
        label: "OP Cross%",
        brief: "오픈플레이 크로스율",
        description:
          "오픈 플레이에서 크로스를 시도한 비율. 윙어나 풀백의 공격 스타일을 파악하는 데 유용하다.",
      },
      {
        key: "PASS VAEP",
        label: "Pass VAEP",
        brief: "패스 가치",
        description:
          "패스 행동이 팀의 득점 확률에 기여한 총 가치. 어시스트가 아니더라도 팀 공격에 기여하는 패스를 수치화한다.",
      },
      {
        key: "CARRY VAEP",
        label: "Carry VAEP",
        brief: "드리블 가치",
        description:
          "볼 운반(드리블) 행동이 팀의 득점 확률에 기여한 총 가치. 공간을 열고 수비를 끌어내는 드리블의 가치를 측정한다.",
      },
      {
        key: "CROSS VAEP",
        label: "Cross VAEP",
        brief: "크로스 가치",
        description:
          "크로스 행동이 팀의 득점 확률에 기여한 총 가치. 성공 여부와 관계없이 크로스의 위협도를 평가한다.",
      },
      {
        key: "DEEP CARRIES",
        label: "Deep Carries",
        brief: "위험지역 운반",
        description:
          "상대 페널티 에어리어 인근까지 볼을 운반한 횟수. 직접 공을 몰고 위험 지역으로 진입하는 능력.",
      },
      {
        key: "OPEN PLAY XA",
        label: "Open Play xA",
        brief: "오픈플레이 기대도움",
        description:
          "세트피스를 제외한 오픈 플레이에서의 기대 도움. 흐름 속에서 동료에게 좋은 슈팅 기회를 만들어주는 능력.",
      },
      {
        key: "PASS XTHREAT",
        label: "Pass xThreat",
        brief: "패스 위협도",
        description:
          "패스로 인해 증가한 득점 위협도. 공을 더 위험한 위치로 이동시킨 패스일수록 높다.",
      },
      {
        key: "CARRY XTHREAT",
        label: "Carry xThreat",
        brief: "운반 위협도",
        description:
          "드리블로 인해 증가한 득점 위협도. 공을 직접 몰고 위험 지역으로 전진할수록 높아진다.",
      },
      {
        key: "CROSS XTHREAT",
        label: "Cross xThreat",
        brief: "크로스 위협도",
        description:
          "크로스로 인해 증가한 득점 위협도. 좋은 위치의 동료에게 연결되는 크로스일수록 높다.",
      },
      {
        key: "XTHREAT CREATED",
        label: "xThreat Created",
        brief: "생성 위협도",
        description:
          "패스, 드리블, 크로스 등 모든 행동으로 만들어낸 총 득점 위협도. 종합적 창의성 지표.",
      },
      {
        key: "DEEP COMPLETIONS",
        label: "Deep Completions",
        brief: "위험지역 패스성공",
        description:
          "상대 페널티 에어리어 인근으로 성공적으로 연결한 패스 수. 최종 단계 패스 능력을 보여준다.",
      },
      {
        key: "DEEP PROGRESSIONS",
        label: "Deep Progressions",
        brief: "위험지역 전진",
        description:
          "패스나 드리블로 상대 위험 지역까지 공을 전진시킨 횟수. 공격 전환의 마무리 단계 능력.",
      },
      {
        key: "PASS + CARRY VAEP",
        label: "Pass + Carry VAEP",
        brief: "패스+운반 가치",
        description:
          "패스와 볼 운반 행동의 VAEP를 합산한 값. 슈팅을 제외한 순수 창의성과 전진 기여도를 종합 평가한다.",
      },
      {
        key: "DEEP SHOTS ASSISTED",
        label: "Deep Shots Assisted",
        brief: "근거리 슈팅 도움",
        description:
          "페널티 에어리어 안쪽에서의 슈팅으로 이어진 패스를 제공한 횟수. 위험 지역에서 동료의 슈팅을 만드는 능력.",
      },
      {
        key: "SHOT-ENDING CARRIES",
        label: "Shot-ending Carries",
        brief: "슈팅연결 드리블",
        description:
          "드리블 후 직접 슈팅으로 마무리한 횟수. 개인 돌파 후 마무리까지 연결하는 능력.",
      },
      {
        key: "THROUGH BALL PASSES",
        label: "Through Ball Passes",
        brief: "쓰루 패스",
        description:
          "수비 라인 사이로 통과시키는 패스. 성공률은 낮지만 단번에 결정적 기회를 만들 수 있는 위험한 패스.",
      },
      {
        key: "OP BIG CHANCES CREATED",
        label: "OP Big Chances Created",
        brief: "오픈 빅찬스 창출",
        description:
          "오픈 플레이에서 동료에게 결정적 기회를 만들어준 횟수. 세트피스를 제외한 순수 찬스 메이킹 능력.",
      },
    ],
  },
  {
    category: "passing",
    label: "Passing",
    terms: [
      {
        key: "LONG PASS%",
        label: "Long Pass%",
        brief: "롱패스 성공률",
        description:
          "롱패스 성공 비율. 수비수나 골키퍼의 빌드업 능력, 또는 미드필더의 전환 패스 정확도를 보여준다.",
      },
      {
        key: "XT BUILDUP",
        label: "xT Buildup",
        brief: "빌드업 위협도",
        description:
          "빌드업 과정에서 패스와 볼 운반으로 생성한 위협도. 중원에서 공격으로의 전환 기여를 측정한다.",
      },
      {
        key: "LONG PASSES",
        label: "Long Passes",
        brief: "롱패스",
        description:
          "30야드 이상의 긴 패스 횟수. 빠른 전환이나 사이드 체인지에 활용되는 패스 능력.",
      },
      {
        key: "FIELDS GAINED",
        label: "Fields Gained",
        brief: "전진 거리",
        description:
          "패스와 드리블로 골문 방향으로 전진시킨 총 거리(야드). 팀의 공격 진행에 대한 물리적 기여도.",
      },
      {
        key: "FORWARD PASS%",
        label: "Forward Pass%",
        brief: "전방패스 비율",
        description:
          "전방(골문 방향)으로 향하는 패스의 비율. 높을수록 적극적인 패스 성향을 보여준다.",
      },
      {
        key: "FORWARD PASSES",
        label: "Forward Passes",
        brief: "전방 패스",
        description:
          "골문 방향으로 향하는 패스 횟수. 볼을 앞으로 전진시키려는 의지를 보여주는 기본 지표.",
      },
      {
        key: "PROGRESSIVE PASS%",
        label: "Progressive Pass%",
        brief: "전진패스 비율",
        description:
          "상대 골문 방향으로 10야드 이상 전진시키는 패스의 비율. 안정적 패스와 도전적 패스의 균형을 보여준다.",
      },
      {
        key: "PROGRESSIVE PASSES",
        label: "Progressive Passes",
        brief: "전진 패스",
        description:
          "상대 골문 방향으로 10야드 이상 전진시키는 패스. 팀을 공격적 위치로 끌어올리는 능력을 보여주는 핵심 지표.",
      },
      {
        key: "FINAL THIRD ENTRIES",
        label: "Final Third Entries",
        brief: "파이널써드 진입",
        description:
          "패스나 드리블로 상대 파이널 써드에 진입한 총 횟수. 중원에서 공격 전환을 이끄는 능력.",
      },
      {
        key: "PROGRESSIVE ACTIONS",
        label: "Progressive Actions",
        brief: "전진 액션",
        description:
          "전진 패스와 전진 드리블을 합산한 횟수. 수단에 관계없이 팀을 앞으로 이끄는 종합 전진력.",
      },
      {
        key: "PROGRESSIVE CARRIES",
        label: "Progressive Carries",
        brief: "전진 드리블",
        description:
          "상대 골문 방향으로 10야드 이상 볼을 운반하는 드리블. 패스 없이도 팀의 공격 진행에 기여하는 추진력.",
      },
      {
        key: "PASSES TO FINAL THIRD",
        label: "Passes to Final Third",
        brief: "파이널써드 패스",
        description:
          "상대 파이널 써드로 연결하는 패스 수. 중원에서 공격 전환의 시작점 역할을 얼마나 하는지 보여준다.",
      },
      {
        key: "CARRIES TO FINAL THIRD",
        label: "Carries to Final Third",
        brief: "파이널써드 운반",
        description:
          "드리블로 파이널 써드까지 볼을 운반한 횟수. 직접 공을 몰고 올라가는 추진력의 지표.",
      },
      {
        key: "XPASS OVERPERFORMANCE%",
        label: "xPass Overperformance%",
        brief: "패스 초과성과",
        description:
          "패스 성공률이 기대치를 얼마나 초과하는지. 양수면 기대보다 어려운 패스를 성공시키는 능력이 뛰어나다는 뜻.",
      },
      {
        key: "FIELDS GAINED BY PASSES",
        label: "Fields Gained by Passes",
        brief: "패스 전진거리",
        description:
          "패스만으로 골문 방향으로 전진시킨 거리. 드리블이 아닌 패스를 통한 공간 전진 기여도.",
      },
      {
        key: "FIELDS GAINED BY CARRIES",
        label: "Fields Gained by Carries",
        brief: "운반 전진거리",
        description:
          "드리블로 골문 방향으로 전진시킨 거리. 패스가 아닌 개인 운반을 통한 공간 전진 기여도.",
      },
      {
        key: "SHARE OF TEAM PROGRESSION",
        label: "Share of Team Progression",
        brief: "팀 전진 점유율",
        description:
          "팀 전체 전진 행동 중 해당 선수가 차지하는 비율. 팀 내에서 공격 진행의 핵심 역할인지 보여준다.",
      },
      {
        key: "FIELDS GAINED PER INCOMPLETION",
        label: "Fields Gained per Incompletion",
        brief: "실패당 전진거리",
        description:
          "패스 실패 1회당 전진시킨 거리. 높을수록 실패해도 충분한 전진을 만들어내는 효율적 패서라는 뜻.",
      },
    ],
  },
  {
    category: "ball_carrying",
    label: "Ball Carrying",
    terms: [
      {
        key: "PRODUCTIVE DRIBBLES",
        label: "Productive Dribbles",
        brief: "생산적 드리블",
        description:
          "슈팅이나 찬스로 이어진 의미 있는 드리블 횟수. 단순히 제치는 것을 넘어 팀 공격에 실질적으로 기여한 돌파.",
      },
      {
        key: "SUCCESSFUL DRIBBLES",
        label: "Successful Dribbles",
        brief: "드리블 성공",
        description:
          "1대1 돌파에 성공한 횟수. 밀집 수비를 깨는 능력으로, 공격 전환 시 큰 위협이 된다.",
      },
      {
        key: "XDRIBBLE OVERPERFORMANCE%",
        label: "xDribble Overperformance%",
        brief: "드리블 초과성과",
        description:
          "드리블 성공률이 기대치를 얼마나 초과하는지. 양수면 어려운 상황에서도 돌파를 성공시키는 기술이 뛰어나다는 뜻.",
      },
    ],
  },
  {
    category: "defending",
    label: "Defending",
    terms: [
      {
        key: "RECOVERIES",
        label: "Recoveries",
        brief: "볼 회수",
        description:
          "루즈볼이나 50:50 상황에서 볼을 되찾은 횟수. 수비적 노력과 전환 플레이의 시작점.",
      },
      {
        key: "BLOCKED SHOTS",
        label: "Blocked Shots",
        brief: "슈팅 블로킹",
        description:
          "상대의 슈팅을 몸으로 막은 횟수. 마지막 순간에 위험을 차단하는 헌신적 수비를 보여준다.",
      },
      {
        key: "BOX CLEARANCES",
        label: "Box Clearances",
        brief: "박스 내 클리어",
        description:
          "자기 팀 페널티 에어리어에서 볼을 걷어낸 횟수. 가장 위험한 지역에서의 위기 해결 능력.",
      },
      {
        key: "DEF. AERIAL DUEL%",
        label: "Def. Aerial Duel%",
        brief: "수비 공중볼 승률",
        description:
          "수비 상황에서의 공중 경합 승률. 세트피스 수비와 롱볼 대응에서 특히 중요한 지표.",
      },
      {
        key: "DEF. GROUND DUEL%",
        label: "Def. Ground Duel%",
        brief: "수비 지상 승률",
        description:
          "수비 상황에서의 지상 1대1 경합 승률. 상대 공격수와의 직접 대결에서 얼마나 이기는지 보여준다.",
      },
      {
        key: "XTHREAT PREVENTED",
        label: "xThreat Prevented",
        brief: "위협 차단",
        description:
          "수비 행동으로 상대의 득점 위협도를 감소시킨 총량. 보이지 않는 수비 기여를 수치화한다.",
      },
      {
        key: "DEF. AERIAL DUELS WON",
        label: "Def. Aerial Duels Won",
        brief: "수비 공중볼 성공",
        description:
          "수비 상황에서 공중 경합에 이긴 횟수. 승률과 함께 보면 공중볼 수비의 양과 질을 모두 파악할 수 있다.",
      },
      {
        key: "DEF. GROUND DUELS WON",
        label: "Def. Ground Duels Won",
        brief: "수비 지상 성공",
        description:
          "수비 상황에서 지상 1대1 경합에 이긴 횟수. 태클, 인터셉트 등 모든 지상 수비 경합을 포함한다.",
      },
      {
        key: "DEFENSIVE ACTION VAEP",
        label: "Defensive Action VAEP",
        brief: "수비 행동 가치",
        description:
          "수비 행동(태클, 인터셉트, 블로킹 등)이 상대의 득점 확률을 낮춘 총량. 수비수의 보이지 않는 기여를 수치화한다.",
      },
      {
        key: "TACKLES + INTERCEPTIONS",
        label: "Tackles + Interceptions",
        brief: "태클+인터셉트",
        description:
          "태클과 인터셉트를 합산한 수비 활동 횟수. 적극적 수비와 예측 수비를 모두 포함하는 종합 수비 지표.",
      },
    ],
  },
  {
    category: "set_pieces",
    label: "Set Pieces",
    terms: [
      {
        key: "SP XA",
        label: "SP xA",
        brief: "세트피스 기대도움",
        description:
          "세트피스 상황에서의 기대 도움. 코너킥, 프리킥 등에서 동료에게 좋은 슈팅 기회를 만들어주는 능력.",
      },
      {
        key: "FREE-KICK XG",
        label: "Free-kick xG",
        brief: "프리킥 기대 득점",
        description:
          "직접 프리킥에서의 기대 득점. 프리킥 직접 슈팅의 위치와 질을 반영한다.",
      },
      {
        key: "SP XG (EXCL. FK)",
        label: "SP xG (excl. FK)",
        brief: "세트피스 기대골",
        description:
          "직접 프리킥을 제외한 세트피스에서의 기대 득점. 코너킥, 간접 프리킥 등에서의 득점 기회.",
      },
    ],
  },
  {
    category: "aerial",
    label: "Aerial",
    terms: [
      {
        key: "AERIAL DUEL%",
        label: "Aerial Duel%",
        brief: "공중볼 승률",
        description:
          "공중 경합 승률. 단순 횟수보다 효율을 보여주며, 센터백이나 타깃맨 평가에 핵심적인 지표.",
      },
      {
        key: "AERIAL DUELS WON",
        label: "Aerial Duels Won",
        brief: "공중볼 성공",
        description:
          "공중 경합에서 이긴 횟수. 세트피스 수비와 공격, 롱볼 전략에서 중요한 지표.",
      },
    ],
  },
  {
    category: "possession",
    label: "Possession",
    terms: [
      {
        key: "RECEIVED VAEP",
        label: "Received VAEP",
        brief: "수신 가치",
        description:
          "볼을 받는 행동의 VAEP 가치. 좋은 위치에서 볼을 받아 팀의 득점 확률을 높이는 능력을 측정한다.",
      },
      {
        key: "DEEP RECEPTIONS",
        label: "Deep Receptions",
        brief: "위험지역 수신",
        description:
          "상대 페널티 에어리어 인근에서 볼을 받은 횟수. 위험 지역에서 볼을 받으려는 움직임과 포지셔닝 능력.",
      },
      {
        key: "RECEIVED XTHREAT",
        label: "Received xThreat",
        brief: "수신 위협도",
        description:
          "볼을 받을 때 발생하는 득점 위협도. 위험한 위치에서 동료 패스를 받을수록 높아진다.",
      },
      {
        key: "PROGRESSIVE RECEPTIONS",
        label: "Progressive Receptions",
        brief: "전진 패스 수신",
        description:
          "전진 패스를 받은 횟수. 볼을 받기 위해 좋은 위치를 잡고 움직이는 오프더볼 능력.",
      },
      {
        key: "RECEIVED THROUGH BALLS",
        label: "Received Through Balls",
        brief: "쓰루패스 수신",
        description:
          "쓰루 패스를 받은 횟수. 수비 라인 뒤를 노리는 타이밍과 스피드를 보여주는 지표.",
      },
    ],
  },
  {
    category: "vaep_overview",
    label: "VAEP Overview",
    terms: [],
  },
  {
    category: "misc",
    label: "Misc",
    terms: [],
  },
];

/** 메트릭 키 → 용어 빠른 조회 맵 */
export const SCOUTLAB_GLOSSARY_MAP: Record<string, ScoutlabGlossaryTerm> =
  SCOUTLAB_GLOSSARY.flatMap((cat) => cat.terms).reduce(
    (map, term) => {
      map[term.key] = term;
      return map;
    },
    {} as Record<string, ScoutlabGlossaryTerm>,
  );
