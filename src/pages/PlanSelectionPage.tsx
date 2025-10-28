import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TRAINING_PLANS } from '@/constants';
import { PlanId } from '@/types';

const PlanCard: React.FC<{plan: typeof TRAINING_PLANS[0], onSelect: (id: PlanId) => void}> = ({ plan, onSelect }) => (
    <div className="bg-dark-card rounded-xl p-6 flex flex-col items-center text-center border-2 border-dark-border hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
        <h3 className="text-3xl font-bold text-brand-secondary">{plan.name}</h3>
        <p className="text-medium-text my-4 flex-grow">{plan.description}</p>
        <button
            onClick={() => onSelect(plan.id)}
            className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-secondary transition-colors"
        >
            Selecionar Plano
        </button>
    </div>
)

const PlanSelectionPage: React.FC = () => {
  const { user, selectPlan, logout } = useAuth();

  const handleSelectPlan = (planId: PlanId) => {
    selectPlan(planId);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-light-text">Selecione seu Plano de Treinamento</h1>
            <p className="text-lg text-medium-text mt-2 max-w-2xl mx-auto">
                Olá, {user?.name}! Escolha o plano que melhor se adapta ao seu nível e objetivos para começar sua jornada de 5km.
            </p>
        </div>
      
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRAINING_PLANS.map(plan => (
                <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))}
        </div>
        <button onClick={logout} className="mt-12 text-medium-text hover:text-light-text underline">
            Sair
        </button>
    </div>
  );
};

export default PlanSelectionPage;
