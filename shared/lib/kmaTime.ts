export function toKst(date: Date) {
  return new Date(
    date.getTime() + date.getTimezoneOffset() * 60_000 + 9 * 60 * 60_000
  );
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
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

const VILAGE_FCST_BASE_TIMES = [
  '0200',
  '0500',
  '0800',
  '1100',
  '1400',
  '1700',
  '2000',
  '2300',
] as const;

export function getVilageFcstBaseDateTime(now = new Date()) {
  const kst = toKst(now);
  const base = new Date(kst);

  base.setMinutes(base.getMinutes() - 20);
  const hhmm = `${pad2(base.getHours())}${pad2(base.getMinutes())}`;

  let selected: string = VILAGE_FCST_BASE_TIMES[0];
  for (const candidate of VILAGE_FCST_BASE_TIMES) {
    if (candidate <= hhmm) selected = candidate;
  }

  if (hhmm < VILAGE_FCST_BASE_TIMES[0]) {
    base.setDate(base.getDate() - 1);
    selected = VILAGE_FCST_BASE_TIMES[VILAGE_FCST_BASE_TIMES.length - 1];
  }

  return { baseDate: formatYyyyMmDd(base), baseTime: selected };
}
