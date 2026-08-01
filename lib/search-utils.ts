// 악센트/발음기호 무관(diacritics-insensitive) 검색을 위한 문자열 정규화 유틸
// 선수명 검색에서 "Dembele"로 "Ousmane Dembélé"를 찾을 수 있도록 사용한다.

// NFD 정규화로 처리되지 않는 문자를 직접 매핑한다.
// - 획이 글자에 결합된 형태(분해 불가): ø(Sørloth), ł(Lewandowski), đ, ß, æ, œ, ð, þ
// - 터키어 점 없는 ı(Yazıcı): 분해 대상이 아니므로 i로 접어준다
// - 곡선 아포스트로피(’): DB에 "Konan N’Dri"처럼 저장돼 있어 사용자가 직선
//   아포스트로피(')로 입력하면 매칭되지 않으므로 ASCII로 통일한다
const CHAR_FOLD_MAP: Record<string, string> = {
  ø: "o",
  Ø: "O",
  ł: "l",
  Ł: "L",
  đ: "d",
  Đ: "D",
  ß: "ss",
  æ: "ae",
  Æ: "AE",
  œ: "oe",
  Œ: "OE",
  ð: "d",
  Ð: "D",
  þ: "th",
  Þ: "TH",
  ı: "i",
  "‘": "'",
  "’": "'",
  ʼ: "'",
};

// 매핑 테이블 키로부터 정규식을 생성해 표와 정규식이 어긋나는 실수를 막는다.
// (키에 정규식 특수문자 `- ] ^ \`를 넣으면 문자 클래스가 깨지므로 주의)
const CHAR_FOLD_REGEX = new RegExp(
  `[${Object.keys(CHAR_FOLD_MAP).join("")}]`,
  "g",
);

// 유니코드 결합 발음기호 영역(U+0300–U+036F). 결합 문자를 소스에 그대로 쓰면
// 에디터·포매터에서 앞 문자에 겹쳐 렌더링돼 깨지기 쉬우므로 이스케이프로 표기한다.
const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;

/**
 * 악센트·발음기호를 제거하고 소문자로 변환해 diacritics-insensitive 비교가 가능한
 * 형태로 정규화한다. NFD 분해로 처리되는 결합 문자(é, ą, ę 등)와, 분해되지 않는
 * 특수 문자(ø, ł, đ 등)를 모두 처리한다.
 */
export function normalizeForSearch(value: string): string {
  const mapped = value.replace(
    CHAR_FOLD_REGEX,
    (char) => CHAR_FOLD_MAP[char] ?? char,
  );
  return mapped
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    .toLowerCase();
}

/** name이 query를 diacritics-insensitive하게 포함하는지 확인한다 */
export function matchesSearchQuery(name: string, query: string): boolean {
  if (!query) return true;
  return normalizeForSearch(name).includes(normalizeForSearch(query));
}
