// Polish public holidays checker

interface Holiday {
  month: number;
  day: number;
}

const FIXED_HOLIDAYS: Holiday[] = [
  { month: 1, day: 1 },   // New Year
  { month: 1, day: 6 },   // Epiphany
  { month: 5, day: 1 },   // Labour Day
  { month: 5, day: 3 },   // Constitution Day
  { month: 8, day: 15 },  // Assumption
  { month: 11, day: 1 },  // All Saints
  { month: 11, day: 11 }, // Independence Day
  { month: 12, day: 25 }, // Christmas
  { month: 12, day: 26 }, // Boxing Day
];

// Easter dates for common years (approximation)
const EASTER_DATES: { [key: number]: { month: number; day: number } } = {
  2024: { month: 3, day: 31 },
  2025: { month: 4, day: 20 },
  2026: { month: 4, day: 5 },
  2027: { month: 3, day: 28 },
  2028: { month: 4, day: 16 },
  2029: { month: 4, day: 1 },
  2030: { month: 4, day: 21 },
};

export const isPolishHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();

  // Check fixed holidays
  for (const holiday of FIXED_HOLIDAYS) {
    if (month === holiday.month && day === holiday.day) {
      return true;
    }
  }

  // Check Easter-based holidays
  const easter = EASTER_DATES[year];
  if (easter) {
    const easterDate = new Date(year, easter.month - 1, easter.day);
    const easterMonday = new Date(easterDate.getTime() + 86400000);
    const corpusChristi = new Date(easterDate.getTime() + 60 * 86400000);

    if (
      (month === easterMonday.getMonth() + 1 && day === easterMonday.getDate()) ||
      (month === corpusChristi.getMonth() + 1 && day === corpusChristi.getDate())
    ) {
      return true;
    }
  }

  return false;
};

export const isWorkingDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6 && !isPolishHoliday(date);
};
