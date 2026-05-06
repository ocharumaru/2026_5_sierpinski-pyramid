import { useState, useEffect } from "react";

/**
 * 画面幅が breakpoint 未満かどうかを返すカスタムフック。
 * window のリサイズに追従する。
 *
 * @param {number} [breakpoint=600] モバイル判定の境界（px）
 * @returns {boolean}
 */
export function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}
