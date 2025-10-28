import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

const AdminPage: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useCallback(async () => {
    if (user?.email === 'admin@corrida.com') {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
    }
  }, [user, getAllUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (user?.email !== 'admin@corrida.com') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500">Acesso Negado</h1>
        <p className="text-medium-text">Você não tem permissão para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Painel do Administrador</h1>
        <p className="text-medium-text mt-1">Visão geral de todos os usuários cadastrados.</p>
      </div>
      <div className="bg-dark-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Plano Atual</th>
                <th scope="col" className="px-6 py-3">Data de Início</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="bg-dark-card border-b border-dark-border hover:bg-dark-border/50">
                  <td className="px-6 py-4 font-medium text-light-text whitespace-nowrap">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.currentPlanId ? u.currentPlanId.replace('plan', 'Plano ') : 'Nenhum'}</td>
                  <td className="px-6 py-4">{u.planStartDate ? new Date(u.planStartDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
