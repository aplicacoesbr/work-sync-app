import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendário - Coluna Esquerda */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calendário</h2>
            <div className="text-center text-muted-foreground py-8">
              <p>Calendário será implementado aqui</p>
            </div>
          </div>

          {/* Registros do Dia - Coluna Direita */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Registros do Dia</h2>
            <div className="text-center text-muted-foreground py-8">
              <p>Registros serão implementados aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;