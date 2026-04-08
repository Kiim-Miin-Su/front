export function AttendanceCheckInButton({
  disabled,
  isSubmitting,
}: {
  disabled: boolean;
  isSubmitting: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
        disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-white text-[#355314] hover:bg-emerald-50"
      } ${isSubmitting ? "cursor-progress opacity-80" : ""}`}
    >
      {isSubmitting ? "인증 중..." : "출석 인증"}
    </button>
  );
}
