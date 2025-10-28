import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TRAINING_PLANS } from '../constants';
import { WorkoutLog, DailyWorkout } from '../types';
import LogWorkoutModal from '../components/LogWorkoutModal';
import { useToaster } from '../components/Toaster';

const TrainingPlanPage: React.FC = () => {
  const { user, getWorkoutLogs, addWorkoutLog } = useAuth();
  const { addToast } = useToaster();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<{ workout: DailyWorkout; date: string } | null>(null);
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const plan = TRAINING_PLANS.find(p => p.id === user?.currentPlanId);

  const fetchLogs = useCallback(async () => {
      const userLogs = await getWorkoutLogs();
      setLogs(userLogs);
  }, [getWorkoutLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!plan || !user?.planStartDate) return;

    const today = new Date();
    const startDate = new Date(user.planStartDate);
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(plan.duration, Math.floor(diffDays / 7) + 1);

    const currentWeekElement = weekRefs.current[currentWeek];
    if (currentWeekElement) {
        const timer = setTimeout(() => {
             currentWeekElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return () => clearTimeout(timer);
    }
 }, [plan, user?.planStartDate]);


  if (!user || !plan || !user.planStartDate) {
    return <div>Carregando plano...</div>;
  }

  const startDate = new Date(user.planStartDate);
  
  const handleLogChange = async (log: WorkoutLog) => {
    await addWorkoutLog(log);
    addToast({ message: 'Treino atualizado com sucesso!', type: 'success' });
    setSelectedWorkout(null);
    fetchLogs();
  };
  
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Meu Plano de {plan.duration} Semanas</h1>
        <p className="text-medium-text mt-1">Clique em um treino para registrar seu progresso.</p>
      </div>

      <div className="space-y-10">
        {plan.schedule.map(week => {
            const weekStartDate = new Date(startDate);
            weekStartDate.setDate(startDate.getDate() + (week.week - 1) * 7);
            const isCurrentWeek = todayString >= weekStartDate.toISOString().split('T')[0] && todayString < new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            return (
                <div 
                    key={week.week}
                    ref={el => { weekRefs.current[week.week] = el }}
                    className={`p-6 rounded-xl shadow-lg transition-all duration-500 ${isCurrentWeek ? 'bg-dark-card ring-2 ring-brand-primary' : 'bg-dark-card'}`}
                >
                    <h2 className="text-2xl font-bold mb-4 text-brand-secondary">Semana {week.week}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {week.workouts.map(workout => {
                        const workoutDate = new Date(startDate);
                        workoutDate.setDate(startDate.getDate() + (week.week - 1) * 7 + workout.day - 1);
                        const dateString = workoutDate.toISOString().split('T')[0];
                        const log = logs.find(l => l.date === dateString);

                        return (
                        <div
                            key={workout.day}
                            className={`p-4 rounded-lg flex flex-col justify-between cursor-pointer transition-all duration-200 border-l-4 ${log?.completed ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' : 'border-dark-border bg-dark-bg/50 hover:bg-dark-border/50'} ${dateString === todayString ? 'ring-2 ring-brand-primary/50' : ''}`}
                            onClick={() => setSelectedWorkout({ workout, date: dateString })}
                        >
                            <div>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-light-text">{workout.dayName}</p>
                                    {log?.completed && <CheckCircleIcon className="h-5 w-5 text-green-400"/>}
                                </div>
                                <p className="text-xs text-medium-text">{dateString.split('-').reverse().join('/')}</p>
                                <p className="text-sm text-light-text mt-2">{workout.activity}</p>
                            </div>
                            {log?.completed && log.type === 'run' && (
                                <div className="text-xs mt-3 pt-3 border-t border-dark-border/50 text-medium-text">
                                    <p>Dist: {log.distance?.toFixed(2)} km</p>
                                    <p>Tempo: {log.time} min</p>
                                    <p>Ritmo: {(log.time && log.distance) ? (log.time/log.distance).toFixed(2) : 'N/A'} min/km</p>
                                </div>
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
            );
        })}
      </div>

      {selectedWorkout && (
        <LogWorkoutModal
          isOpen={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          workout={selectedWorkout.workout}
          date={selectedWorkout.date}
          onSave={handleLogChange}
          initialLog={logs.find(l => l.date === selectedWorkout.date)}
        />
      )}
    </div>
  );
};

const CheckCircleIcon: React.FC<{className: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;

export default TrainingPlanPage;
