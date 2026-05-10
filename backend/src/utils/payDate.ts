export function adjustWeekend(date: Date) {
  const adjusted = new Date(date);
  const day = adjusted.getUTCDay();

  if (day === 6) adjusted.setUTCDate(adjusted.getUTCDate() - 1);
  if (day === 0) adjusted.setUTCDate(adjusted.getUTCDate() - 2);

  adjusted.setUTCHours(0, 0, 0, 0);
  return adjusted;
}

export function getPayDate(year: number, monthIndex: number, payDay = 21) {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return adjustWeekend(new Date(Date.UTC(year, monthIndex, Math.min(payDay, lastDay))));
}

export function getCurrentCycleDates(today = new Date(), payDay = 21) {
  const normalized = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const thisPayDate = getPayDate(normalized.getUTCFullYear(), normalized.getUTCMonth(), payDay);
  const startDate =
    normalized >= thisPayDate
      ? thisPayDate
      : getPayDate(normalized.getUTCFullYear(), normalized.getUTCMonth() - 1, payDay);
  const nextStartDate = getPayDate(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, payDay);
  const endDate = new Date(nextStartDate);
  endDate.setUTCDate(endDate.getUTCDate() - 1);

  return { startDate, endDate };
}
