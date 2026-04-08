"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface HomeHeroBanner {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  tone: string;
}

export function HomeHeroCarousel({ banners }: { banners: HomeHeroBanner[] }) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [banners.length]);

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            AI Edu LMS
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            배우고 싶은 강의를 찾고, 바로 이어서 학습하세요
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            강의 탐색, 상세 확인, 미리보기, 학습 플레이어까지 한 번에 이어지는 학습 홈입니다.
            필요한 다음 행동을 위에서부터 바로 고를 수 있게 구성했습니다.
          </p>
        </div>
      </div>
      <div className={`bg-gradient-to-r ${banners[currentBanner].tone} px-8 py-8 text-white sm:px-12`}>
        <div className="flex min-h-[220px] max-w-xl flex-col justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
            {banners[currentBanner].eyebrow}
          </p>
          <h2 className="mt-3 min-h-[96px] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {banners[currentBanner].title}
          </h2>
          <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/85 sm:text-base">
            {banners[currentBanner].description}
          </p>
          <div className="mt-5 flex min-h-[44px] flex-wrap items-center gap-3">
            <Link
              href={banners[currentBanner].primaryHref}
              className="inline-flex h-10 items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              {banners[currentBanner].primaryLabel}
            </Link>
            <Link
              href={banners[currentBanner].secondaryHref}
              className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
            >
              {banners[currentBanner].secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-8">
        {banners.map((banner, index) => {
          const active = index === currentBanner;

          return (
            <button
              key={banner.title}
              type="button"
              onClick={() => setCurrentBanner(index)}
              className={`h-3 rounded-full transition ${active ? "w-9 bg-white" : "w-3 bg-white/45"}`}
              aria-label={`${index + 1}번 배너 보기`}
            />
          );
        })}
      </div>
      <div className="absolute bottom-5 right-6 flex items-center gap-2 sm:right-8">
        <button
          type="button"
          onClick={() =>
            setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white"
          aria-label="이전 배너"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white"
          aria-label="다음 배너"
        >
          ›
        </button>
      </div>
    </section>
  );
}
