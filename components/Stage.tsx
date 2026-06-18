"use client";

import { useEffect, useRef, useState } from "react";

const DESIGN_W = 1440;
const DESIGN_H = 961;

/**
 * Scales a fixed 1440x961 design down to fit the viewport width,
 * keeping all px-based Figma measurements exact at the 1440 breakpoint.
 * No animation — purely responsive layout.
 */
export default function Stage({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.clientWidth ?? DESIGN_W;
      setScale(Math.min(1, w / DESIGN_W));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          margin: "0 auto",
          marginBottom: -(DESIGN_H * (1 - scale)),
        }}
      >
        {children}
      </div>
    </div>
  );
}
