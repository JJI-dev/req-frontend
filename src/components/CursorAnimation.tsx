"use client";

import { useEffect, useRef } from "react";

export default function CursorAnimation() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Next.js 환경 대응
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.15; // 조금 더 부드럽게 따라오도록 계수 조정
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      raf = requestAnimationFrame(animate);
    };

    const enter = () => { dot.classList.add("hovered"); ring.classList.add("hovered"); };
    const leave = () => { dot.classList.remove("hovered"); ring.classList.remove("hovered"); };

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    const attach = () => {
      // 입력 요소들에도 호버 효과 추가
      document.querySelectorAll<Element>('a, button, [role="button"], input, textarea, label').forEach((el) => {
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });
    };
    
    attach();
    // DOM 변화 감지를 위한 여유 타이머
    const timeoutId = setTimeout(attach, 1000);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}