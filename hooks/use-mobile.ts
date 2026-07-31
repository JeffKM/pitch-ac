import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * 뷰포트가 모바일 폭인지 반환한다.
 *
 * ⚠️ 주의: 서버 렌더와 클라이언트 첫 렌더에서는 항상 false이며, 마운트 이펙트에서
 * 실제 값으로 갱신된다. 이 상태 변경이 Suspense 경계보다 위쪽에서 일어나면
 * 하이드레이션 도중 트리가 갱신되어 React #418(하이드레이션 실패)이 발생한다.
 * 따라서 레이아웃/프로바이더 수준에서 사용하지 말고, 반응형 분기는 가급적
 * CSS 미디어 쿼리(md: 등)로 처리한다. 이벤트 핸들러에서 즉시 판정이 필요하면
 * 훅 대신 window.matchMedia를 직접 호출한다.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
