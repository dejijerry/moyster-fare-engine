import { calculateAllFares } from "../src/prog.js";
import { isPeak } from "../src/utils.js";

describe("Fare calculation system", () => {
  test("detects peak and off-peak correctly", () => {
    expect(isPeak("Monday", "08:00")).toBe(true);
    expect(isPeak("Monday", "11:00")).toBe(false);
    expect(isPeak("Monday", "18:00")).toBe(true);
  });

  test("applies correct daily cap (1-2 journeys)", () => {
    const journeys = [
      { day: "Monday", date: "2025-10-06", from: "1", to: "2", time: "08:00" },
      { day: "Monday", date: "2025-10-06", from: "1", to: "2", time: "18:00" },
      { day: "Monday", date: "2025-10-06", from: "1", to: "2", time: "19:00" }
    ];
    const result = calculateAllFares(journeys);
    expect(result).toBeLessThanOrEqual(120);
  });

  test("applies weekly cap of £600 for mixed zones (1-2, 2-1)", () => {
    const journeys = [
      { day: "Monday", date: "2025-10-06", from: "1", to: "2", time: "09:00" },
      { day: "Tuesday", date: "2025-10-07", from: "2", to: "1", time: "09:00" },
      { day: "Wednesday", date: "2025-10-08", from: "1", to: "2", time: "08:00" },
      { day: "Thursday", date: "2025-10-09", from: "2", to: "1", time: "18:00" },
      { day: "Friday", date: "2025-10-10", from: "1", to: "1", time: "11:00" },
      { day: "Saturday", date: "2025-10-11", from: "2", to: "2", time: "19:00" }
    ];
    const result = calculateAllFares(journeys);
    expect(result).toBeLessThanOrEqual(600);
  });

  test("resets weekly cap correctly between weeks", () => {
    const journeys = [
      { day: "Monday", date: "2025-10-06", from: "1", to: "2", time: "09:00" },
      { day: "Tuesday", date: "2025-10-07", from: "1", to: "2", time: "10:00" },
      { day: "Monday", date: "2025-10-13", from: "1", to: "2", time: "09:00" }
    ];
    const result = calculateAllFares(journeys);
    expect(result).toBeLessThan(1200);
  });
});
