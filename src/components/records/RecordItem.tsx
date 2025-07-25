import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineEdit } from '@/components/ui/inline-edit';
import { SearchableProjectSelector } from '@/components/shared/SearchableProjectSelector';
import { SearchableStageSelector } from '@/components/shared/SearchableStageSelector';
import { SearchableTaskSelector } from '@/components/shared/SearchableTaskSelector';
import { TimePercentageInput } from '@/components/shared/TimePercentageInput';
import { Edit, Trash2, Check, X } from 'lucide-react';
import type { Record, Project, Stage, Task } from '@/types/records';

interface RecordItemProps {
  record: Record;
  projects: Project[];
  stages: Stage[];
  tasks: Task[];
  onUpdate: (recordId: string, updates: Partial<Record>) => void;
  onDelete: (recordId: string) => void;
  totalDayHours?: number;
  getProjectName: (projectId: string) => string;
  getStageName: (stageId: string) => string;
  getTaskName: (taskId?: string) => string;
  getFilteredStages: (projectId: string) => Stage[];
  getFilteredTasks: (stageId: string) => Task[];
}

export const RecordItem: React.FC<RecordItemProps> = ({
  record,
  projects,
  stages,
  tasks,
  onUpdate,
  onDelete,
  totalDayHours = 8,
  getProjectName,
  getStageName,
  getTaskName,
  getFilteredStages,
  getFilteredTasks
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    project_id: record.project_id,
    stage_id: record.stage_id,
    task_id: record.task_id || '',
    worked_hours: String(record.worked_hours),
    percentage: String(record.percentage),
    description: record.description || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(record.id, {
      project_id: editData.project_id,
      stage_id: editData.stage_id,
      task_id: editData.task_id || undefined,
      worked_hours: Number(editData.worked_hours),
      percentage: Number(editData.percentage),
      description: editData.description || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      project_id: record.project_id,
      stage_id: record.stage_id,
      task_id: record.task_id || '',
      worked_hours: String(record.worked_hours),
      percentage: String(record.percentage),
      description: record.description || ''
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border-2 border-primary/20 rounded-lg p-6 space-y-6 bg-muted/10">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-primary">Editando Registro</h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="px-4">
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="px-4">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Projeto</label>
              <SearchableProjectSelector
                projects={projects}
                value={editData.project_id}
                onValueChange={(value) => setEditData({
                  ...editData, 
                  project_id: value, 
                  stage_id: '', 
                  task_id: ''
                })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Etapa</label>
              <SearchableStageSelector
                stages={getFilteredStages(editData.project_id)}
                value={editData.stage_id}
                onValueChange={(value) => setEditData({
                  ...editData, 
                  stage_id: value, 
                  task_id: ''
                })}
                disabled={!editData.project_id}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tarefa (opcional)</label>
              <SearchableTaskSelector
                tasks={getFilteredTasks(editData.stage_id)}
                value={editData.task_id}
                onValueChange={(value) => setEditData({...editData, task_id: value})}
                disabled={!editData.stage_id}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <TimePercentageInput
              hoursValue={editData.worked_hours}
              percentageValue={editData.percentage}
              onHoursChange={(value) => setEditData({...editData, worked_hours: value})}
              onPercentageChange={(value) => setEditData({...editData, percentage: value})}
              totalDayHours={totalDayHours}
            />
            
            <div>
              <label className="text-sm font-medium mb-2 block">Observação</label>
              <Input
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                placeholder="Observação (opcional)"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-border/50 hover:border-border rounded-lg p-4 space-y-3 bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold text-foreground mb-1">
            {getProjectName(record.project_id)}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <span className="font-medium">Etapa:</span> {getStageName(record.stage_id)}
            </div>
            {record.task_id && (
              <div>
                <span className="font-medium">Tarefa:</span> {getTaskName(record.task_id)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(record.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm pt-2 border-t border-border/30">
        <div className="flex items-center gap-1">
          <span className="font-medium text-muted-foreground">Horas:</span> 
          <span className="font-semibold text-primary">{record.worked_hours}h</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-muted-foreground">%:</span> 
          <span className="font-semibold text-primary">{record.percentage}%</span>
        </div>
      </div>
      
      {record.description && (
        <div className="text-sm pt-2 border-t border-border/30">
          <span className="font-medium text-muted-foreground">Obs:</span>{' '}
          <span className="text-foreground">{record.description}</span>
        </div>
      )}
    </div>
  );
};