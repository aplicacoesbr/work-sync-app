import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recordsService } from '@/services/recordsService';
import { useToast } from '@/hooks/use-toast';
import type { Record } from '@/types/records';

export const useRecords = (selectedDate: Date) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await recordsService.getRecordsByDate(user.id, selectedDate);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar registros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<Record>) => {
    try {
      await recordsService.updateRecord(recordId, updates);
      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso!",
      });
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar registro.",
        variant: "destructive",
      });
    }
  };

  const deleteRecord = async (recordId: string) => {
    try {
      await recordsService.deleteRecord(recordId);
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
      });
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir registro.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, user]);

  return {
    records,
    loading,
    fetchRecords,
    updateRecord,
    deleteRecord,
  };
};