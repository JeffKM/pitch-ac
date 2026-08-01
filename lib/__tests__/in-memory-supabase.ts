// 테스트용 인메모리 Supabase 쿼리 빌더
// select/eq/lt/gte/not/in/order/limit/range/maybeSingle 체인을 지원하며
// 테이블별 행 배열을 필터·정렬해 반환한다 (날짜·시즌은 ISO/고정폭 문자열 → 사전순 비교)

type Row = Record<string, unknown>;

export interface InMemorySupabase {
  client: { from: (table: string) => unknown };
  /** 테이블별 행 설정 (테스트마다 초기화) */
  setRows: (table: string, rows: Row[]) => void;
  /** 다음 쿼리부터 반환할 에러 설정 (null이면 정상 동작) */
  setError: (error: { message: string } | null) => void;
  /**
   * PostgREST의 db-max-rows 상한을 흉내낸다 (opt-in, 기본 null = 상한 없음).
   * 설정하면 range/limit 없이 조회하거나 range가 상한보다 넓어도 한 번의
   * 쿼리에서는 최대 이 개수만큼만 반환한다 — 반드시 range 페이지네이션으로
   * 나눠 받아야 전량을 얻을 수 있는 실제 PostgREST 동작을 재현한다.
   */
  setMaxRows: (max: number | null) => void;
  reset: () => void;
}

export function createInMemorySupabase(): InMemorySupabase {
  let tables: Record<string, Row[]> = {};
  let queryError: { message: string } | null = null;
  let maxRows: number | null = null;

  function createQueryBuilder(table: string) {
    const filters: Array<(row: Row) => boolean> = [];
    let orderKey: string | null = null;
    let orderAscending = true;
    let limitCount: number | null = null;
    let rangeFrom: number | null = null;
    let rangeTo: number | null = null;
    let single = false;

    function run() {
      if (queryError) {
        return { data: null, error: queryError };
      }
      let rows = (tables[table] ?? []).filter((row) =>
        filters.every((f) => f(row)),
      );
      if (orderKey) {
        const key = orderKey;
        rows = [...rows].sort((a, b) =>
          orderAscending
            ? String(a[key]).localeCompare(String(b[key]))
            : String(b[key]).localeCompare(String(a[key])),
        );
      }
      if (rangeFrom !== null) {
        const from = rangeFrom;
        const requestedTo = rangeTo ?? rows.length - 1;
        // 상한(maxRows)이 설정돼 있으면 요청 폭이 아무리 넓어도 상한만큼만 반환
        const cappedTo =
          maxRows !== null
            ? Math.min(requestedTo, from + maxRows - 1)
            : requestedTo;
        rows = rows.slice(from, cappedTo + 1);
      } else if (limitCount !== null) {
        rows = rows.slice(0, limitCount);
        if (maxRows !== null) rows = rows.slice(0, maxRows);
      } else if (maxRows !== null) {
        // range/limit 없이 조회 시 PostgREST의 기본 페이지(0 ~ maxRows-1)를 흉내낸다
        rows = rows.slice(0, maxRows);
      }
      if (single) {
        return { data: rows[0] ?? null, error: null };
      }
      return { data: rows, error: null };
    }

    const builder = {
      select: () => builder,
      eq: (key: string, value: unknown) => {
        filters.push((row) => row[key] === value);
        return builder;
      },
      lt: (key: string, value: unknown) => {
        filters.push((row) => String(row[key]) < String(value));
        return builder;
      },
      gte: (key: string, value: unknown) => {
        filters.push((row) => String(row[key]) >= String(value));
        return builder;
      },
      in: (key: string, values: unknown[]) => {
        filters.push((row) => values.includes(row[key]));
        return builder;
      },
      not: (key: string, op: string, value: unknown) => {
        if (op === "is" && value === null) {
          filters.push((row) => row[key] !== null && row[key] !== undefined);
        }
        return builder;
      },
      order: (key: string, opts?: { ascending?: boolean }) => {
        orderKey = key;
        orderAscending = opts?.ascending ?? true;
        return builder;
      },
      limit: (count: number) => {
        limitCount = count;
        return builder;
      },
      range: (from: number, to: number) => {
        rangeFrom = from;
        rangeTo = to;
        return builder;
      },
      maybeSingle: () => {
        single = true;
        limitCount = limitCount ?? 1;
        return Promise.resolve(run());
      },
      then: (resolve: (value: unknown) => void) => resolve(run()),
    };

    return builder;
  }

  return {
    client: { from: (table: string) => createQueryBuilder(table) },
    setRows: (table, rows) => {
      tables[table] = rows;
    },
    setError: (error) => {
      queryError = error;
    },
    setMaxRows: (max) => {
      maxRows = max;
    },
    reset: () => {
      tables = {};
      queryError = null;
      maxRows = null;
    },
  };
}
