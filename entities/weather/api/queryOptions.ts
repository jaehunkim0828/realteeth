import { msUntilNextHourKst } from '@/shared/lib/queryTime';

export function weatherQueryStaleTimeMs() {
  return msUntilNextHourKst(new Date());
}

export function weatherQueryRefetchIntervalMs() {
  const until = msUntilNextHourKst(new Date());
  return until > 0 ? until + 1000 : 60_000;
}

