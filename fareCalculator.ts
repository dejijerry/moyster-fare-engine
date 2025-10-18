type Zone = 1 | 2;

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface Journey {
  date: string; // e.g. "2025-10-06"
  day: Day;
  time: string; // "HH:MM"
  from: Zone;
  to: Zone;
}

interface FareRules {
  peak: number;
  offPeak: number;
}

interface FareCapRules {
  oneToOne: number;
  oneToTwo: number;
  twoToOne: number;
  twoToTwo: number;
}

// ---------------------------
// Fare and Cap Configuration
// ---------------------------
const fares: Record<string, FareRules> = {
  "1-1": { peak: 30, offPeak: 25 },
  "1-2": { peak: 35, offPeak: 30 },
  "2-1": { peak: 35, offPeak: 30 },
  "2-2": { peak: 25, offPeak: 20 },
};

const fareCap: Record<Day, FareCapRules> = {
  Monday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Tuesday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Wednesday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Thursday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Friday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Saturday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Sunday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
};

// ---------------------------
// Helper Functions
// ---------------------------


/**
 * 
 * @param day 
 * @param time 
 * @returns 
    Week days peak hours
      start: "07:00" 7hours, end: "10:30" 10hours and 30mins 
      start: "17:00" 17hours, end: "20:00" 20hours
    Weekend peak hours
      start: "09:00" 9hours, end: "11:00" 11hours
      start: "18:00"18hours, end: "22:00" 20hours 
 * 
 */
function isPeak(day: Day, time: string): boolean {
  const [sh, sm] = time.split(":").map(Number);
  const isWeekend = ["Saturday", "Sunday"].includes(day);
  if (isWeekend) return (sh >= 9 && sh <= 11) || (sh >= 18 && sh <= 22);
  return (sh >= 7 && sh <= 10 && sm <= 30) || (sh >= 17 && sh <= 22);
}

function getMondayOfWeek(dateStr: string): Date {
  const date = new Date(dateStr);
  const day = date.getUTCDay(); // Sunday=0, Monday=1
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setUTCDate(diff));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// ---------------------------
// Fare Calculation for One Week
// ---------------------------
function calculateWeekFare(weekJourneys: Journey[], weekLabel: string) {
  console.log(`\n==============================`);
  console.log(`  WEEK OF ${weekLabel}`);
  console.log(`==============================`);

  const dailyTotals: Record<Day, Record<string, number>> = {
    Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {},
    Friday: {}, Saturday: {}, Sunday: {},
  };
  const dailyMaxCap: Record<Day, number> = {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
    Friday: 0, Saturday: 0, Sunday: 0,
  };
  const dayToDate: Record<Day, string> = {
    Monday: "", Tuesday: "", Wednesday: "", Thursday: "",
    Friday: "", Saturday: "", Sunday: "",
  };

  // STEP 1: Calculate journey fares
  weekJourneys.forEach((j) => {
    const key = `${j.from}-${j.to}`;
    const fare = isPeak(j.day, j.time) ? fares[key].peak : fares[key].offPeak;

    dailyTotals[j.day][key] = (dailyTotals[j.day][key] || 0) + fare;
    dayToDate[j.day] = j.date;

    const caps = fareCap[j.day];
    const capValue =
      key === "1-1" ? caps.oneToOne :
      key === "1-2" ? caps.oneToTwo :
      key === "2-1" ? caps.twoToOne :
      caps.twoToTwo;

    if (capValue > dailyMaxCap[j.day]) dailyMaxCap[j.day] = capValue;
  });

  const cappedDailyTotals: Record<Day, number> = {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
    Friday: 0, Saturday: 0, Sunday: 0,
  };

  // STEP 2: Compute daily totals
  (Object.keys(dailyTotals) as Day[]).forEach((day) => {
    if (!Object.keys(dailyTotals[day]).length) return;

    const total = Object.values(dailyTotals[day]).reduce((a, b) => a + b, 0);
    const cap = dailyMaxCap[day];
    const appliedFare = total >= cap ? cap : total;

    cappedDailyTotals[day] = appliedFare;

    const date = dayToDate[day] || "N/A";
    console.log(`\n${day} ${formatDate(date)}:`);
    Object.entries(dailyTotals[day]).forEach(([pair, fare]) => {
      console.log(`  ${pair} - £${fare}`);
    });
    console.log(`  => Total of Journeys: £${total}`);
    console.log(`  => Daily Fare Cap: £${cap}`);
    console.log(`  => Daily Fare Cost (Applied): £${appliedFare}`);
  });

  // STEP 3: Weekly Cap
  const zonePairs = new Set(weekJourneys.map((j) => `${j.from}-${j.to}`));
  let weeklyCap = 0;
  if (zonePairs.has("1-2") || zonePairs.has("2-1")) weeklyCap = 600;
  else if (zonePairs.has("1-1")) weeklyCap = 500;
  else if (zonePairs.has("2-2")) weeklyCap = 400;

  const totalWeek = Object.values(cappedDailyTotals).reduce((a, b) => a + b, 0);
  const sumDailyCaps = Object.values(dailyMaxCap).reduce((a, b) => a + b, 0);
  const finalWeeklyFare = Math.min(totalWeek, weeklyCap);

  console.log(`\n------------------------------`);
  console.log(`   WEEKLY SUMMARY (${weekLabel})`);
  console.log(`------------------------------`);
  console.log(`Sum of Daily Fare Caps: £${sumDailyCaps}`);
  console.log(`Total Weekly Fare (sum of days): £${totalWeek}`);
  console.log(`Weekly Fare Cap (by zone pairs): £${weeklyCap}`);
  console.log(`Final Weekly Fare (after cap): £${finalWeeklyFare}`);

  return finalWeeklyFare;
}

