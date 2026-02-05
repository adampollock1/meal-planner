import { DayOfWeek } from '../types';

// Days array for both Sunday and Monday start
const DAYS_MONDAY_START: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SUNDAY_START: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get ordered days based on week start preference
 */
export function getOrderedDays(weekStartsOn: 'Sunday' | 'Monday'): DayOfWeek[] {
  return weekStartsOn === 'Sunday' ? DAYS_SUNDAY_START : DAYS_MONDAY_START;
}

/**
 * Get the start date of the current week based on week start preference
 */
export function getWeekStartDate(weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  let daysToSubtract: number;
  if (weekStartsOn === 'Sunday') {
    daysToSubtract = dayOfWeek;
  } else {
    // Monday start: if today is Sunday (0), go back 6 days; otherwise go back (day - 1)
    daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }
  
  date.setDate(date.getDate() - daysToSubtract);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get all dates for the current week
 */
export function getWeekDates(weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): Date[] {
  const startDate = getWeekStartDate(weekStartsOn, referenceDate);
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Get date for a specific day of the week in the current week
 */
export function getDateForDay(day: DayOfWeek, weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): Date {
  const orderedDays = getOrderedDays(weekStartsOn);
  const dayIndex = orderedDays.indexOf(day);
  const weekDates = getWeekDates(weekStartsOn, referenceDate);
  return weekDates[dayIndex];
}

/**
 * Get today's DayOfWeek
 */
export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Format a date as "Mon, Feb 4"
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date as "Tuesday, February 4, 2026"
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date as "Feb 4"
 */
export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date as just the day number "4"
 */
export function formatDayNumber(date: Date): string {
  return date.getDate().toString();
}

/**
 * Format week range as "Feb 3 - 9, 2026" or "Jan 27 - Feb 2, 2026"
 */
export function formatWeekRange(weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): string {
  const weekDates = getWeekDates(weekStartsOn, referenceDate);
  const startDate = weekDates[0];
  const endDate = weekDates[6];
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

/**
 * Check if the reference date's week contains today
 */
export function isCurrentWeek(weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): boolean {
  const weekDates = getWeekDates(weekStartsOn, referenceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = weekDates[0];
  const end = new Date(weekDates[6]);
  end.setHours(23, 59, 59, 999);
  
  return today >= start && today <= end;
}

/**
 * Get calendar grid for a month (6 weeks x 7 days)
 */
export function getCalendarMonth(year: number, month: number, weekStartsOn: 'Sunday' | 'Monday'): Date[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Calculate offset based on week start
  let offset: number;
  if (weekStartsOn === 'Sunday') {
    offset = firstDayOfWeek;
  } else {
    offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  }
  
  // Start from the first day visible on calendar
  const startDate = new Date(year, month, 1 - offset);
  
  const weeks: Date[][] = [];
  let currentDate = new Date(startDate);
  
  // Generate 6 weeks
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(days);
  }
  
  return weeks;
}

/**
 * Format month and year as "February 2026"
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date, weekStartsOn: 'Sunday' | 'Monday'): boolean {
  const start1 = getWeekStartDate(weekStartsOn, date1);
  const start2 = getWeekStartDate(weekStartsOn, date2);
  return start1.getTime() === start2.getTime();
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the date for a specific day of the week in a given week
 */
export function getDateForDayInWeek(day: DayOfWeek, weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): Date {
  const orderedDays = getOrderedDays(weekStartsOn);
  const dayIndex = orderedDays.indexOf(day);
  const weekDates = getWeekDates(weekStartsOn, referenceDate);
  return weekDates[dayIndex];
}

/**
 * Get day of week from a date
 */
export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if a date string matches the reference week
 */
export function isDateInWeek(dateString: string, weekStartsOn: 'Sunday' | 'Monday', referenceDate: Date = new Date()): boolean {
  const date = parseISODate(dateString);
  return isSameWeek(date, referenceDate, weekStartsOn);
}

/**
 * Check if a date string matches a specific date
 */
export function isSameDate(dateString: string, targetDate: Date): boolean {
  const date = parseISODate(dateString);
  return (
    date.getDate() === targetDate.getDate() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getFullYear() === targetDate.getFullYear()
  );
}
