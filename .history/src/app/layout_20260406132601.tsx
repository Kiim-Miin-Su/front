import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
	title: "KIT AI-Edu",
	description: "AI 기반 Korea IT Academy 학습 관리 페이지",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ko">
			<body className="min-h-screen bg-app text-ink antialiased">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
