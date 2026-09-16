"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ramp = (progress: number, start: number, end: number) => {
  const value = clamp((progress - start) / (end - start));
  return value * value * (3 - 2 * value);
};

function mountDepth() {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>("[data-hero-journey]");
  const stage = hero?.querySelector<HTMLElement>("[data-hero-stage]");
  const intro = hero?.querySelector<HTMLElement>(".hero-intro-copy");
  const cue = hero?.querySelector<HTMLElement>(".hero-scroll-cue");
  const desktop = matchMedia("(min-width: 900px) and (min-height: 640px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const surfaces = Array.from(document.querySelectorAll<HTMLElement>(
    ".project-image-link",
  )).map((element) => ({ element, x: 0, y: 0, targetX: 0, targetY: 0 }));
  if (!hero && surfaces.length === 0) return;
  let frame = 0;
  let viewportDirty = true;
  let layoutDirty = true;
  let immersive = false;
  let disposed = false;
  let previousTime = 0;
  let heroTop = 0;
  let heroTravel = 1;
  let stageTop = 0;
  let stageHeight = 1;
  const previousValues = new Map<string, string>();
  root.classList.add("depth-enabled");

  const schedule = () => {
    if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(render);
  };

  function render(time: number) {
    frame = 0;
    if (disposed) return;
    // Time-based easing feels the same on 60 Hz and high refresh rate displays.
    const ease = 1 - Math.exp(-Math.min(time - previousTime, 64) / 85);
    previousTime = time;
    if (viewportDirty) {
      viewportDirty = false;
      if (layoutDirty) {
        layoutDirty = false;
        // A static layout remains usable at short heights and enlarged text sizes.
        const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight ?? 0;
        immersive = desktop.matches && Boolean(intro && intro.offsetHeight + headerHeight + 150 < innerHeight);
        hero?.classList.toggle("is-immersive", immersive);
        const heroRect = hero?.getBoundingClientRect();
        const stageRect = stage?.getBoundingClientRect();
        heroTop = (heroRect?.top ?? 0) + scrollY;
        heroTravel = Math.max(1, (heroRect?.height ?? 0) - innerHeight);
        stageTop = (stageRect?.top ?? 0) + scrollY;
        stageHeight = stageRect?.height ?? 1;
      }
      if (hero && stage) {
        const compact = innerWidth < 900;
        const progress = immersive
          ? clamp((scrollY - heroTop) / heroTravel)
          : clamp((innerHeight * .8 - stageTop + scrollY) / (innerHeight * .65 + stageHeight * .35));
        const introOut = immersive ? ramp(progress, .035, .22) : 0;
        const values = {
          "--hero-center": immersive ? ramp(progress, .06, .28) : 0,
          "--hero-split": immersive ? ramp(progress, .25, .43) * (1 - ramp(progress, .64, .77)) : compact ? ramp(progress, .15, .8) * .65 : 0,
          "--hero-dive": immersive ? ramp(progress, .72, .94) : 0,
          "--hero-intro-out": introOut,
          "--hero-details": immersive ? ramp(progress, .3, .43) * (1 - ramp(progress, .61, .67)) : 1,
          "--hero-veil": immersive ? ramp(progress, .81, .94) : 0,
        };
        Object.entries(values).forEach(([key, value]) => {
          const formatted = value.toFixed(4);
          if (previousValues.get(key) !== formatted) {
            hero.style.setProperty(key, formatted);
            previousValues.set(key, formatted);
          }
        });
        const phase = progress < .28 ? "intro" : progress < .72 ? "details" : "dive";
        if (hero.dataset.heroPhase !== phase) hero.dataset.heroPhase = phase;
        // Faded links leave the tab order, except while a visitor is using them.
        const introInert = introOut > .99 && Boolean(intro && !intro.contains(document.activeElement));
        const cueInert = introOut > .99 && cue !== document.activeElement;
        if (intro && intro.inert !== introInert) intro.inert = introInert;
        if (cue && cue.inert !== cueInert) cue.inert = cueInert;
      }
    }
    let moving = false;
    surfaces.forEach((surface) => {
      const dx = surface.targetX - surface.x;
      const dy = surface.targetY - surface.y;
      if (dx === 0 && dy === 0) return;
      surface.x = Math.abs(dx) < 0.004 ? surface.targetX : surface.x + dx * ease;
      surface.y = Math.abs(dy) < 0.004 ? surface.targetY : surface.y + dy * ease;
      surface.element.style.setProperty("--tilt-x", surface.x.toFixed(4));
      surface.element.style.setProperty("--tilt-y", surface.y.toFixed(4));
      moving = surface.x !== surface.targetX || surface.y !== surface.targetY || moving;
    });
    if (moving) schedule();
  }

  const listeners = surfaces.map((surface) => {
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      const rect = surface.element.getBoundingClientRect();
      surface.targetX = clamp((event.clientX - rect.left) / rect.width) * 2 - 1;
      surface.targetY = clamp((event.clientY - rect.top) / rect.height) * 2 - 1;
      schedule();
    };
    const leave = () => {
      surface.targetX = 0;
      surface.targetY = 0;
      schedule();
    };
    surface.element.addEventListener("pointermove", move, { passive: true });
    surface.element.addEventListener("pointerleave", leave);
    surface.element.addEventListener("pointercancel", leave);
    return () => {
      surface.element.removeEventListener("pointermove", move);
      surface.element.removeEventListener("pointerleave", leave);
      surface.element.removeEventListener("pointercancel", leave);
      surface.element.style.removeProperty("--tilt-x");
      surface.element.style.removeProperty("--tilt-y");
    };
  });

  const update = () => { viewportDirty = true; schedule(); };
  const resize = () => { layoutDirty = true; update(); };
  const sizeObserver = new ResizeObserver(resize);
  if (intro) sizeObserver.observe(intro);
  const resetPointers = () => {
    surfaces.forEach((surface) => { surface.targetX = 0; surface.targetY = 0; });
    update();
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", resize);
  addEventListener("blur", resetPointers);
  finePointer.addEventListener("change", resetPointers);
  document.addEventListener("visibilitychange", resetPointers);
  document.addEventListener("focusin", update);
  document.fonts.ready.then(() => { if (!disposed) resize(); });
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    removeEventListener("scroll", update);
    removeEventListener("resize", resize);
    removeEventListener("blur", resetPointers);
    finePointer.removeEventListener("change", resetPointers);
    document.removeEventListener("visibilitychange", resetPointers);
    document.removeEventListener("focusin", update);
    sizeObserver.disconnect();
    listeners.forEach((remove) => remove());
    root.classList.remove("depth-enabled");
    hero?.classList.remove("is-immersive");
    if (hero) delete hero.dataset.heroPhase;
    ["--hero-center", "--hero-split", "--hero-dive", "--hero-intro-out", "--hero-details", "--hero-veil"].forEach((key) => hero?.style.removeProperty(key));
    if (intro) intro.inert = false;
    if (cue) cue.inert = false;
  };
}

export function HeroMotion() {
  const path = usePathname();
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup: (() => void) | undefined;
    const sync = () => {
      cleanup?.();
      cleanup = reduced.matches ? undefined : mountDepth();
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => { reduced.removeEventListener("change", sync); cleanup?.(); };
  }, [path]);
  return null;
}
