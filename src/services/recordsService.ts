import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Record } from '@/types/records';

export const recordsService = {
  async getRecordsByDate(userId: string, date: Date): Promise<Record[]> {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateKey)
      .order('created_at');

    if (error) throw error;
    return data || [];
  },

  async updateRecord(recordId: string, updates: Partial<Record>) {
    const { error } = await supabase
      .from('records')
      .update(updates)
      .eq('id', recordId);

    if (error) throw error;
  },

  async deleteRecord(recordId: string) {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', recordId);

    if (error) throw error;
  },

  async createRecord(record: Omit<Record, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('records')
      .insert(record);

    if (error) throw error;
  }
};