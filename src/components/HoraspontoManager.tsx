import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HoraspontoManagerProps {
  selectedDate: Date;
  horasPonto: { total_hours: number } | null;
  onUpdate: () => void;
}

const HoraspontoManager: React.FC<HoraspontoManagerProps> = ({ selectedDate, horasPonto, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (horasPonto) {
      setHours(horasPonto.total_hours.toString());
    } else {
      setHours('8');
    }
  }, [horasPonto]);

  const handleSave = async () => {
    if (!user) return;

    const totalHours = parseFloat(hours);
    if (isNaN(totalHours) || totalHours <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe um número válido de horas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      
      if (horasPonto) {
        // Update existing
        const { error } = await supabase
          .from('horasponto')
          .update({ total_hours: totalHours })
          .eq('user_id', user.id)
          .eq('date', dateKey);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('horasponto')
          .insert({
            user_id: user.id,
            date: dateKey,
            total_hours: totalHours
          });
        
        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Ponto registrado com sucesso!",
      });

      setDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving horasponto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar ponto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          {horasPonto ? 'Editar Ponto' : 'Registrar Ponto'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {horasPonto ? 'Editar' : 'Registrar'} Ponto do Dia
          </DialogTitle>
          <DialogDescription>
            {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Horas do dia</label>
            <Input
              type="number"
              step="0.1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="8.0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Total de horas a serem trabalhadas neste dia
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HoraspontoManager;