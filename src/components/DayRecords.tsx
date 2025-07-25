import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import HoraspontoManager from '@/components/HoraspontoManager';
import { SearchableProjectSelector } from '@/components/shared/SearchableProjectSelector';
import { SearchableStageSelector } from '@/components/shared/SearchableStageSelector';
import { SearchableTaskSelector } from '@/components/shared/SearchableTaskSelector';
import { TimePercentageInput } from '@/components/shared/TimePercentageInput';
import { RecordItem } from '@/components/records/RecordItem';
import { useRecords } from '@/hooks/useRecords';
import type { Project, Stage, Task, HorasPonto } from '@/types/records';

interface DayRecordsProps {
  selectedDate: Date;
  onRefresh: () => void;
}

const DayRecords: React.FC<DayRecordsProps> = ({ selectedDate, onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { records, loading, fetchRecords, updateRecord, deleteRecord } = useRecords(selectedDate);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [horasPonto, setHorasPonto] = useState<HorasPonto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New record form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    project_id: '',
    stage_id: '',
    task_id: '',
    worked_hours: '',
    percentage: '',
    description: ''
  });

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, [selectedDate, user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      // Fetch stages
      const { data: stagesData } = await supabase
        .from('stages')
        .select('id, name, project_id')
        .order('name');

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, name, stage_id')
        .order('name');

      // Fetch horasponto for the selected date
      const { data: horaspontoData } = await supabase
        .from('horasponto')
        .select('total_hours')
        .eq('user_id', user.id)
        .eq('date', dateKey)
        .maybeSingle();

      setProjects(projectsData || []);
      setStages(stagesData || []);
      setTasks(tasksData || []);
      setHorasPonto(horaspontoData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getProjectName = (projectId: string) => 
    projects.find(p => p.id === projectId)?.name || 'Projeto não encontrado';

  const getStageName = (stageId: string) => 
    stages.find(s => s.id === stageId)?.name || 'Etapa não encontrada';

  const getTaskName = (taskId?: string) => 
    taskId ? tasks.find(t => t.id === taskId)?.name || 'Tarefa não encontrada' : '';

  const getFilteredStages = (projectId: string) => 
    stages.filter(s => s.project_id === projectId);

  const getFilteredTasks = (stageId: string) => 
    tasks.filter(t => t.stage_id === stageId);

  const totalHours = records.reduce((sum, record) => sum + Number(record.worked_hours), 0);
  const totalPercentage = records.reduce((sum, record) => sum + Number(record.percentage), 0);
  const isOvertime = horasPonto && totalHours > horasPonto.total_hours;

  const handleAddRecord = async () => {
    if (!user || !horasPonto) {
      toast({
        title: "Erro",
        description: "É necessário ter o ponto do dia salvo antes de adicionar registros.",
        variant: "destructive",
      });
      return;
    }

    if (!newRecord.project_id || !newRecord.stage_id) {
      toast({
        title: "Erro",
        description: "Projeto e etapa são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('records')
        .insert({
          user_id: user.id,
          date: dateKey,
          project_id: newRecord.project_id,
          stage_id: newRecord.stage_id,
          task_id: newRecord.task_id || null,
          worked_hours: Number(newRecord.worked_hours),
          percentage: Number(newRecord.percentage),
          description: newRecord.description || null,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro adicionado com sucesso!",
      });

      setNewRecord({
        project_id: '',
        stage_id: '',
        task_id: '',
        worked_hours: '',
        percentage: '',
        description: ''
      });
      setShowAddForm(false);
      fetchData();
      fetchRecords();
      onRefresh();
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar registro.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    await deleteRecord(recordId);
    onRefresh();
  };

  const handleUpdateRecord = async (recordId: string, updates: any) => {
    await updateRecord(recordId, updates);
    onRefresh();
  };

  const filteredRecords = records.filter(record => 
    getProjectName(record.project_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStageName(record.stage_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTaskName(record.task_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Registros - {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </h2>
          {horasPonto && (
            <p className="text-sm text-muted-foreground">
              Ponto do dia: {horasPonto.total_hours}h
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <HoraspontoManager 
            selectedDate={selectedDate}
            horasPonto={horasPonto}
            onUpdate={fetchData}
          />
          <Button 
            size="sm" 
            onClick={() => setShowAddForm(true)}
            disabled={!horasPonto}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="bg-muted/30 border rounded-lg p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Novo Registro</h3>
            <div className="text-sm text-muted-foreground">
              Ponto do dia: {horasPonto?.total_hours || 0}h
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Projeto</label>
                <SearchableProjectSelector
                  projects={projects}
                  value={newRecord.project_id}
                  onValueChange={(value) => setNewRecord({...newRecord, project_id: value, stage_id: '', task_id: ''})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Etapa</label>
                <SearchableStageSelector
                  stages={getFilteredStages(newRecord.project_id)}
                  value={newRecord.stage_id}
                  onValueChange={(value) => setNewRecord({...newRecord, stage_id: value, task_id: ''})}
                  disabled={!newRecord.project_id}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tarefa (opcional)</label>
                <SearchableTaskSelector
                  tasks={getFilteredTasks(newRecord.stage_id)}
                  value={newRecord.task_id}
                  onValueChange={(value) => setNewRecord({...newRecord, task_id: value})}
                  disabled={!newRecord.stage_id}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <TimePercentageInput
                hoursValue={newRecord.worked_hours}
                percentageValue={newRecord.percentage}
                onHoursChange={(value) => setNewRecord({...newRecord, worked_hours: value})}
                onPercentageChange={(value) => setNewRecord({...newRecord, percentage: value})}
                totalDayHours={horasPonto?.total_hours || 8}
              />
              
              <div>
                <label className="text-sm font-medium mb-2 block">Observação (opcional)</label>
                <Textarea
                  placeholder="Descreva as atividades realizadas..."
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handleAddRecord} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Salvar Registro
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando registros...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-muted-foreground mb-2">Nenhum registro encontrado para este dia.</div>
            <p className="text-sm text-muted-foreground">Adicione seu primeiro registro clicando no botão "Adicionar" acima.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              projects={projects}
              stages={stages}
              tasks={tasks}
              onUpdate={handleUpdateRecord}
              onDelete={handleDeleteRecord}
              totalDayHours={horasPonto?.total_hours || 8}
              getProjectName={getProjectName}
              getStageName={getStageName}
              getTaskName={getTaskName}
              getFilteredStages={getFilteredStages}
              getFilteredTasks={getFilteredTasks}
            />
          ))
        )}
      </div>

      {records.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-lg font-semibold text-foreground">Resumo do Dia:</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className={cn(
                  "text-lg font-bold",
                  isOvertime ? "text-destructive" : "text-primary"
                )}>
                  {totalHours}h ({totalPercentage}%)
                </div>
                {isOvertime && (
                  <div className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                    Excesso: {(totalHours - horasPonto!.total_hours).toFixed(1)}h
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayRecords;