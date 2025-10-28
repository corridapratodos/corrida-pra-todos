import React, { useState, useEffect } from 'react';
import { WorkoutLog, DailyWorkout } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workout: DailyWorkout;
  date: string;
  onSave: (log: WorkoutLog) => void;
  initialLog?: WorkoutLog;
}

const LogWorkoutModal: React.FC<Props> = ({ isOpen, onClose, workout, date, onSave, initialLog }) => {
  const [completed, setCompleted] = useState(initialLog?.completed || false);
  const [distance, setDistance] = useState(initialLog?.distance?.toString() || '');
  const [time, setTime] = useState(initialLog?.time?.toString() || '');

  useEffect(() => {
    setCompleted(initialLog?.completed || false);
    setDistance(initialLog?.distance?.toString() || '');
    setTime(initialLog?.time?.toString() || '');
  }, [initialLog]);
  
  if (!isOpen) return null;

  const handleSaveRun = () => {
    const log: WorkoutLog = {
      date,
      type: workout.type,
      activity: workout.activity,
      completed,
      distance: workout.type === 'run' ? parseFloat(distance) || 0 : undefined,
      time: workout.type === 'run' ? parseInt(time) || 0 : undefined,
    };
    onSave(log);
  };
  
  const handleStrengthChoice = (activity: 'Fortalecimento' | 'Descanso') => {
    const log: WorkoutLog = { 
        date, 
        type: 'strength',
        activity: activity,
        completed: true 
    };
    onSave(log);
  }
  
  const handleUncomplete = () => {
    const log: WorkoutLog = { 
        date, 
        type: workout.type,
        activity: workout.activity,
        completed: false 
    };
    onSave(log);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-md p-8 m-4 space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-light-text">Registrar Treino</h2>
            <p className="text-medium-text">{workout.dayName} - {date.split('-').reverse().join('/')}</p>
            <p className="text-sm text-light-text mt-2 bg-dark-bg p-3 rounded-md">{workout.activity}</p>
        </div>

        {workout.type === 'run' && (
          <>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="completed" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="h-5 w-5 rounded bg-gray-700 border-dark-border text-brand-primary focus:ring-brand-primary"/>
              <label htmlFor="completed" className="font-medium text-light-text">Marcar como concluído</label>
            </div>

            {completed && (
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="distance" className="block text-sm font-medium text-medium-text">Distância (km)</label>
                        <input type="number" id="distance" value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="Ex: 5.2"/>
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-medium-text">Tempo (minutos)</label>
                        <input type="number" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="Ex: 30"/>
                    </div>
                </div>
            )}
             <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dark-border">
                <button onClick={onClose} className="w-full bg-dark-border text-light-text font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                <button onClick={handleSaveRun} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">Salvar</button>
            </div>
          </>
        )}
        
        {workout.type === 'strength' && (
            <div className="space-y-4 pt-4 border-t border-dark-border">
                <p className="text-center text-medium-text">Como você aproveitou o dia?</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => handleStrengthChoice('Fortalecimento')} className="w-full bg-blue-500/20 text-blue-300 font-bold py-3 px-4 rounded-lg hover:bg-blue-500/30 transition-colors">💪 Fortaleci</button>
                    <button onClick={() => handleStrengthChoice('Descanso')} className="w-full bg-green-500/20 text-green-300 font-bold py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors">😴 Descansei</button>
                </div>
                {initialLog?.completed && (
                    <button onClick={handleUncomplete} className="w-full text-center text-sm text-medium-text hover:text-light-text pt-2">Marcar como não feito</button>
                )}
                 <button onClick={onClose} className="w-full bg-dark-border text-light-text font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors mt-4">Fechar</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default LogWorkoutModal;
