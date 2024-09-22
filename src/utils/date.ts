// 格式化时间
export function formatTime(timeInMs: number): string {
  return `${Math.floor(timeInMs / 3600000)
    .toString()
    .padStart(2, "0")}:${Math.floor((timeInMs % 3600000) / 60000)
    .toString()
    .padStart(2, "0")}:${Math.floor((timeInMs % 60000) / 1000)
    .toString()
    .padStart(2, "0")}`;
}

export function getNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  return nextMidnight.getTime();
}
