# Progress 05 (2026-04-09)

## 목적
- 오늘 진행한 `제출/강사콘솔` 작업을 실제 코드와 대조해 정리한다.

## 대조 결과 (확인 완료)
1. 강사 콘솔
- `과제 제출 현황` 카드 + `더보기` 시각화 노출.
- `강의 영상 업로드`를 메인 카드로 분리.
- 과제 작성 플로우 분리:
  - `신규 과제`: 과정 선택 + 과제 업로드
  - `템플릿 작성`: 명시적 저장 버튼으로만 템플릿 반영
- 신규 과제에서도 IDE 템플릿 편집기 노출.
- 신규 과제 업로드 시 템플릿 자동 저장 제거.
- 기존 과제 템플릿 대상 목록은 우측 카드에서 최근 생성순/스크롤형으로 정리.
- 최근 사용 내역에 `더보기` 추가.
- 템플릿 편집기에서 `템플릿 저장하기` 버튼으로 바로 저장 가능하도록 수정.
- `초안으로 템플릿 작성` 버튼 제거.
- 최근 사용 내역 카드와 기존 과제 템플릿 대상 목록을 단일 카드 목록으로 통합.
- `이 설정으로 반복` 클릭 시 과제 설정뿐 아니라 저장된 템플릿 코드(`content`)까지 함께 로드되도록 수정.

2. 학생/강사 제출 목록
- 목록 카드는 메타데이터 중심으로 축소.
- 긴 코드/리뷰 본문은 상세 페이지로 이동.
- 강사 콘솔의 선택 제출 타임라인은 상세 페이지와 동일한 데이터 소스(`GET /submissions/{id}`)를 사용하도록 정렬.

3. 제출 상세 페이지
- 라우트: `/submissions/[submissionId]`
- 기능: 리비전/피드백/타임라인 전체 확인, 코드 다운로드.
- 강사 리뷰 작성:
  - 상태 선택(`완료/보완 필요/재검토`)
  - 메시지 형식(`Text/Markdown`) 선택
  - 리뷰 제목/메시지/첨부 입력 후 `리뷰 저장`
- 강사 코드 수정안:
  - 학생 원본 코드는 read-only 유지
  - 수정 코드는 리뷰 카드 내부에서 편집하고 `리뷰 저장` 단일 액션으로 함께 저장
- 과제 메타 수정:
  - 제목/설명/마감 기한 수정 후 저장
- 학생 제출 ↔ 강사 피드백을 라운드 단위로 묶은 `리뷰 라운드 히스토리` 추가

4. 관리자 페이지
- 강사별 담당 과정 매핑 UI 추가.
- 강사-과정 체크 후 저장 가능(프론트 fallback 포함).

5. 공통 정리
- 개발 안내 카드 제거(`StatusPanel`, `RoleGate` 개발 배너).
- 상태 라벨 통일: `SUBMITTED` 표시값 `재검토`.

## 현재 구조 (핵심만)
- 리스트(학생/강사): 필터/요약/상세 진입.
- 상세(`/submissions/{id}`): 리뷰 액션 + 전체 이력 조회.
- 데이터 계층: `src/services/submission.ts` (API 우선, 실패 시 localStorage fallback).
- 관리자 매핑 데이터 계층: `src/services/admin.ts` (API 우선, 실패 시 localStorage fallback).

## 핵심 변경 파일
- `src/features/submission/instructor-console-workspace.tsx`
- `src/features/submission/student-submission-workspace.tsx`
- `src/features/submission/submission-detail-workspace.tsx`
- `src/features/submission/submission-status.ts`
- `src/services/submission.ts`
- `src/app/(platform)/submissions/[submissionId]/page.tsx`
- `src/features/admin/admin-instructor-course-manager.tsx`
- `src/services/admin.ts`
- `src/types/admin.ts`
- `src/app/(platform)/admin/page.tsx`
- `src/components/auth/role-gate.tsx`

## 검증
- `npm run build` 통과.

## 문서 정합성 재점검 (추가)
1. `README.md`
- 프론트 아키텍처 문서 경로를 `INFO.md`에서 `progress/INFO.md`로 정정.
- 오탈자 `직업로드`를 `직접 업로드`로 정정.

2. `../back/progress/INFO.md`
- 프론트 아키텍처 참조 경로를 `../front/INFO.md`에서 `../front/progress/INFO.md`로 정정.

## 구조 점검 결과 (백엔드 친화성/운영성)
1. 백엔드 친화성
- 제출 상세(`GET /submissions/{id}`)를 타임라인/리비전/상세의 단일 소스로 사용하도록 정렬되어, API 계약 변경 포인트가 분산되지 않음.
- 템플릿 반복 적용은 `template.content`까지 사용하므로, 템플릿 조회 응답 필드 요구사항이 명확함.
- 리뷰 저장은 단일 액션이지만 데이터는 `reviewStatus + feedbackEntry(+code)`로 분리 가능해 서버 트랜잭션 처리와 충돌하지 않음.

2. 관리자-강사 인터랙션
- 관리자에서 강사-과정 매핑을 저장하면, 강사 콘솔 조회 범위(scope)가 바뀌는 구조로 연결됨.
- 강사 콘솔/상세 리뷰의 이벤트 표시는 제출 상세 응답을 기준으로 동작하므로, 관리자 권한 변경 이후에도 조회 기준 일관성 유지 가능.

