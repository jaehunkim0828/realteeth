function toKst(date: Date) {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60_000 + 9 * 60 * 60_000);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatYyyyMmDd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  return `${yyyy}${mm}${dd}`;
}

export function getUltraSrtNcstBaseDateTime(now = new Date()) {
  const kst = toKst(now);
  const base = new Date(kst);
  base.setMinutes(base.getMinutes() - 40);
  const baseDate = formatYyyyMmDd(base);
  const baseTime = `${pad2(base.getHours())}00`;

  return { baseDate, baseTime };
}

