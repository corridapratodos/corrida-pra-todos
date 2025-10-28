import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, WeightEntry, WorkoutLog } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToaster } from '@/components/Toaster';

const ProfilePage: React.FC = () => {
  const { user, updateUser, getWeightEntries, addWeightEntry, getWorkoutLogs } = useAuth();
  const { addToast } = useToaster();
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: user?.name || '',
    dob: user?.dob || '',
    height: user?.height || 0,
    sex: user?.sex || 'male',
  });
  const [newWeight, setNewWeight] = useState<string>('');
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const fetchPageData = useCallback(async () => {
      try {
          const [weights, logs] = await Promise.all([getWeightEntries(), getWorkoutLogs()]);
          setWeightEntries(weights);
          setLogs(logs);
      } catch (error) {
          addToast({ message: "Erro ao carregar dados do perfil.", type: "error" });
      }
  }, [getWeightEntries, getWorkoutLogs, addToast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);
  
  const completedLogs = useMemo(() => {
    return logs
        .filter(log => log.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await updateUser(formData);
        addToast({ message: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch {
        addToast({ message: 'Falha ao atualizar perfil.', type: 'error' });
    }
  };
  
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 0) {
      try {
        const newEntry = { date: new Date().toISOString(), weight: weightValue };
        await addWeightEntry(newEntry);
        setWeightEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewWeight('');
        addToast({ message: 'Peso adicionado!', type: 'success' });
      } catch {
        addToast({ message: 'Falha ao adicionar peso.', type: 'error' });
      }
    } else {
      addToast({ message: 'Por favor, insira um peso válido.', type: 'error' });
    }
  };

  const age = useMemo(() => {
    if (!user?.dob) return 'N/A';
    const birthDate = new Date(user.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [user?.dob]);
  
  const chartData = useMemo(() => {
      return weightEntries.map(entry => ({
          date: new Date(entry.date).toLocaleDateString('pt-BR'),
          peso: entry.weight
      }));
  }, [weightEntries]);


  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Meu Perfil</h1>
        <p className="text-medium-text mt-1">Gerencie suas informações e acompanhe sua evolução.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-1 bg-dark-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Informações Pessoais</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-medium-text">Nome</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-medium-text">Data de Nascimento</label>
              <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-medium-text">Sexo</label>
              <select name="sex" id="sex" value={formData.sex} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
             <div>
              <label htmlFor="height" className="block text-sm font-medium text-medium-text">Altura (cm)</label>
              <input type="number" name="height" id="height" value={formData.height} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <p className="text-sm text-medium-text">Idade: {age} anos</p>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">Salvar Alterações</button>
          </form>
        </div>

        {/* Weight Tracking */}
        <div className="lg:col-span-2 bg-dark-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Acompanhamento de Peso</h2>
           <form onSubmit={handleWeightSubmit} className="flex items-end space-x-2 mb-6">
                <div className="flex-grow">
                    <label htmlFor="weight" className="block text-sm font-medium text-medium-text">Novo Peso (kg)</label>
                    <input type="number" step="0.1" name="weight" id="weight" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="mt-1 block w-full bg-gray-700 border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="Ex: 75.5"/>
                </div>
                <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors h-10">Adicionar</button>
            </form>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={['dataMin - 2', 'dataMax + 2']}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="peso" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Workout History */}
      <div className="bg-dark-card p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-bold mb-4">Histórico de Treinos</h2>
        <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-medium-text uppercase bg-dark-card sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">Data</th>
                        <th scope="col" className="px-4 py-3">Atividade</th>
                        <th scope="col" className="px-4 py-3">Distância</th>
                        <th scope="col" className="px-4 py-3">Tempo</th>
                        <th scope="col" className="px-4 py-3">Ritmo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                    {completedLogs.length > 0 ? completedLogs.map(log => {
                        const pace = (log.time && log.distance && log.distance > 0) ? (log.time / log.distance).toFixed(2) : 'N/A';
                        return (
                            <tr key={log.date} className="hover:bg-dark-border/50">
                                <td className="px-4 py-4 font-medium text-light-text">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-4 text-light-text">{log.activity || log.type}</td>
                                <td className="px-4 py-4 text-light-text">{log.distance ? `${log.distance.toFixed(2)} km` : '-'}</td>
                                <td className="px-4 py-4 text-light-text">{log.time ? `${log.time} min` : '-'}</td>
                                <td className="px-4 py-4 text-light-text">{pace !== 'N/A' ? `${pace} min/km` : '-'}</td>
                            </tr>
                        )
                    }) : (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-medium-text">Nenhum treino concluído ainda.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>

    </div>
  );
};

export default ProfilePage;
