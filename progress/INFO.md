# Frontend Architecture Info (2026-04-09)

## 문서 범위
- 프론트 기술/구조 기준 문서.
- 백엔드는 “프론트가 기대하는 API 계약”만 기록한다.

## 스택
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- Monaco Editor

## 구조
1. App Layer (`src/app`)
- 라우팅/페이지 진입점.
- 제출 상세 라우트: `/submissions/[submissionId]`.
- 관리자 운영 라우트: `/admin` (공휴일 + 강사 담당 과정 매핑).

2. Feature Layer (`src/features`)
- 제출 핵심:
  - `student-submission-workspace.tsx`
  - `instructor-console-workspace.tsx`
  - `submission-detail-workspace.tsx`
  - `submission-ide-editor.tsx`
- 관리자 핵심:
  - `admin-holiday-manager.tsx`
  - `admin-instructor-course-manager.tsx`

3. Service Layer (`src/services/submission.ts`)
- API 호출 표준화 + fallback 처리.
- 관리자 서비스: `src/services/admin.ts`

4. Type Layer (`src/types/submission.ts`)
- 제출 도메인 타입 단일 소스.
- 관리자 타입: `src/types/admin.ts`

## 제출 도메인 원칙
1. 화면 책임 분리
- 목록(학생/강사): 메타/요약/필터 중심.
- 상세(`/submissions/{id}`): 코드/피드백/타임라인 전체 + 리뷰 액션.

2. 강사 콘솔 모드
- `NEW_ASSIGNMENT`: 신규 과제 업로드.
- `TEMPLATE_AUTHORING`: 템플릿 작성/저장.
- 두 모드는 상단 토글로 전환하며, 템플릿 반영은 `템플릿 저장하기` 버튼에서만 발생.
- 최근 사용 내역 카드에서 템플릿 대상 선택과 반복 프리셋 적용을 함께 처리한다.

3. 상태 정책
- enum: `SUBMITTED | REVIEWED | NEEDS_REVISION`
- UI 라벨: `SUBMITTED`는 `재검토`로 표시.

4. 상세 리뷰 액션
- 상태 변경과 피드백 저장을 분리하지 않고 `리뷰하기` 단일 액션으로 처리.
- 입력: 상태, 리뷰 제목, 메시지, 코드, 첨부파일.

## 저장/동기화
- 기본: API 우선.
- 실패 시 localStorage fallback:
  - `ai-edu-submission-db-v1`
  - `ai-edu-submission-drafts-v1`
- draft 키: `studentId:assignmentId` (`editorType`, `codeLanguage`, `message`, `code`, `updatedAt`).

## 프론트가 요구하는 최소 API
- `GET /me/assignments/workspace`
- `POST /me/assignments/submissions`
- `GET /instructor/assignments/workspace`
- `POST /instructor/assignments`
- `PUT /instructor/assignments/{assignmentId}/template`
- `PATCH /instructor/assignments/submissions/{submissionId}`
- `POST /instructor/assignments/submissions/{submissionId}/feedback`
- `POST /instructor/videos/upload`
- `GET /submissions/{submissionId}`
- `GET /instructor/assignments/{assignmentId}/timeline` (과제 전체 타임라인 탭)
- `GET /admin/instructor-courses/workspace`
- `PUT /admin/instructors/{instructorId}/courses`
- `GET /admin/users/workspace` (관리자 권한 편집용 사용자/과정/현재 권한 조회)
- `PUT /admin/users/{userId}/roles` (사용자 권한 저장: 강사/조교/학생)
- `PUT /admin/courses/{courseId}/members/{userId}/role` (과정 단위 권한 매핑 저장)
- `GET /courses/{courseId}/assignment-audit` (수업 단위 과제/수정 이력 조회; role-scope 적용)

타임라인 정합 규칙:
1. 상세 페이지 `해당 학생` 탭은 `GET /submissions/{submissionId}`의 `timeline[]`을 그대로 사용한다.
2. 상세 페이지 `과제 전체` 탭은 `GET /instructor/assignments/{assignmentId}/timeline`을 사용한다.
3. `GET /submissions/{submissionId}`의 `timeline[]`은 선택 제출의 `학생 + 과제 revision 묶음` 범위 이벤트만 반환되어야 한다.

권한 확장 규칙(관리자 중심):
1. 전역 role(`admin|instructor|assistant|student`)과 과정 단위 role binding을 분리한다.
2. 강사/조교의 리뷰 권한은 과정 단위 binding으로 판정하고, 프론트는 서버 응답 scope만 신뢰한다.
3. 조교(assistant) 권한이 활성화되면 동일 제출 타임라인에 다중 리뷰어 이벤트가 자연스럽게 누적되어야 한다.

수업 계층형 이력 규칙:
1. 관리자/강사/학생이 동일 이벤트 모델을 사용하되, 서버가 role-scope로 결과를 제한한다.
2. 이벤트는 최소 `courseId, assignmentId, submissionId?, actorId, actorName, actorRole, action, occurredAt`를 포함해야 한다.
3. 프론트는 과정 > 과제 > 수정 이벤트 순으로 렌더하고, 타임라인 클릭 시 해당 revision 상세와 동기화한다.

## 배포 서버 구조(권장)
- Frontend/BFF: Next.js
- Core API: NestJS
- DB: Prisma + RDBMS
- Storage/CDN: 파일 바이너리 저장 및 배포

경계 원칙:
1. Next.js는 UI/SSR/BFF에 집중.
2. 권한/도메인 규칙은 API 서버에서 강제.
3. 파일은 스토리지에 저장하고 API는 메타데이터만 관리.
