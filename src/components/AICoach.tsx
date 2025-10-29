import React, { useState } from 'react';
import { User, WorkoutLog } from '../types.ts';
import { TRAINING_PLANS } from '../constants.ts';
import { useToaster } from './Toaster.tsx';

interface Props {
  user: User;
  logs: WorkoutLog[];
}

const AICoach: React.FC<Props> = ({ user, logs }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const { addToast } = useToaster();

  const getAdvice = async () => {
    setLoading(true);
    setAdvice('');

    try {
      // Removido a inicialização do GoogleGenAI do frontend por motivos de segurança.
      // A chamada agora é feita para o endpoint de backend do Vercel.
      
      const plan = TRAINING_PLANS.find(p => p.id === user.currentPlanId);
      const planDescription = plan ? `um plano de ${plan.duration} semanas` : 'um plano de corrida';
      
      const recentLogs = logs
        .filter(log => {
          const logDate = new Date(log.date);
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          return logDate >= twoWeeksAgo;
        })
        .map(log => 
          `Data: ${log.date}, Concluído: ${log.completed}, Atividade: ${log.activity}, Distância: ${log.distance || 'N/A'} km, Tempo: ${log.time || 'N/A'} min`
        ).join('\n');

      const payload = {
        userName: user.name,
        planDescription,
        recentLogs
      };

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI advice from server');
      }

      const data = await response.json();
      setAdvice(data.advice);

    } catch (error) {
      console.error('Error getting AI advice:', error);
      addToast({ message: 'Não foi possível obter o conselho do coach. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card p-6 rounded-xl shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-3xl">🧠</span>
        <h3 className="text-xl font-bold">Smart Coach</h3>
      </div>
      <p className="text-medium-text mb-4">Receba dicas personalizadas com base no seu progresso para alcançar seus objetivos mais rápido.</p>
      
      <button 
        onClick={getAdvice} 
        disabled={loading}
        className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analisando seu progresso...' : 'Pedir um conselho'}
      </button>

      {advice && (
        <div className="mt-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
          <p className="text-light-text whitespace-pre-wrap">{advice}</p>
        </div>
      )}
    </div>
  );
};

export default AICoach;
