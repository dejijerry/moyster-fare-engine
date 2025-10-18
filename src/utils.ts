export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Journey {
  day: Day;
  date: string;
  from: string;
  to: string;
  time: string;
}

export function isPeak(day: Day, time: string): boolean {
  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute;
  const morningPeak = totalMinutes >= 420 && totalMinutes <= 540; // 07:00–09:00
  const eveningPeak = totalMinutes >= 1020 && totalMinutes <= 1140; // 17:00–19:00
  return morningPeak || eveningPeak;
}

export function getMondayOfWeek(dateStr: string): Date {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}
