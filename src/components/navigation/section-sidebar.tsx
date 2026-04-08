"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sectionSidebarNavigation } from "@/config/navigation";

export function SectionSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 rounded-[28px] border border-slate-200 bg-white/90 p-5 xl:block">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Workspace
      </p>
      <div className="mt-6 space-y-6">
        {sectionSidebarNavigation.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold text-ink">{section.title}</p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
