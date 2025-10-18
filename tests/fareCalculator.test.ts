import { calculateFares } from "../src/fareCalculator";
import journeys from "../src/journeys.json";

describe("Fare Calculator", () => {
  test("calculates daily and weekly caps correctly", () => {
    const result = calculateFares(journeys);
    expect(result.weeklyFareCap).toBe(600);
    expect(result.dailyResults.length).toBeGreaterThan(0);
  });

  test("applies daily fare caps correctly", () => {
    const sample = [
      { day: "Monday", date: "2025-10-06", time: "09:00", from: 1, to: 2 },
      { day: "Monday", date: "2025-10-06", time: "18:00", from: 1, to: 2 },
    ];
    const result = calculateFares(sample);
    expect(result.dailyResults[0]).toContain("→ Daily Fare Cap");
  });

  test("applies peak/off-peak logic", () => {
    const samplePeak = [
      { day: "Tuesday", date: "2025-10-07", time: "08:30", from: 1, to: 2 },
    ];
    const sampleOffPeak = [
      { day: "Tuesday", date: "2025-10-07", time: "14:00", from: 1, to: 2 },
    ];
    const peakFare = calculateFares(samplePeak);
    const offPeakFare = calculateFares(sampleOffPeak);
    expect(peakFare.dailyResults[0]).not.toEqual(offPeakFare.dailyResults[0]);
  });
});
