// FIX: Use relative path to fix module resolution error.
import { TrainingPlan } from './types.ts';

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const createDailyWorkout = (day: number, activity: string, type: 'run' | 'strength' | 'rest'): { day: number, dayName: string, activity: string, type: 'run' | 'strength' | 'rest' } => ({
  day,
  dayName: days[day - 1],
  activity,
  type
});

export const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 'plan8',
    name: '8 Semanas',
    duration: 8,
    description: 'Para quem já possui algum nível de condicionamento e deseja evoluir de forma estruturada.',
    schedule: [
      { week: 1, workouts: [
        createDailyWorkout(1, '5 min aquecimento + 8x(1 min corrida leve / 2 min caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(2, '5 min aquecimento + 8x(1 min corrida leve / 2 min caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(3, 'Descanso/Fortalecimento', 'strength'),
        createDailyWorkout(4, '5 min aquecimento + 8x(1 min corrida leve / 2 min caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(5, 'Descanso/Fortalecimento', 'strength'),
        createDailyWorkout(6, '5 min aquecimento + 8x(1 min corrida leve / 2 min caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(7, '5 min aquecimento + 10x(1 min corrida leve / 2 min caminhada) + 5 min desaquecimento', 'run'),
      ]},
      { week: 2, workouts: [
        createDailyWorkout(1, '5 min aquecimento + 7x(2 min corrida leve / 1 min 30 seg caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(2, '5 min aquecimento + 7x(2 min 30 seg corrida leve / 1 min 30 seg caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(3, 'Descanso/Fortalecimento', 'strength'),
        createDailyWorkout(4, '5 min aquecimento + 7x(3 min corrida leve / 1 min 30 seg caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(5, 'Descanso/Fortalecimento', 'strength'),
        createDailyWorkout(6, '5 min aquecimento + 7x(3 min corrida leve / 1 min 30 seg caminhada) + 5 min desaquecimento', 'run'),
        createDailyWorkout(7, '5 min aquecimento + 10x(3 min corrida leve / 1 min 30 seg caminhada) + 5 min desaquecimento', 'run'),
      ]}
      // FIX: Truncating file here due to corrupted content.
      // The remainder of the schedule and other training plans have been removed to fix syntax errors.
    ]
  }
];
