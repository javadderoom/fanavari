import { PersianMonth, PersianSeason } from '@/types/process';

export const PERSIAN_MONTHS: PersianMonth[] = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

export function getSeasonForMonth(month: PersianMonth): PersianSeason {
  if (['فروردین', 'اردیبهشت', 'خرداد'].includes(month)) return 'بهار';
  if (['تیر', 'مرداد', 'شهریور'].includes(month)) return 'تابستان';
  if (['مهر', 'آبان', 'آذر'].includes(month)) return 'پاییز';
  return 'زمستان';
}
