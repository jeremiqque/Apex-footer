"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

// Matter.js is ~85KB — load it lazily so it never blocks first paint.
const PhysicsBlobs = dynamic(() => import("@/components/PhysicsBlobs"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

const QUICK_LINKS = ["Home", "About", "Services", "Contact"];
const PRODUCTS = ["AI Assistant", "Mobile App", "Account", "Credit Card"];
const COMPANY = ["About", "Privacy Policy", "Support", "Terms of Service"];

const HEADLINE = ["Thank", "you", "for", "your", "curiosity.", "Let’s", "build", "something", "cool."];

function LinkColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="js-foot flex flex-col">
      <h3 className="mb-5 text-[16px] font-semibold text-white">{title}</h3>
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
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
          defaults: { ease: "power3.out" },
        });

        tl.from(".js-word", {
          yPercent: 60,
          opacity: 0,
          duration: 0.6,
          stagger: 0.04,
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
            "-=0.25"
          )
          .to(
            ".js-hand",
            { rotation: "+=16", duration: 0.12, repeat: 3, yoyo: true, ease: "sine.inOut" },
            "-=0.05"
          )
          .from(
            ".js-divider",
            { scaleX: 0, transformOrigin: "left center", duration: 0.6, stagger: 0.1 },
            "-=0.4"
          )
          .from(
            ".js-foot",
            { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 },
            "-=0.4"
          );
      });

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
      className="relative w-full overflow-hidden bg-ink text-white"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-14 sm:px-10 lg:px-20 lg:pt-[88px]">
        {/* Headline + peace hand */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-[clamp(30px,6.2vw,50px)] uppercase leading-[1.06] tracking-[0.5px] text-white">
            {HEADLINE.map((w, i) => (
              <span
                key={i}
                className="js-word inline-block"
                style={{ marginRight: "0.26em" }}
              >
                {w}
              </span>
            ))}
          </h2>

          <div
            className="js-hand-wrap mt-1 shrink-0 cursor-pointer"
            style={{ transformOrigin: "top left", transform: "rotate(3.57deg)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/hand.svg"
              alt=""
              width={78}
              height={100}
              className="js-hand block w-[clamp(48px,9vw,78px)]"
            />
          </div>
        </div>

        {/* Dashed dividers */}
        <div className="js-divider mt-10 border-t border-dashed border-white/15 lg:mt-14" />
        <div className="js-divider mt-[18px] border-t border-dashed border-white/15" />

        {/* Footer: logo + tagline + link columns */}
        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-8">
          <div className="js-foot lg:max-w-[360px]">
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

          <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:gap-x-[60px]">
            <LinkColumn title="Quick Links" items={QUICK_LINKS} />
            <LinkColumn title="Products" items={PRODUCTS} />
            <LinkColumn title="Company" items={COMPANY} />
          </div>
        </div>

        {/* Dashed divider before the cloud */}
        <div className="js-divider mt-12 border-t border-dashed border-white/15" />
      </div>

      {/* Blob cloud — Matter.js physics: drops in, piles up, draggable / throwable */}
      <div className="mt-6 h-[clamp(300px,40vw,380px)] w-full">
        <div className="relative mx-auto h-full w-full max-w-[1440px]">
          <PhysicsBlobs />
        </div>
      </div>
    </section>
  );
}
