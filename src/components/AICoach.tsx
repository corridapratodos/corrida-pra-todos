import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
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

      const prompt = `
        Você é um treinador de corrida virtual para um aplicativo chamado 'Corrida App'. Seu objetivo é motivar os usuários e fornecer conselhos práticos e personalizados.
        Um usuário chamado ${user.name}, que está seguindo ${planDescription} para correr 5km, pediu um conselho.

        Aqui estão seus dados de treino das últimas duas semanas:
        ${recentLogs.length > 0 ? recentLogs : 'Nenhum treino registrado nas últimas duas semanas.'}

        Analise esses dados e forneça um conselho curto, motivador e acionável em português do Brasil. O conselho deve ter no máximo 3 parágrafos.
        Considere os seguintes pontos na sua análise:
        - Consistência: O usuário está treinando nos dias programados?
        - Progresso: A distância ou o tempo estão aumentando? O pace está melhorando?
        - Pontos de atenção: Há muitos treinos perdidos? O progresso estagnou?

        Se os dados forem insuficientes (menos de 3 treinos registrados), dê um conselho geral e incentive o usuário a registrar mais treinos.
        Se o desempenho for bom, elogie e sugira um novo desafio.
        Se houver espaço para melhoria, dê uma dica construtiva e encorajadora.

        Seu tom deve ser amigável e de apoio.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setAdvice(response.text);

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
