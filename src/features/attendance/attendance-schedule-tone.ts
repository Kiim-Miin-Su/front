export const scheduleToneMap: Record<
  string,
  { dotClassName: string; textClassName: string; bgClassName: string; label: string }
> = {
  운영: {
    dotClassName: "bg-sky-500",
    textClassName: "text-sky-700",
    bgClassName: "bg-sky-50",
    label: "운영",
  },
  수업: {
    dotClassName: "bg-violet-500",
    textClassName: "text-violet-700",
    bgClassName: "bg-violet-50",
    label: "수업",
  },
  특강: {
    dotClassName: "bg-amber-500",
    textClassName: "text-amber-700",
    bgClassName: "bg-amber-50",
    label: "특강",
  },
  "필수 출석": {
    dotClassName: "bg-emerald-500",
    textClassName: "text-emerald-700",
    bgClassName: "bg-emerald-50",
    label: "필수 출석",
  },
};

export function getScheduleTone(categoryLabel: string) {
  return scheduleToneMap[categoryLabel] ?? scheduleToneMap["운영"];
}

export function toCompactTimeLabel(timeLabel: string) {
  return timeLabel.split(" - ")[0] ?? timeLabel;
}
