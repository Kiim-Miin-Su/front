"use client";

import dynamic from "next/dynamic";

import type { SubmissionCodeLanguage } from "@/types/submission";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      IDE 에디터 로딩 중...
    </div>
  ),
});

export function SubmissionIdeEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
  height = 260,
}: {
  value: string;
  onChange: (value: string) => void;
  language?: SubmissionCodeLanguage;
  readOnly?: boolean;
  height?: number;
}) {
  return (
    <div className="relative overflow-visible rounded-2xl border border-slate-200 bg-[#0f172a]">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontLigatures: true,
          lineNumbers: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fixedOverflowWidgets: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          suggestOnTriggerCharacters: true,
          snippetSuggestions: "top",
          tabSize: 2,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