// ---------------------------
// MASTER FUNCTION
// ---------------------------
function calculateAllFares(journeys: Journey[]) {
  // Sort journeys by date
  journeys.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group journeys by week
  const weekGroups: Record<string, Journey[]> = {};
  journeys.forEach((j) => {
    const monday = getMondayOfWeek(j.date);
    const label = monday.toISOString().split("T")[0];
    if (!weekGroups[label]) weekGroups[label] = [];
    weekGroups[label].push(j);
  });

  // Process each week
  let grandTotal = 0;
  Object.entries(weekGroups).forEach(([monday, weekJourneys]) => {
    const mondayDate = new Date(monday);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    const weekLabel = `${formatDate(monday)} - ${formatDate(
      sundayDate.toISOString().split("T")[0]
    )}`;

    grandTotal += calculateWeekFare(weekJourneys, weekLabel);
  });

  console.log(`\n================================`);
  console.log(` FINAL GRAND TOTAL: £${grandTotal}`);
  console.log(`================================`);
}

// ---------------------------
// SAMPLE JOURNEYS
// ---------------------------
const journeys: Journey[] = [
  { date: "2025-10-06", day: "Monday", time: "09:00", from: 1, to: 2 },
  { date: "2025-10-06", day: "Monday", time: "12:00", from: 1, to: 1 },
  { date: "2025-10-07", day: "Tuesday", time: "09:30", from: 1, to: 2 },
  { date: "2025-10-08", day: "Wednesday", time: "08:00", from: 2, to: 1 },
  { date: "2025-10-10", day: "Friday", time: "18:30", from: 2, to: 2 },
  { date: "2025-10-11", day: "Saturday", time: "19:00", from: 2, to: 2 },
  { date: "2025-10-12", day: "Sunday", time: "20:30", from: 2, to: 2 },

  { date: "2025-10-13", day: "Monday", time: "09:15", from: 1, to: 2 },
  { date: "2025-10-14", day: "Tuesday", time: "12:00", from: 1, to: 1 },
  { date: "2025-10-16", day: "Thursday", time: "10:00", from: 2, to: 1 },
  { date: "2025-10-18", day: "Saturday", time: "20:00", from: 2, to: 2 },
];

calculateAllFares(journeys);






/*
The output of the code above. The journey input can be updated and changes will reflect in the output
==============================
  WEEK OF 06/10/2025 - 12/10/2025
==============================

Monday 06/10/2025:
  1-2 - £35
  1-1 - £25
  => Total of Journeys: £60
  => Daily Fare Cap: £120
  => Daily Fare Cost (Applied): £60

Tuesday 07/10/2025:
  1-2 - £35
  => Total of Journeys: £35
  => Daily Fare Cap: £120
  => Daily Fare Cost (Applied): £35

Wednesday 08/10/2025:
  2-1 - £35
  => Total of Journeys: £35
  => Daily Fare Cap: £120
  => Daily Fare Cost (Applied): £35

Friday 10/10/2025:
  2-2 - £25
  => Total of Journeys: £25
  => Daily Fare Cap: £80
  => Daily Fare Cost (Applied): £25

Saturday 11/10/2025:
  2-2 - £25
  => Total of Journeys: £25
  => Daily Fare Cap: £80
  => Daily Fare Cost (Applied): £25

Sunday 12/10/2025:
  2-2 - £25
  => Total of Journeys: £25
  => Daily Fare Cap: £80
  => Daily Fare Cost (Applied): £25

------------------------------
   WEEKLY SUMMARY (06/10/2025 - 12/10/2025)
------------------------------
Sum of Daily Fare Caps: £600
Total Weekly Fare (sum of days): £205
Weekly Fare Cap (by zone pairs): £600
Final Weekly Fare (after cap): £205

==============================
  WEEK OF 13/10/2025 - 19/10/2025
==============================

Monday 13/10/2025:
  1-2 - £35
  => Total of Journeys: £35
  => Daily Fare Cap: £120
  => Daily Fare Cost (Applied): £35

Tuesday 14/10/2025:
  1-1 - £25
  => Total of Journeys: £25
  => Daily Fare Cap: £100
  => Daily Fare Cost (Applied): £25

Thursday 16/10/2025:
  2-1 - £35
  => Total of Journeys: £35
  => Daily Fare Cap: £120
  => Daily Fare Cost (Applied): £35

Saturday 18/10/2025:
  2-2 - £25
  => Total of Journeys: £25
  => Daily Fare Cap: £80
  => Daily Fare Cost (Applied): £25

------------------------------
   WEEKLY SUMMARY (13/10/2025 - 19/10/2025)
------------------------------
Sum of Daily Fare Caps: £420
Total Weekly Fare (sum of days): £120
Weekly Fare Cap (by zone pairs): £600
Final Weekly Fare (after cap): £120

================================
 FINAL GRAND TOTAL: £325
================================


*/
