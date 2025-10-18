import { fares } from "./data/fares.js";
import { fareCap } from "./data/fareCaps.js";
import { Journey, Day, isPeak, getMondayOfWeek, formatDate } from "./utils.js";
import fs from "fs";

// Load journeys from JSON
const journeys: Journey[] = JSON.parse(
  fs.readFileSync("./src/data/journeys.json", "utf-8")
);

// ------------------
// Fare Calculation for One Week
// ------------------
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
    console.log(`  → Total of Journeys: £${total}`);
    console.log(`  → Daily Fare Cap: £${cap}`);
    console.log(`  → Daily Fare Cost (Applied): £${appliedFare}`);
  });

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

// ------------------
// MASTER FUNCTION
// ------------------
export function calculateAllFares(journeys: Journey[]) {
  journeys.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const weekGroups: Record<string, Journey[]> = {};
  journeys.forEach((j) => {
    const monday = getMondayOfWeek(j.date);
    const label = monday.toISOString().split("T")[0];
    if (!weekGroups[label]) weekGroups[label] = [];
    weekGroups[label].push(j);
  });

  let grandTotal = 0;
  Object.entries(weekGroups).forEach(([monday, weekJourneys]) => {
    const mondayDate = new Date(monday);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);
    const weekLabel = `${formatDate(monday)} - ${formatDate(sundayDate.toISOString().split("T")[0])}`;
    grandTotal += calculateWeekFare(weekJourneys, weekLabel);
  });

  console.log(`\n================================`);
  console.log(` FINAL GRAND TOTAL: £${grandTotal}`);
  console.log(`================================`);
  return grandTotal;
}

// Run only when invoked directly
if (process.argv[1].includes("prog.ts")) {
  calculateAllFares(journeys);
}
