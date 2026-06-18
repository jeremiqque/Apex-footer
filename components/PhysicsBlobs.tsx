"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

type Blob = {
  file: string;
  label: string;
  x: number; // resting x from Figma (used to spread the drop)
  w: number;
  h: number;
};

// Native sizes from the exported assets; x spreads the drop across the width.
const BLOBS: Blob[] = [
  { file: "blob-1", label: "Marketing", x: 90, w: 209, h: 135 },
  { file: "blob-2", label: "Strategy", x: 190, w: 184, h: 79 },
  { file: "blob-3", label: "Branding", x: 320, w: 190, h: 105 },
  { file: "blob-4", label: "Sales", x: 440, w: 200, h: 154 },
  { file: "blob-5", label: "Website Dev", x: 490, w: 200, h: 142 },
  { file: "blob-7", label: "Webflow", x: 690, w: 200, h: 136 },
  { file: "blob-6", label: "Framer Dev", x: 740, w: 197, h: 101 },
  { file: "blob-8", label: "Newsletter", x: 860, w: 194, h: 121 },
  { file: "blob-9", label: "UI/UX Design", x: 965, w: 190, h: 105 },
  { file: "blob-10", label: "Portfolio", x: 1030, w: 185, h: 166 },
  { file: "blob-11", label: "AI Designs", x: 1190, w: 229, h: 124 },
  { file: "blob-12", label: "Illustration", x: 1270, w: 200, h: 154 },
  { file: "blob-13", label: "Advertisement", x: 1350, w: 179, h: 101 },
];

const STAGE_W = 1440;
const STAGE_H = 961;
const WALL = 200; // wall thickness (kept thick so fast throws can't escape)

export default function PhysicsBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const { Engine, Bodies, Composite, Body, Query, Constraint, Vector } =
      Matter;

    const engine = Engine.create();
    engine.gravity.y = reduce ? 0 : 1.1;
    const world = engine.world;

    // Static bounds: floor + two side walls so blobs pile inside the stage.
    const floor = Bodies.rectangle(
      STAGE_W / 2,
      STAGE_H + WALL / 2 - 8,
      STAGE_W + WALL * 2,
      WALL,
      { isStatic: true }
    );
    const leftWall = Bodies.rectangle(
      -WALL / 2,
      STAGE_H / 2,
      WALL,
      STAGE_H * 2,
      { isStatic: true }
    );
    const rightWall = Bodies.rectangle(
      STAGE_W + WALL / 2,
      STAGE_H / 2,
      WALL,
      STAGE_H * 2,
      { isStatic: true }
    );
    Composite.add(world, [floor, leftWall, rightWall]);

    // One physics body per blob, sized to the asset's bounding box.
    const bodies = BLOBS.map((b, i) => {
      const body = Bodies.rectangle(
        b.x,
        reduce ? STAGE_H - 120 : -300 - i * 140, // start above the stage (staggered)
        b.w * 0.82,
        b.h * 0.82,
        {
          chamfer: { radius: Math.min(b.w, b.h) * 0.32 },
          restitution: 0.45,
          friction: 0.4,
          frictionAir: 0.012,
          angle: reduce ? 0 : (Math.random() - 0.5) * 1.2,
        }
      );
      if (!reduce) Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
      return body;
    });
    Composite.add(world, bodies);

    // Sync DOM blobs to physics bodies.
    const sync = () => {
      for (let i = 0; i < bodies.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const { position: pos, angle } = bodies[i];
        const b = BLOBS[i];
        el.style.transform = `translate(${pos.x - b.w / 2}px, ${
          pos.y - b.h / 2
        }px) rotate(${angle}rad)`;
      }
    };
    sync(); // place at start positions (off-screen above) before the drop begins

    // ---- pointer drag / throw (manual, so it works through the CSS scale) ----
    let dragBody: Matter.Body | null = null;
    let dragConstraint: Matter.Constraint | null = null;

    const toStage = (clientX: number, clientY: number) => {
      const r = container.getBoundingClientRect();
      return {
        x: ((clientX - r.left) / r.width) * STAGE_W,
        y: ((clientY - r.top) / r.height) * STAGE_H,
      };
    };

    const hit = (clientX: number, clientY: number) => {
      const p = toStage(clientX, clientY);
      const found = Query.point(bodies, p);
      return { p, body: found.length ? found[found.length - 1] : null };
    };

    const onDown = (e: PointerEvent) => {
      const { p, body } = hit(e.clientX, e.clientY);
      if (!body) return; // not on a blob -> let the click pass to links etc.
      e.preventDefault();
      dragBody = body;
      dragConstraint = Constraint.create({
        pointA: { x: p.x, y: p.y },
        bodyB: dragBody,
        pointB: Vector.sub(p, dragBody.position),
        stiffness: 0.2,
        damping: 0.25,
        length: 0,
      });
      Composite.add(world, dragConstraint);
      document.body.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (dragConstraint) {
        dragConstraint.pointA = toStage(e.clientX, e.clientY);
        return;
      }
      // hover affordance
      document.body.style.cursor = hit(e.clientX, e.clientY).body
        ? "grab"
        : "";
    };
    const onUp = () => {
      if (dragConstraint) {
        Composite.remove(world, dragConstraint);
        dragConstraint = null;
        dragBody = null;
      }
      document.body.style.cursor = "";
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ---- render loop: sync DOM blobs to physics bodies ----
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 1000 / 30); // clamp for stability
      last = now;
      Engine.update(engine, dt);
      sync();
      raf = requestAnimationFrame(tick);
    };

    // Start dropping only once the section is in view.
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = "";
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 select-none"
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
            width={b.w}
            height={b.h}
            draggable={false}
            className="pointer-events-none block h-full w-full"
          />
        </div>
      ))}
    </div>
  );
}
