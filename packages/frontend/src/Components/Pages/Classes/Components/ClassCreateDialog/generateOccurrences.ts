import { isPolishHoliday } from '@utils/holidays';
import dayjs, { Dayjs } from 'dayjs';

export type ReocurranceType = 'none' | 'everyday' | 'weekends' | 'workdays' | 'onceAWeek' | 'custom';

export function generateOccurrences(
  selectedDate: Dayjs,
  selectedHour: Dayjs,
  reocurrance: ReocurranceType,
  customDays: number[],
  occurrencesCount: number,
  skipHolidays: boolean = true
): string[] {
  let occ: string[] = [];
  let d = selectedDate.hour(selectedHour.hour()).minute(selectedHour.minute());
  let count = 0;
  while (occ.length < occurrencesCount) {
    const dayOfWeek = d.day();
    let add = false;
    switch (reocurrance) {
      case 'none':
        add = occ.length === 0;
        break;
      case 'everyday':
        add = true;
        break;
      case 'weekends':
        add = dayOfWeek === 0 || dayOfWeek === 6;
        break;
      case 'workdays':
        add = dayOfWeek >= 1 && dayOfWeek <= 5;
        break;
      case 'onceAWeek':
        add = occ.length === 0 || (occ.length > 0 && d.diff(dayjs(occ[occ.length - 1]), 'day') === 7);
        break;
      case 'custom':
        add = customDays.includes(dayOfWeek);
        break;
      default:
        add = true;
    }
    // Skip holidays if requested
    if (add && (!skipHolidays || !isPolishHoliday(d.toDate()))) {
      occ.push(d.toISOString());
    }
    d = d.add(1, 'day');
    count++;
    if (count > 366) break; // safety
  }
  return occ;
}
