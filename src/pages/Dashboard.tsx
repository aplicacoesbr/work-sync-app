import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import Calendar from '@/components/Calendar';
import DayRecords from '@/components/DayRecords';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayStatus, setDayStatus] = useState<Record<string, 'complete' | 'incomplete' | 'none'>>({});

  useEffect(() => {
    fetchMonthStatus();
  }, [selectedDate, user]);

  const fetchMonthStatus = async () => {
    if (!user) return;

    try {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      // Fetch horasponto data for the month
      const { data: horaspontoData } = await supabase
        .from('horasponto')
        .select('date, total_hours')
        .eq('user_id', user.id)
        .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth, 'yyyy-MM-dd'));

      // Fetch records data for the month  
      const { data: recordsData } = await supabase
        .from('records')
        .select('date, worked_hours')
        .eq('user_id', user.id)
        .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth, 'yyyy-MM-dd'));

      const statusMap: Record<string, 'complete' | 'incomplete' | 'none'> = {};

      // Group records by date
      const recordsByDate = recordsData?.reduce((acc, record) => {
        const date = record.date;
        if (!acc[date]) acc[date] = 0;
        acc[date] += Number(record.worked_hours);
        return acc;
      }, {} as Record<string, number>) || {};

      // Determine status for each day
      horaspontoData?.forEach(horasponto => {
        const date = horasponto.date;
        const totalRecordHours = recordsByDate[date] || 0;
        const horaspontoHours = Number(horasponto.total_hours);

        if (totalRecordHours >= horaspontoHours) {
          statusMap[date] = 'complete';
        } else if (totalRecordHours > 0) {
          statusMap[date] = 'incomplete';
        } else {
          statusMap[date] = 'none';
        }
      });

      setDayStatus(statusMap);
    } catch (error) {
      console.error('Error fetching month status:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            dayStatus={dayStatus}
          />

          <DayRecords 
            selectedDate={selectedDate}
            onRefresh={fetchMonthStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;