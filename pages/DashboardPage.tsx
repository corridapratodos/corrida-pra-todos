import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { TRAINING_PLANS } from '../constants';
import { WorkoutLog, Achievement, DailyWorkout } from '../types';
import LogWorkoutModal from '../components/LogWorkoutModal';
import { useToaster } from '../components/Toaster';

const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
  <div className="bg-dark-card p-4 rounded-xl flex items-center space-x-4 shadow-lg">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-medium-text text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-light-text">{value}</p>
    </div>
  </div>
);

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-3 transition-all duration-300 ${achievement.unlocked ? 'bg-green-500/20' : 'bg-dark-border'}`}>
        <span className={`text-3xl ${achievement.unlocked ? 'opacity-100' : 'opacity-30'}`}>{achievement.icon}</span>
        <div>
            <h4 className={`font-bold ${achievement.unlocked ? 'text-light-text' : 'text-medium-text'}`}>{achievement.name}</h4>
            <p className="text-xs text-medium-text">{achievement.description}</p>
        </div>
    </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="my-4">
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-brand-secondary">Progresso do Plano</span>
            <span className="text-sm font-medium text-brand-secondary">{value}%</span>
        </div>
        <div className="w-full bg-dark-border rounded-full h-2.5">
            <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const hasConsecutiveDays = (logs: WorkoutLog[], days: number): boolean => {
    const completedDates = new Set(
        logs.filter(l => l.completed).map(l => l.date)
    );

    if (completedDates.size < days) return false;

    const sortedDates = Array.from(completedDates).sort();

    for (let i = 0; i <= sortedDates.length - days; i++) {
        let isConsecutive = true;
        for (let j = 0; j < days - 1; j++) {
            const currentDate = new Date(sortedDates[i + j] + 'T00:00:00');
            const nextDate = new Date(sortedDates[i + j + 1] + 'T00:00:00');
            const diffTime = nextDate.getTime() - currentDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays !== 1) {
                isConsecutive = false;
                break;
            }
        }
        if (isConsecutive) return true;
    }
    return false;
};


const DashboardPage: React.FC = () => {
  const { user, getWorkoutLogs, addWorkoutLog } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<{ workout: DailyWorkout; date: string } | null>(null);
  const { addToast } = useToaster();

  const fetchLogs = useCallback(async () => {
    try {
        setLoading(true);
        const userLogs = await getWorkoutLogs();
        setLogs(userLogs);
    } catch (error) {
        addToast({ message: 'Falha ao carregar treinos.', type: 'error' });
    } finally {
        setLoading(false);
    }
  }, [getWorkoutLogs, addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const plan = TRAINING_PLANS.find(p => p.id === user?.currentPlanId);
  
  const totalDistance = useMemo(() => logs.reduce((acc, log) => acc + (log.distance || 0), 0), [logs]);
  const totalRuns = useMemo(() => logs.filter(log => log.type === 'run' && log.completed).length, [logs]);
  const totalTime = useMemo(() => logs.reduce((acc, log) => acc + (log.time || 0), 0), [logs]);
  const formattedTotalTime = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;
  const bestPace = useMemo(() => Math.min(...logs.filter(l => l.distance && l.time && l.distance > 0).map(l => l.time! / l.distance!)), [logs]);
  const bestPaceDisplay = bestPace === Infinity ? 'N/A' : `${bestPace.toFixed(2)} min/km`;
  const streak = useMemo(() => calculateStreak(logs), [logs]);

  const totalWorkoutsInPlan = plan ? plan.schedule.reduce((acc, week) => acc + week.workouts.length, 0) : 0;
  const completedWorkoutsCount = logs.filter(log => log.completed).length;
  const progressionPercentage = totalWorkoutsInPlan > 0 ? Math.round((completedWorkoutsCount / totalWorkoutsInPlan) * 100) : 0;


  const achievements: Achievement[] = useMemo(() => {
      const hasPaceRecord = logs.some(l => l.completed && l.type === 'run' && l.distance && l.distance > 0 && l.time);
      const hasTwoDayStreak = hasConsecutiveDays(logs, 2);

      return [
          { id: 'first_km', name: 'Primeiro KM', description: 'Corra seu primeiro quilômetro.', icon: '👟', unlocked: totalDistance >= 1 },
          { id: 'first_hour', name: 'Primeira Hora', description: 'Acumule uma hora de exercícios.', icon: '⏱️', unlocked: totalTime >= 60 },
          { id: 'two_day_streak', name: 'Embalou!', description: 'Treine por dois dias seguidos.', icon: '🔥', unlocked: hasTwoDayStreak },
          { id: 'first_pace', name: 'Que Ritmo!', description: 'Registre seu primeiro pace em uma corrida.', icon: '⚡️', unlocked: hasPaceRecord },
      ];
  }, [logs, totalDistance, totalTime]);

  const handleLogChange = async (log: WorkoutLog) => {
    await addWorkoutLog(log);
    addToast({ message: 'Treino atualizado com sucesso!', type: 'success' });
    setSelectedWorkout(null);
    fetchLogs(); // Re-fetch logs to update dashboard
  };
  
  if (!user || !plan || loading) {
    return <div>Carregando...</div>;
  }
  
  const today = new Date();
  const startDate = new Date(user.planStartDate!);
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.min(plan.duration, Math.floor(diffDays / 7) + 1);
  const weekData = plan.schedule.find(w => w.week === currentWeek);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Olá, {user.name}!</h1>
        <p className="text-medium-text mt-1">Aqui está o seu progresso. Continue assim!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Distância Total" value={`${totalDistance.toFixed(2)} km`} icon="🗺️" />
        <StatCard title="Corridas Completas" value={`${totalRuns}`} icon="🏃" />
        <StatCard title="Tempo Total" value={formattedTotalTime} icon="⏱️" />
        <StatCard title="Melhor Ritmo" value={bestPaceDisplay} icon="⚡️" />
        <StatCard title="Sequência" value={`${streak} dias`} icon="🔥" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dark-card p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold">Seu Plano: {plan.name}</h3>
            <ProgressBar value={progressionPercentage} />
            <h3 className="text-xl font-bold mb-4 mt-6">Semana {currentWeek}: Foco e Força</h3>
            <div className="space-y-3">
                {weekData?.workouts.map(workout => {
                    const workoutDate = new Date(startDate);
                    workoutDate.setDate(startDate.getDate() + (currentWeek - 1) * 7 + workout.day - 1);
                    const dateString = workoutDate.toISOString().split('T')[0];
                    const log = logs.find(l => l.date === dateString);
                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                    return (
                        <div 
                            key={workout.day} 
                            className={`flex items-center justify-between p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 ${log?.completed ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20' : 'border-dark-border bg-dark-bg/50 hover:bg-dark-border/50'} ${isToday ? 'ring-2 ring-brand-primary' : ''}`}
                            onClick={() => setSelectedWorkout({ workout, date: dateString })}
                        >
                            <div>
                                <p className="font-bold">{workout.dayName}</p>
                                <p className="text-sm text-medium-text">{workout.activity}</p>
                            </div>
                            {log?.completed && <CheckCircleIcon className="h-6 w-6 text-green-400" />}
                        </div>
                    );
                })}
            </div>
            <Link to="/plan" className="mt-6 inline-block w-full text-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                Ver Plano Completo
            </Link>
        </div>
        
        <div className="bg-dark-card p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Conquistas 🏆</h3>
            <div className="space-y-4">
               {achievements.map(ach => <AchievementBadge key={ach.id} achievement={ach} />)}
            </div>
        </div>
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

// Helper function to calculate streak
const calculateStreak = (logs: WorkoutLog[]): number => {
    if (logs.length === 0) return 0;
    const completedDates = new Set(logs.filter(l => l.completed).map(l => l.date));
    if (completedDates.size === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    while (true) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (completedDates.has(dateString)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            // Allow one day of rest
            currentDate.setDate(currentDate.getDate() - 1);
            const prevDateString = currentDate.toISOString().split('T')[0];
            if (!completedDates.has(prevDateString) || streak === 0) {
                 // Check if today is a completed day if streak is 0
                 if (streak === 0 && completedDates.has(new Date().toISOString().split('T')[0])) {
                     streak = 1;
                 }
                 break;
            }
        }
    }
    return streak;
};

const CheckCircleIcon: React.FC<{className: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


export default DashboardPage;
