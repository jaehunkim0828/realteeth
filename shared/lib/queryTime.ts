import { toKst } from '@/shared/lib/kmaTime';

export function msUntilNextHourKst(now = new Date()) {
  const kst = toKst(now);
  const next = new Date(kst);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return Math.max(0, next.getTime() - kst.getTime());
}

