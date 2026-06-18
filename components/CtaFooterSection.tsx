"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PhysicsBlobs from "@/components/PhysicsBlobs";

gsap.registerPlugin(ScrollTrigger);

const QUICK_LINKS = ["Home", "About", "Services", "Contact"];
const PRODUCTS = ["AI Assistant", "Mobile App", "Account", "Credit Card"];
const COMPANY = ["About", "Privacy Policy", "Support", "Terms of Service"];

const LINE_1 = "Thank you for your curiosity.".split(" ");
const LINE_2 = "Let’s build something cool.".split(" ");

function HeadlineLine({ words }: { words: string[] }) {
  return (
    <span className="block overflow-hidden pb-[2px]">
      {words.map((w, i) => (
        <span
          key={i}
          className="js-word inline-block"
          style={{ marginRight: "0.26em" }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

function LinkColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="js-foot flex flex-col">
      <h3 className="mb-6 text-[16px] font-semibold text-white">{title}</h3>
      <ul className="flex flex-col gap-[15px]">
        {items.map((item) => (
          <li key={item}>
            <a
              href="#"
              className="text-[16px] text-[#8c8c8c] transition-colors hover:text-white"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CtaFooterSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.from(".js-word", {
          yPercent: 120,
          opacity: 0,
          duration: 0.7,
          stagger: 0.05,
        })
          .from(
            ".js-hand",
            {
              scale: 0,
              opacity: 0,
              transformOrigin: "bottom center",
              duration: 0.45,
              ease: "back.out(2)",
            },
            "-=0.3"
          )
          .to(
            ".js-hand",
            {
              rotation: "+=16",
              duration: 0.12,
              repeat: 3,
              yoyo: true,
              ease: "sine.inOut",
            },
            "-=0.05"
          )
          .from(
            ".js-divider",
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.6,
            },
            "-=0.45"
          )
          .from(
            ".js-foot",
            { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4"
          );
      });

      // Reduced motion: show everything in its final state, no movement.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".js-word", ".js-hand", ".js-divider", ".js-foot"], {
          opacity: 1,
          scale: 1,
          scaleX: 1,
          x: 0,
          y: 0,
          yPercent: 0,
        });
      });

      // Hover: the peace hand does a quick playful wave + pop.
      const root = sectionRef.current;
      const wrap = root?.querySelector<HTMLElement>(".js-hand-wrap");
      const hand = root?.querySelector<HTMLElement>(".js-hand");
      const onEnter = () => {
        if (!hand) return;
        gsap.killTweensOf(hand);
        gsap
          .timeline({ defaults: { transformOrigin: "bottom center" } })
          .to(hand, { rotation: 16, scale: 1.12, duration: 0.13, ease: "sine.out" })
          .to(hand, { rotation: -14, duration: 0.12, ease: "sine.inOut" })
          .to(hand, { rotation: 10, duration: 0.12, ease: "sine.inOut" })
          .to(hand, { rotation: 0, scale: 1, duration: 0.2, ease: "back.out(2)" });
      };
      wrap?.addEventListener("mouseenter", onEnter);

      return () => wrap?.removeEventListener("mouseenter", onEnter);
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Call to action and footer"
      className="relative h-[961px] w-[1440px] overflow-hidden bg-ink text-white"
    >
      {/* Headline */}
      <h2 className="absolute left-20 top-[88px] font-heading text-[50px] uppercase leading-[1.06] tracking-[0.5px] text-white">
        <HeadlineLine words={LINE_1} />
        <HeadlineLine words={LINE_2} />
      </h2>

      {/* Peace-hand graphic (outer = position + base rotation, inner = animated) */}
      <div
        className="js-hand-wrap absolute cursor-pointer"
        style={{
          left: 778,
          top: 104,
          width: 78,
          height: 100,
          transformOrigin: "top left",
          transform: "rotate(3.57deg)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/hand.svg"
          alt=""
          width={78}
          height={100}
          className="js-hand block"
        />
      </div>

      {/* Dashed dividers */}
      <div className="js-divider absolute left-20 right-20 top-[244px] border-t border-dashed border-white/15" />
      <div className="js-divider absolute left-20 right-20 top-[300px] border-t border-dashed border-white/15" />

      {/* Footer: logo + tagline */}
      <div className="js-foot absolute left-20 top-[364px]">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icon.svg" alt="" width={24} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/apex-wordmark.svg"
            alt="Apex"
            width={71}
            height={23}
            className="h-[23px] w-auto"
          />
        </div>
        <p className="mt-[18px] text-[16px] leading-[1.5] text-[#8c8c8c]">
          Smarter tools for modern finance teams.
          <br />
          All rights reserved.
        </p>
      </div>

      {/* Footer: link columns */}
      <div className="absolute left-[783px] top-[364px]">
        <LinkColumn title="Quick Links" items={QUICK_LINKS} />
      </div>
      <div className="absolute left-[1005px] top-[364px]">
        <LinkColumn title="Products" items={PRODUCTS} />
      </div>
      <div className="absolute left-[1225px] top-[364px]">
        <LinkColumn title="Company" items={COMPANY} />
      </div>

      {/* Blob cloud — Matter.js physics: drops in, piles up, draggable / throwable */}
      <PhysicsBlobs />
    </section>
  );
}
