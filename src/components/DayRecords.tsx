import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, RefreshCw, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import HoraspontoManager from '@/components/HoraspontoManager';

interface Project {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string;
  project_id: string;
}

interface Task {
  id: string;
  name: string;
  stage_id: string;
}

interface Record {
  id: string;
  project_id: string;
  stage_id: string;
  task_id?: string;
  worked_hours: number;
  percentage: number;
  description?: string;
}

interface HorasPonto {
  total_hours: number;
}

interface DayRecordsProps {
  selectedDate: Date;
  onRefresh: () => void;
}

const DayRecords: React.FC<DayRecordsProps> = ({ selectedDate, onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [horasPonto, setHorasPonto] = useState<HorasPonto | null>(null);
  const [loading, setLoading] = useState(false);
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
    
    setLoading(true);
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

      // Fetch records for the selected date
      const { data: recordsData } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateKey)
        .order('created_at');

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
      setRecords(recordsData || []);
      setHorasPonto(horaspontoData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
      });

      fetchData();
      onRefresh();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir registro.",
        variant: "destructive",
      });
    }
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
        <div className="bg-muted p-4 rounded-lg mb-6 space-y-4">
          <h3 className="font-medium">Novo Registro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                value={newRecord.project_id}
                onValueChange={(value) => setNewRecord({...newRecord, project_id: value, stage_id: '', task_id: ''})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={newRecord.stage_id}
                onValueChange={(value) => setNewRecord({...newRecord, stage_id: value, task_id: ''})}
                disabled={!newRecord.project_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredStages(newRecord.project_id).map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={newRecord.task_id}
                onValueChange={(value) => setNewRecord({...newRecord, task_id: value})}
                disabled={!newRecord.stage_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tarefa (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredTasks(newRecord.stage_id).map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Horas trabalhadas"
                type="number"
                step="0.1"
                value={newRecord.worked_hours}
                onChange={(e) => setNewRecord({...newRecord, worked_hours: e.target.value})}
              />
            </div>
            <div>
              <Input
                placeholder="Porcentagem"
                type="number"
                max="100"
                value={newRecord.percentage}
                onChange={(e) => setNewRecord({...newRecord, percentage: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                placeholder="Observação (opcional)"
                value={newRecord.description}
                onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleAddRecord}>Salvar</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado para este dia.
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{getProjectName(record.project_id)}</div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRecord(record.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Etapa:</span> {getStageName(record.stage_id)}
                {record.task_id && (
                  <>
                    <span className="ml-4 font-medium">Tarefa:</span> {getTaskName(record.task_id)}
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span><span className="font-medium">Horas:</span> {record.worked_hours}h</span>
                <span><span className="font-medium">%:</span> {record.percentage}%</span>
              </div>
              {record.description && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Obs:</span> {record.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {records.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <div className="text-right">
              <div className={cn(
                "font-medium",
                isOvertime && "text-destructive"
              )}>
                {totalHours}h ({totalPercentage}%)
              </div>
              {isOvertime && (
                <div className="text-sm text-destructive">
                  Excesso: {(totalHours - horasPonto!.total_hours).toFixed(1)}h
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayRecords;