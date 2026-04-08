# Progress 04 (2026-04-09)

## 1. 이번 단계에서 완료한 작업

### 1) 홈(마케팅) 구조 분리 + 서버 필터 대응

기존 `marketing-home.tsx` 단일 파일 구조를 분리하고, 서버 필터 API로 전환 가능한 형태로 정리했다.

- 분리한 컴포넌트
  - `src/features/home/home-hero-carousel.tsx`
  - `src/features/home/home-search.tsx`
  - `src/features/home/home-filter-bar.tsx`
  - `src/features/home/home-course-grid.tsx`
  - `src/features/home/home-pagination.tsx`
  - `src/features/home/home-filters.ts`
- 검색/필터 쿼리 타입 추가
  - `CourseSearchQuery`, `CourseSearchResult`, `CourseSortOption`, `CourseDurationRange`, `CoursePriceRange`
  - 파일: `src/types/course.ts`
- 서비스 계층에 검색 API 추가
  - `searchCourses(query)` 추가
  - 파일: `src/services/course.ts`

추가 안정화:

- 런타임 에러 `Cannot read properties of undefined (reading 'map')` 대응
  - `/courses` 응답이 `items` 형태가 아니어도 안전하게 정규화하도록 `normalizeCourseSearchResponse` 추가
  - `items/courses/array` 형태를 모두 처리
  - UI 측에서도 `courses ?? []` 방어 처리

UI 반영:

- `Quick Search` 타이틀/외부 박스 제거
- 검색 인풋 폭은 기존 `max-w-2xl` 유지, 입력창만 단독 노출

---

### 2) 학습 탭(`/learn`) 모듈 분리

기존 `src/features/course/learn-player-view.tsx`의 역할을 `features/learn`로 분리했다.

- 신규 구조
  - `src/features/learn/learn-player-view.tsx`
  - `src/features/learn/my-course-list.tsx`
  - `src/features/learn/player-stage.tsx`
  - `src/features/learn/learning-metrics.tsx`
  - `src/features/learn/curriculum-grid.tsx`
  - `src/features/learn/workspace-actions.tsx`
- 페이지 진입점 import 교체
  - `src/app/(platform)/learn/page.tsx`
- 기존 파일 제거
  - `src/features/course/learn-player-view.tsx`

상태 분기:

- `PENDING` 강의는 플레이어 영역에서 승인 대기 안내 노출
- 커리큘럼 버튼도 승인 전 레슨 접근을 제한(미리보기만 열기 허용)

---

### 3) 학생 출석/캘린더 워크스페이스 분리 + 인증 흐름 추가

`student-attendance-workspace.tsx`의 단일 파일 구조를 기능 단위로 분리했다.

- 분리 컴포넌트
  - `src/features/attendance/attendance-calendar.tsx`
  - `src/features/attendance/attendance-agenda-list.tsx`
  - `src/features/attendance/attendance-event-detail.tsx`
  - `src/features/attendance/attendance-legend.tsx`
  - `src/features/attendance/attendance-schedule-tone.ts`
- 기존 워크스페이스는 탭/상태 오케스트레이션 역할로 정리
  - `src/features/attendance/student-attendance-workspace.tsx`

출석 인증:

- `attendance-check-card.tsx`를 인터랙티브 입력 폼으로 확장
  - 코드 입력 + 인증 버튼
  - 성공/오류 피드백 표시
  - 인증 성공 시 입력값 자동 클리어
- 목 API 성격 함수 추가
  - `submitAttendanceCodeCheckIn(...)`
  - 파일: `src/features/attendance/mock-attendance-data.ts`
- 출석 상태 런타임 반영
  - `AttendanceRuntimeState`, `AttendanceCheckInResult`, `AttendanceCheckInError*` 타입 추가
  - 파일: `src/types/attendance.ts`
- 출석 이력 UI 추가

UI 정리(요청 반영):

- 출석 카드의 “점 6칸” 표시 제거
- 출석 인증 버튼 옆 `캘린더 탭 열기` 제거
- 현재는 입력칸 1개 + 출석 인증 버튼만 노출

---

### 4) 학생 출석 API 우선 연동 구조 적용 (추가 진행)

학생 영역은 이제 “실제 API 우선 + 목 fallback”으로 동작하도록 한 단계 더 전진했다.

- 신규 서비스 추가
  - `src/services/attendance.ts`
  - `fetchStudentAttendanceWorkspace()`
    - `GET /me/attendance/workspace` 우선 호출
    - 응답 정규화(`items`가 아닌 다양한 형태 포함) 후 `StudentAttendanceProfile`로 변환
    - 실패 시 `studentAttendanceProfile` 목데이터 fallback
  - `submitStudentAttendanceCheckIn(...)`
    - `POST /attendance/check-in` 우선 호출
    - 응답 정규화 후 `AttendanceCheckInResult` 반영
    - 클라이언트/서버 오류 중 일부는 사용자 오류로 바로 노출
    - API 미연결/불안정 상황은 `submitAttendanceCodeCheckIn` 목 로직 fallback

- 학생 페이지 진입점 변경
  - `src/app/(platform)/student/page.tsx`
  - 기존 목데이터 직접 참조 대신 `fetchStudentAttendanceWorkspace()` 사용

- 워크스페이스 동작 변경
  - `src/features/attendance/student-attendance-workspace.tsx`
  - 초기 profile 이후 클라이언트에서 한 번 더 workspace API 조회
  - 선택된 일정 id가 유효하지 않으면 자동 보정
  - 출석 인증 시 서비스 계층(`submitStudentAttendanceCheckIn`) 사용

---

### 5) 공휴일 하드코딩 제거 + 관리자 커스텀 공휴일 관리 추가

캘린더 공휴일은 더 이상 코드에 고정하지 않고, “캘린더 로드 시 API 조회”로 변경했다.

- 학생 캘린더 공휴일 처리
  - `src/features/attendance/attendance-calendar.tsx`
    - 하드코딩 공휴일 집합 제거
    - 외부에서 받은 `holidayDateKeySet`으로 공휴일 여부 판단
  - `src/features/attendance/student-attendance-workspace.tsx`
    - 캘린더 탭 진입 시 월별 공휴일 API 조회
    - 조회 결과를 `holidayDateKeySet`으로 전달

- 공휴일 서비스 추가
  - `src/services/attendance.ts`
    - `fetchCalendarHolidays({ year, month })`
      - `GET /calendar/holidays?country=KR&year=YYYY&month=MM`
      - 실패 시 로컬 커스텀 공휴일 fallback
    - `createCustomHoliday(...)`
      - `POST /admin/calendar/holidays`
    - `deleteCustomHoliday(...)`
      - `DELETE /admin/calendar/holidays/{id}`
    - 커스텀 공휴일은 localStorage fallback 저장/삭제 지원

- 관리자 공휴일 등록 UI 추가
  - `src/features/admin/admin-holiday-manager.tsx`
    - 연/월 선택
    - 해당 월 공휴일 목록 조회
    - 커스텀 공휴일 추가/삭제
  - `src/app/(platform)/admin/page.tsx`에 매니저 연결

- 타입 확장
  - `src/types/attendance.ts`
    - `CalendarHoliday`
    - `HolidaySourceType`

버그 수정:

- “빈 셀 클릭 시 오른쪽 하루 일정 상세가 바뀌지 않던 문제” 수정
  - 기존에는 선택 날짜가 일정 데이터에 없으면 자동으로 일정 있는 날짜로 되돌아감
  - 현재는 빈 날짜도 선택 상태로 유지되고, 상세 패널에 “해당 날짜의 일정이 없습니다.” 노출
  - 파일: `src/features/attendance/student-attendance-workspace.tsx`, `src/features/attendance/attendance-event-detail.tsx`

---

### 6) 출석 가능 시간 규칙 공통화 + 상세 탭 액션 비활성화 반영

출석 가능 시간/상태 기반 비활성화 로직을 공통 함수로 분리하고, 출석 카드와 하루 일정 상세 패널이 동일 규칙을 쓰도록 맞췄다.

- 공통 가용성 로직 분리
  - `src/features/attendance/attendance-check-in-availability.ts`
  - `supportsCodeCheckIn`, `CHECKED_IN/LATE/ABSENT`, 출석 가능 시간창(start/end)을 동일 기준으로 판정
- 출석 카드 버튼 컴포넌트화
  - `src/features/attendance/attendance-check-in-button.tsx`
  - 비활성 시 `cursor-not-allowed` + 비활성 톤 적용
- 하루 일정 상세 패널 반영
  - `src/features/attendance/attendance-event-detail.tsx`
  - `출석 탭에서 체크하기` 버튼도 시간 외/결석 상태에서 비활성화
  - 비활성 사유 문구 노출(결석: 빨강, 시간 외/기타: 주황)
- 목데이터/상태 표현 보강
  - `ABSENT` 상태 및 미출석 샘플 일정 추가
  - 지각(`LATE`) 주황, 결석(`ABSENT`) 빨강으로 상태 배지/이력 색상 통일
  - 파일: `src/features/attendance/mock-attendance-data.ts`, `src/features/attendance/student-attendance-workspace.tsx`, `src/types/attendance.ts`

---

## 2. 현재 검증 상태

- `npm run build` 통과 (타입체크 + 빌드 성공)
- `npm run lint`는 ESLint 초기 설정 대화형 프롬프트가 떠서 자동 검증 불가
  - 프로젝트에 ESLint 설정을 확정한 뒤 재검증 필요

---

## 3. 다음에 해야 할 일 (우선순위)

### P0 (바로 진행)

1. 홈 검색/필터 응답 스키마 고정
   - `searchCourses`의 임시 정규화/목 fallback 의존도 축소
   - 응답 스키마를 하나로 고정 (`items`, `page`, `size`, `totalPages`, `totalElements`)
   - 정렬(`sort`) 및 필터 enum 서버-프론트 값 표준화

2. 학생 출석 API 에러/상태 코드 계약 확정
   - `POST /attendance/check-in` 에러 코드 표준화
   - `ALREADY_CHECKED_IN`, `INVALID_CODE`, `INVALID_CODE_LENGTH` 등의 명확한 서버 코드 필요
   - fallback 분기 축소(연결 완료 후 목 fallback 제거 가능)

3. 학생 화면 피드백 UX 공통화
   - 지금은 카드 내부 텍스트 피드백
   - 공통 토스트 컴포넌트 도입 시 성공/실패/경고 표현 통일

4. 공휴일 API 계약 고정
   - `GET /calendar/holidays` 응답 스키마 단일화 (`items` 또는 `holidays` 중 하나로 고정)
   - 음력/대체공휴일 등 실제 대한민국 공휴일 기준 데이터 품질 확인
   - `POST/DELETE /admin/calendar/holidays` 권한/에러코드 표준화

5. 출석 가능 시간 정책 서버 연동 확정
   - 현재는 프론트에서 시간창 판정 로직 수행
   - 서버 응답에 `attendanceWindowStartAt/EndAt`, 상태 전이 정책(정상/지각/결석) 계약 고정 필요
   - 서버 기준 확정 후 프론트 fallback 판정 최소화

### P1 (도메인 고도화)

6. 커리큘럼 데이터 구조를 `sections/lessons`로 전환
   - 현재는 `curriculumPreview` 단일 배열
   - 상세/학습 탭이 동일 소스를 쓰도록 타입 변경 필요

7. 출석 목데이터/유틸 분리 고도화
   - 학생용/관리자용 예시 데이터 파일 분리
   - 색상/카테고리/visibility 라벨 상수화
   - 달력 날짜 생성 유틸 분리

### P2 (품질/운영)

8. ESLint 설정 확정 및 CI 검증 루틴 추가
9. 학생 주요 시나리오 E2E 추가
   - 탭 전환
   - 일정 선택
   - 빈 날짜 선택 시 상세 패널 반영
   - 코드 인증 성공/실패
   - 하루 일정 상세 패널에서 시간 외 버튼 비활성화 검증
   - 출석 이력 반영

### Deferred (나중에 진행)

- 강사 콘솔
- 관리자 콘솔(권한 부여, 스케줄 생성/반복정책, 출석정책)

---

## 4. 다음 개발자 빠른 착수 포인트

- 홈 서버 필터 시작점
  - `src/features/home/marketing-home.tsx`
  - `src/features/home/home-filters.ts`
  - `src/services/course.ts` (`searchCourses`, `normalizeCourseSearchResponse`)

- 학습 탭 시작점
  - `src/app/(platform)/learn/page.tsx`
  - `src/features/learn/`

- 출석/캘린더 시작점
  - `src/app/(platform)/student/page.tsx`
  - `src/features/attendance/student-attendance-workspace.tsx`
  - `src/features/attendance/attendance-calendar.tsx`
  - `src/features/attendance/attendance-event-detail.tsx`
  - `src/features/attendance/attendance-check-in-availability.ts`
  - `src/features/attendance/attendance-check-in-button.tsx`
  - `src/services/attendance.ts`
  - `src/features/attendance/mock-attendance-data.ts`
  - `src/types/attendance.ts`

- 공휴일 관리자 시작점
  - `src/app/(platform)/admin/page.tsx`
  - `src/features/admin/admin-holiday-manager.tsx`
