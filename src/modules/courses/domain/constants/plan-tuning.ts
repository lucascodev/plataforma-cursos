// Ratios tuned by hand while writing the first course: about a fifth of each module goes to the project
// and a third of each lesson to studying before the exercise starts.
export const planTuning = {
  weeksPerMonth: 52 / 12,
  studyDaysPerWeek: 6,
  projectShare: 0.2,
  minimumProjectDays: 6,
  studyShare: 0.35,
  reviewThreshold: 3,
} as const;
