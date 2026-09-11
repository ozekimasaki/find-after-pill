import type { Pharmacy } from '../types/pharmacy';

const LATE_HOUR_THRESHOLD_MINUTES = 18 * 60;
const JST_OFFSET_MINUTES = 9 * 60;
const ALWAYS_OPEN_PATTERN = /(年中無休|24時間(?:365,?日)?|365,?日|定休日なし|休業日なし)/;
const WEEKEND_OR_HOLIDAY_PATTERN = /[土日祝]/;
const CLOSED_PATTERN = /(休み|休業|閉局|定休|休日)/;
const DAY_CONTEXT_PATTERN = /[月火水木金土日祝]|年中無休/;
const TIME_RANGE_PATTERN = /(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?/g;
const LATE_TIME_TOKEN_PATTERN = /\b(?:18:(?:0[1-9]|[1-5]\d)|19:\d{2}|20:\d{2}|21:\d{2}|22:\d{2}|23:\d{2})\b/;

function normalizeFlagValue(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[‐‑‒–—―ー−]/g, '-')
    .toLowerCase();
}

function formatMeridiemTime(meridiem: string, hour: string, minute = '00'): string {
  let parsedHour = Number(hour);

  if (meridiem === '午後' && parsedHour < 12) {
    parsedHour += 12;
  }
  if (meridiem === '午前' && parsedHour === 12) {
    parsedHour = 0;
  }

  return `${parsedHour}:${minute}`;
}

function normalizeBusinessHours(hours: string): string {
  return hours
    .normalize('NFKC')
    .replace(/月から金(?:曜日)?/g, '月-金')
    .replace(/月から土(?:曜日)?/g, '月-土')
    .replace(/月から日(?:曜日)?/g, '月-日')
    .replace(/([月火水木金土日])から([月火水木金土日])/g, '$1-$2')
    .replace(/平日/g, '月-金')
    .replace(/([月火水木金土日])曜(?:日)?/g, '$1')
    .replace(/祝日/g, '祝')
    .replace(/(午前|午後)(\d{1,2})時半(?!間)/g, (_, meridiem: string, hour: string) => formatMeridiemTime(meridiem, hour, '30'))
    .replace(/(\d{1,2})時(?=\d{1,2}時)/g, '$1:00-')
    .replace(/(午前|午後)(\d{1,2})時(?!間)(?:(\d{2})分)?/g, (_, meridiem: string, hour: string, minute?: string) => formatMeridiemTime(meridiem, hour, minute ?? '00'))
    .replace(/(\d{1,2})時半(?!間)/g, '$1:30')
    .replace(/(\d{1,2})時(?!間)(?:(\d{2})分)?/g, (_, hour: string, minute?: string) => `${hour}:${minute ?? '00'}`)
    .replace(/([月火水木金土日祝・,／/]+)[／/](?=(?:午前|午後|\d))/g, '$1:')
    .replace(/(\d{1,2}:\d{2})から(?=\d{1,2}:\d{2})/g, '$1-')
    .replace(/[‐‑‒–—―ー−~〜～∼]/g, '-')
    .replace(/[：]/g, ':')
    .replace(/((?:\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})(?:\s*[\/,]\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)\(([^()]*[月火水木金土日祝][^()]*)\)/g, '$2:$1')
    .replace(/[､、，；;｡。]/g, ',')
    .replace(/[（(]/g, ',')
    .replace(/[）)]/g, ',')
    .replace(/\s+/g, '')
    .replace(/(?<!\d)0([12]\d:\d{2})/g, '$1')
    .replace(/(?<!\d)([01]?\d|2[0-4])(\d{2})(?!\d)/g, '$1:$2')
    .replace(/([月火水木金土日祝・,:-]+)(\d{1,2}:\d{2})(\d{1,2}:\d{2})/g, '$1$2-$3')
    .replace(/-+/g, '-')
    .replace(/(\d)([月火水木金土日祝])/g, '$1,$2')
    .replace(/([休閉])([月火水木金土日祝])/g, '$1,$2');
}

function isClosedContext(context: string): boolean {
  return CLOSED_PATTERN.test(context) || /(?:^|[:：])休$/.test(context);
}

function toMinutes(hours: string, minutes?: string): number {
  return Number(hours) * 60 + Number(minutes ?? '0');
}

function getJstDayAndMinutes(now: Date): { dayIndex: number; minutes: number } {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const minutes = (utcMinutes + JST_OFFSET_MINUTES) % (24 * 60);
  const jstTime = now.getTime() + JST_OFFSET_MINUTES * 60 * 1000;
  const dayIndex = new Date(jstTime).getUTCDay();
  return { dayIndex, minutes };
}

export function isAfterHoursJst(now: Date = new Date()): boolean {
  const { dayIndex, minutes } = getJstDayAndMinutes(now);
  return dayIndex === 0 || dayIndex === 6 || minutes < 9 * 60 || minutes >= LATE_HOUR_THRESHOLD_MINUTES;
}

