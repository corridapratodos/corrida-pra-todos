
export type PlanId = 'plan8' | 'plan12' | 'plan16' | 'plan20';

export interface User {
  id: string;
  name: string;
  email: string;
  dob: string; // YYYY-MM-DD
  height: number; // in cm
  sex: 'male' | 'female' | 'other';
  currentPlanId: PlanId | null;
  planStartDate: string | null; // ISO Date string
}

export interface WeightEntry {
  date: string; // ISO Date string
  weight: number; // in kg
}

export type WorkoutType = 'run' | 'strength' | 'rest';

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
  distance?: number; // in km
  time?: number; // in minutes
  type: WorkoutType;
  activity: string;
}

export interface DailyWorkout {
  day: number;
  dayName: string;
  activity: string;
  type: WorkoutType;
}

export interface WeeklyPlan {
  week: number;
  workouts: DailyWorkout[];
}

export interface TrainingPlan {
  id: PlanId;
  name: string;
  duration: number; // in weeks
  description: string;
  schedule: WeeklyPlan[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}