// 테스트용 인메모리 Supabase 쿼리 빌더
// select/eq/lt/gte/not/in/order/limit/maybeSingle 체인을 지원하며
// 테이블별 행 배열을 필터·정렬해 반환한다 (날짜·시즌은 ISO/고정폭 문자열 → 사전순 비교)

type Row = Record<string, unknown>;

export interface InMemorySupabase {
  client: { from: (table: string) => unknown };
  /** 테이블별 행 설정 (테스트마다 초기화) */
  setRows: (table: string, rows: Row[]) => void;
  /** 다음 쿼리부터 반환할 에러 설정 (null이면 정상 동작) */
  setError: (error: { message: string } | null) => void;
  reset: () => void;
}

export function createInMemorySupabase(): InMemorySupabase {
  let tables: Record<string, Row[]> = {};
  let queryError: { message: string } | null = null;

  function createQueryBuilder(table: string) {
    const filters: Array<(row: Row) => boolean> = [];
    let orderKey: string | null = null;
    let orderAscending = true;
    let limitCount: number | null = null;
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
      if (limitCount !== null) rows = rows.slice(0, limitCount);
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
    reset: () => {
      tables = {};
      queryError = null;
    },
  };
}