export function hasAfterHoursSupport(afterHoursService?: string | null): boolean {
  if (!afterHoursService) {
    return false;
  }

  const normalized = normalizeFlagValue(afterHoursService);
  if (!normalized) {
    return false;
  }

  if (['無', 'なし', '無し', 'x', '×', '-', 'ー', '―'].includes(normalized)) {
    return false;
  }

  return true;
}

export function hasWeekendOrHolidayHours(businessHours?: string | null): boolean {
  if (!businessHours) {
    return false;
  }

  const normalized = normalizeBusinessHours(businessHours);
  if (!normalized) {
    return false;
  }

  if (ALWAYS_OPEN_PATTERN.test(normalized)) {
    return true;
  }

  let currentContext = '';
  let cursor = 0;

  for (const match of normalized.matchAll(TIME_RANGE_PATTERN)) {
    const index = match.index ?? 0;
    const between = normalized.slice(cursor, index);
    if (DAY_CONTEXT_PATTERN.test(between)) {
      currentContext = between;
    }
    cursor = index + match[0].length;

    if (WEEKEND_OR_HOLIDAY_PATTERN.test(currentContext) && !isClosedContext(currentContext)) {
      return true;
    }
  }

  return normalized
    .split(',')
    .some((clause) => WEEKEND_OR_HOLIDAY_PATTERN.test(clause) && !isClosedContext(clause) && /\d{1,2}:\d{2}/.test(clause));
}

export function hasLateBusinessHours(businessHours?: string | null): boolean {
  if (!businessHours) {
    return false;
  }

  const normalized = normalizeBusinessHours(businessHours);
  if (!normalized) {
    return false;
  }

  if (ALWAYS_OPEN_PATTERN.test(normalized)) {
    return true;
  }

  for (const match of normalized.matchAll(TIME_RANGE_PATTERN)) {
    const endMinutes = toMinutes(match[3], match[4]);
    if (endMinutes > LATE_HOUR_THRESHOLD_MINUTES) {
      return true;
    }
  }

  return LATE_TIME_TOKEN_PATTERN.test(normalized);
}

export function supportsAfterHoursFilter(pharmacy: Pick<Pharmacy, 'afterHoursService' | 'businessHours'>): boolean {
  return (
    hasAfterHoursSupport(pharmacy.afterHoursService) ||
    hasWeekendOrHolidayHours(pharmacy.businessHours) ||
    hasLateBusinessHours(pharmacy.businessHours)
  );
}

const WEEKDAY_CHARS = ['日', '月', '火', '水', '木', '金', '土'] as const;

function expandDaysFromContext(context: string): Set<number> | null {
  const days = new Set<number>();
  const rangePattern = /([月火水木金土日])-([月火水木金土日])/g;

  for (const match of context.matchAll(rangePattern)) {
    const start = WEEKDAY_CHARS.indexOf(match[1] as (typeof WEEKDAY_CHARS)[number]);
    const end = WEEKDAY_CHARS.indexOf(match[2] as (typeof WEEKDAY_CHARS)[number]);
    if (start < 0 || end < 0) {
      continue;
    }
    let cursor = start;
    for (let step = 0; step < 7; step += 1) {
      days.add(cursor);
      if (cursor === end) {
        break;
      }
      cursor = (cursor + 1) % 7;
    }
  }

  for (const char of context) {
    const index = WEEKDAY_CHARS.indexOf(char as (typeof WEEKDAY_CHARS)[number]);
    if (index >= 0) {
      days.add(index);
    }
  }

  if (days.size === 0) {
    return null;
  }
  return days;
}

function isMinutesInRange(nowMinutes: number, start: number, end: number): boolean {
  if (end <= start) {
    return nowMinutes >= start || nowMinutes < end;
  }
  return nowMinutes >= start && nowMinutes < end;
}

/**
 * 開局時間文字列から「いま開局中の可能性」を推定する。
 * 祝日や臨時休業は判定できないため、バッジ表示の目安に留める。
 */
export function isLikelyOpenNow(businessHours?: string | null, now: Date = new Date()): boolean {
  if (!businessHours) {
    return false;
  }

  const normalized = normalizeBusinessHours(businessHours);
  if (!normalized) {
    return false;
  }

  if (ALWAYS_OPEN_PATTERN.test(normalized) || /24時間/.test(normalized)) {
    return true;
  }

  const { dayIndex, minutes } = getJstDayAndMinutes(now);
  let currentContext = '';
  let cursor = 0;

  for (const match of normalized.matchAll(TIME_RANGE_PATTERN)) {
    const index = match.index ?? 0;
    const between = normalized.slice(cursor, index);
    if (DAY_CONTEXT_PATTERN.test(between)) {
      currentContext = between;
    }
    cursor = index + match[0].length;

    if (isClosedContext(currentContext)) {
      continue;
    }

    const days = expandDaysFromContext(currentContext);
    if (days && !days.has(dayIndex)) {
      continue;
    }

    const start = toMinutes(match[1], match[2]);
    const end = toMinutes(match[3], match[4]);
    if (isMinutesInRange(minutes, start, end)) {
      return true;
    }
  }

  return false;
}