3. 최근 추가 반영
- 타임라인 클릭 시 해당 `submissionId` 라운드(제출본/피드백/코드)로 즉시 포커싱되도록 상세 UX를 연결.
- 레거시 mock actor 이름 혼선(`민수 김`, `개발 강사`, `개발용 강사`)은 로컬 정규화로 단일 표시값을 유지.
- 타임라인 선택 상태를 `event.id` 기준으로 변경해 “여러 카드 동시 선택” 문제를 제거.
- 타임라인 hover/active 색상을 저자극 톤으로 조정(가독성 우선).
- 우측 타임라인은 과제의 revision 이벤트 전체를 보여주되, 클릭한 이벤트(`submissionId`)와 메인 라운드 카드를 단일 선택으로 동기화.
- 상세 타임라인 불일치 보정:
  - `과제 전체` 탭 데이터 소스를 `latest submissions` 기준에서 `assignment 전체 revision + event` 기준으로 교체
  - fallback에서도 과제 전체 제출본(`database.submissions`)을 기준으로 타임라인/라벨을 계산해 실제 이력과 동일하게 맞춤
- 강사/조교 상호 코드 피드백 수정 금지:
  - 선택 라운드에 타 리뷰어 코드 수정안이 있으면 코드 편집 영역 read-only 잠금
  - 텍스트 피드백은 유지 가능, 코드 수정안 저장은 차단

## 오늘 마감 직전 추가 반영
1. 템플릿 반복 적용 정합
- 과제별 최신 템플릿 선택 시 `IDE 템플릿`을 우선 선택하고, 없을 때만 일반 템플릿으로 fallback.
- 반복 적용 시 `templateAssignmentId`, `editorType`, `codeLanguage`, `title`, `content`를 일괄 동기화.

2. 타임라인 정합
- 강사 콘솔 우측 패널 타임라인은 `fetchSubmissionDetail(submissionId)` 결과를 그대로 사용.
- API 실패 fallback에서도 `해당 학생 + 해당 과제 revision 묶음` 기준으로 필터링하여 상세 페이지와 동일한 범위를 유지.

## 추가 반영 (유지보수성 개선)
1. 하드코딩 분리
- TSX 내부의 정책성 하드코딩(탭/필터/모드/fallback actor)을 설정 파일로 분리.
- 추가된 설정/어댑터:
  - `src/config/runtime-defaults.ts`
  - `src/config/navigation.ts`
  - `src/features/attendance/attendance-ui-config.ts`
  - `src/features/submission/submission-ui-config.ts`

2. 출석 캘린더 하드코딩 제거
- `attendance-calendar.tsx`의 고정 월(`2026-04`) 제거.
- 선택 날짜/일정 데이터/현재 날짜 기반으로 달력 월을 동적으로 계산하도록 변경.

3. 관리자 확장성 정리
- 강사-과정 매핑 UI/서비스/타입 추가.
- API 연결 전에도 fallback 동작 가능하도록 어댑터 형태 유지.

4. 주석 보강
- 다음 개발자가 교체 포인트를 빠르게 찾을 수 있도록 복잡 로직(모드 분리, 단일 리뷰 액션, 월별 공휴일 로드, draft debounce)에 설명 주석 추가.

5. README 재작성
- 기술 중심 설명을 줄이고, 사용자/운영 흐름 중심 문서로 재구성.
- 잦은 변경을 전제로 README에는 고정 설계 대신 진입 흐름/문서 맵 중심으로 유지.

## 다음 작업
1. 프론트 단독 가능
- 상세 페이지 리비전 비교 UX 개선.
- 제출/리뷰 E2E 테스트 추가.
- 강사 대시보드 차트 라이브러리 적용.
- 관리자 권한 관리 UI 초안:
  - 사용자 검색/필터(이름, 현재 권한, 과정)
  - 권한 편집 다이얼로그(강사/조교/학생)
  - 과정별 멤버 권한 매핑 테이블
- 관리자 계층형 수업 감사 로그 UI:
  - 과정 > 과제 > 제출/수정 이력 트리
  - 이벤트별 actor/role/timestamp 노출
  - 강사/학생 뷰는 본인 scope로 필터된 동일 로그 컴포넌트 재사용

2. 백엔드 필수
- `GET /submissions/{submissionId}` 실데이터 완성(`submission`, `revisionHistory[]`, `timeline[]`).
- 템플릿 upsert 키 보장(`assignmentId + editorType + codeLanguage`).
- 리뷰 상태/피드백 저장 시 타임라인 동시 기록(트랜잭션).
- 관리자 강사-과정 매핑 API 연결:
  - `GET /admin/instructor-courses/workspace`
  - `PUT /admin/instructors/{instructorId}/courses`
- 관리자 권한 부여 API 추가(강사/조교/학생):
  - 사용자 단위 역할 변경(전역 role + 과정별 role binding)
  - 조교 권한의 리뷰 참여 범위(과정/과제 스코프) 명시
- 수업 단위 과제/수정 감사 로그 API:
  - 강사/학생도 접근 가능한 course-scope 이력 조회 endpoint
  - “언제 누가 무엇을 수정했는지”를 이벤트 레코드로 반환
