export interface FareCapRules {
  oneToOne: number;
  oneToTwo: number;
  twoToOne: number;
  twoToTwo: number;
}

export const fareCap: Record<string, FareCapRules> = {
  Monday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Tuesday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Wednesday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Thursday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Friday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Saturday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
  Sunday: { oneToOne: 100, oneToTwo: 120, twoToOne: 120, twoToTwo: 80 },
};
