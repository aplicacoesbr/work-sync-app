import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground">Work Sync</h1>
          <p className="text-xl text-muted-foreground">Sistema de controle de ponto e projetos</p>
        </div>
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Gerencie seu tempo, acompanhe projetos e controle seu ponto de forma simples e eficiente.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="font-semibold"
          >
            Começar agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
