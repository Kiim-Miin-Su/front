export interface NavigationLink {
  href: string;
  label: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationLink[];
}

/**
 * 상단 네비게이션 링크 설정.
 * 백엔드 권한 정책 연동 시 필터링 로직만 추가하면 링크 데이터는 그대로 재사용할 수 있다.
 */
export const topNavigationPrimaryLinks: NavigationLink[] = [
  { href: "/", label: "홈" },
  { href: "/courses", label: "강의 탐색" },
  { href: "/learn", label: "학습" },
  { href: "/student", label: "학생" },
  { href: "/instructor", label: "강사" },
];

/**
 * 좌측 사이드바 섹션 설정.
 * 메뉴 정책이 바뀌면 TSX를 수정하지 않고 이 설정만 교체하도록 분리한다.
 */
export const sectionSidebarNavigation: NavigationSection[] = [
  {
    title: "학습 여정",
    items: [
      { href: "/courses", label: "강의 목록" },
      { href: "/learn", label: "수강 플레이어" },
      { href: "/student", label: "학생 대시보드" },
    ],
  },
  {
    title: "운영",
    items: [
      { href: "/instructor", label: "강사 콘솔" },
      { href: "/admin", label: "관리자" },
    ],
  },
];

export const navigationFeatureFlags = {
  showAttendanceShortcut: true,
} as const;

