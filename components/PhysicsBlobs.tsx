"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

type Blob = {
  file: string;
  label: string;
  x: number; // design x (0..1440) used to spread the drop horizontally
  w: number;
  h: number;
};

const BLOBS: Blob[] = [
  { file: "blob-1", label: "Marketing", x: 90, w: 209, h: 135 },
  { file: "blob-2", label: "Strategy", x: 190, w: 184, h: 79 },
  { file: "blob-3", label: "Branding", x: 320, w: 190, h: 105 },
  { file: "blob-4", label: "Sales", x: 440, w: 200, h: 154 },
  { file: "blob-5", label: "Website Dev", x: 540, w: 200, h: 142 },
  { file: "blob-7", label: "Webflow", x: 690, w: 200, h: 136 },
  { file: "blob-6", label: "Framer Dev", x: 760, w: 197, h: 101 },
  { file: "blob-8", label: "Newsletter", x: 870, w: 194, h: 121 },
  { file: "blob-9", label: "UI/UX Design", x: 965, w: 190, h: 105 },
  { file: "blob-10", label: "Portfolio", x: 1040, w: 185, h: 166 },
  { file: "blob-11", label: "AI Designs", x: 1170, w: 229, h: 124 },
  { file: "blob-12", label: "Illustration", x: 1280, w: 200, h: 154 },
  { file: "blob-13", label: "Advertisement", x: 1370, w: 179, h: 101 },
];

const DESIGN_W = 1440;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export default function PhysicsBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { Engine, Bodies, Composite, Query, Constraint, Vector } = Matter;

    const setupWorld = (W: number, H: number) => {
      const scale = clamp(W / DESIGN_W, 0.42, 1);
      const WALL = Math.max(120, W);

      const engine = Engine.create();
      engine.gravity.y = reduce ? 0 : 1.1;
      const world = engine.world;

      const floor = Bodies.rectangle(W / 2, H + WALL / 2 - 6, W + WALL * 2, WALL, {
        isStatic: true,
      });
      const leftWall = Bodies.rectangle(-WALL / 2, H / 2, WALL, H * 3, {
        isStatic: true,
      });
      const rightWall = Bodies.rectangle(W + WALL / 2, H / 2, WALL, H * 3, {
        isStatic: true,
      });
      Composite.add(world, [floor, leftWall, rightWall]);

      const sizes = BLOBS.map((b) => ({ w: b.w * scale, h: b.h * scale }));

      const bodies = BLOBS.map((b, i) => {
        const startX = clamp((b.x / DESIGN_W) * W, sizes[i].w / 2 + 4, W - sizes[i].w / 2 - 4);
        const body = Bodies.rectangle(
          startX,
          reduce ? H - 100 : -200 * scale - i * 120 * scale,
          sizes[i].w * 0.82,
          sizes[i].h * 0.82,
          {
            chamfer: { radius: Math.min(sizes[i].w, sizes[i].h) * 0.32 },
            restitution: 0.45,
            friction: 0.4,
            frictionAir: 0.012,
            angle: reduce ? 0 : (Math.random() - 0.5) * 1.2,
          }
        );
        if (!reduce) Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
        return body;
      });
      Composite.add(world, bodies);

      // Size the DOM wrappers to the scaled blob size.
      itemRefs.current.forEach((el, i) => {
        if (el) {
          el.style.width = `${sizes[i].w}px`;
          el.style.height = `${sizes[i].h}px`;
        }
      });

      const sync = () => {
        for (let i = 0; i < bodies.length; i++) {
          const el = itemRefs.current[i];
          if (!el) continue;
          const { position: pos, angle } = bodies[i];
          el.style.transform = `translate(${pos.x - sizes[i].w / 2}px, ${
            pos.y - sizes[i].h / 2
          }px) rotate(${angle}rad)`;
        }
      };
      sync();

      // ---- pointer drag / throw ----
      let dragConstraint: Matter.Constraint | null = null;
      const toLocal = (clientX: number, clientY: number) => {
        const r = container.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
      };
      const hit = (cx: number, cy: number) => {
        const p = toLocal(cx, cy);
        const found = Query.point(bodies, p);
        return { p, body: found.length ? found[found.length - 1] : null };
      };
      const onDown = (e: PointerEvent) => {
        const { p, body } = hit(e.clientX, e.clientY);
        if (!body) return;
        e.preventDefault();
        dragConstraint = Constraint.create({
          pointA: { x: p.x, y: p.y },
          bodyB: body,
          pointB: Vector.sub(p, body.position),
          stiffness: 0.2,
          damping: 0.25,
          length: 0,
        });
        Composite.add(world, dragConstraint);
        document.body.style.cursor = "grabbing";
      };
      const onMove = (e: PointerEvent) => {
        if (dragConstraint) {
          dragConstraint.pointA = toLocal(e.clientX, e.clientY);
          return;
        }
        document.body.style.cursor = hit(e.clientX, e.clientY).body ? "grab" : "";
      };
      const onUp = () => {
        if (dragConstraint) {
          Composite.remove(world, dragConstraint);
          dragConstraint = null;
        }
        document.body.style.cursor = "";
      };
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      // ---- render loop ----
      let raf = 0;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(now - last, 1000 / 30);
        last = now;
        Engine.update(engine, dt);
        sync();
        raf = requestAnimationFrame(tick);
      };
      const begin = () => {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      };

      let io: IntersectionObserver | null = null;
      if (startedRef.current || reduce) {
        begin();
      } else {
        io = new IntersectionObserver(
          (entries) => {
            if (entries.some((en) => en.isIntersecting)) {
              startedRef.current = true;
              begin();
              io?.disconnect();
              io = null;
            }
          },
          { threshold: 0.12 }
        );
        io.observe(container);
      }

      const teardown = () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        document.body.style.cursor = "";
        Composite.clear(world, false);
        Engine.clear(engine);
      };
      return teardown;
    };

    // (re)build on size changes
    let active: (() => void) | null = null;
    let lastW = 0;
    let lastH = 0;
    let debounce = 0;

    const rebuild = () => {
      const r = container.getBoundingClientRect();
      const W = Math.round(r.width);
      const H = Math.round(r.height);
      if (W < 2 || H < 2) return;
      if (Math.abs(W - lastW) < 2 && Math.abs(H - lastH) < 2) return;
      lastW = W;
      lastH = H;
      active?.();
      active = setupWorld(W, H);
    };

    rebuild();

    const ro = new ResizeObserver(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(rebuild, 200);
    });
    ro.observe(container);

    return () => {
      window.clearTimeout(debounce);
      ro.disconnect();
      active?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      {BLOBS.map((b, i) => (
        <div
          key={b.file}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: b.w, height: b.h, transformOrigin: "center center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/${b.file}.svg`}
            alt={b.label}
            draggable={false}
            className="pointer-events-none block h-full w-full"
          />
        </div>
      ))}
    </div>
  );
}
