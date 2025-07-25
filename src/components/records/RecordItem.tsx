import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InlineEdit } from '@/components/ui/inline-edit';
import { ProjectSelector } from '@/components/shared/ProjectSelector';
import { StageSelector } from '@/components/shared/StageSelector';
import { TaskSelector } from '@/components/shared/TaskSelector';
import { Edit, Trash2, Check, X } from 'lucide-react';
import type { Record, Project, Stage, Task } from '@/types/records';

interface RecordItemProps {
  record: Record;
  projects: Project[];
  stages: Stage[];
  tasks: Task[];
  onUpdate: (recordId: string, updates: Partial<Record>) => void;
  onDelete: (recordId: string) => void;
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
      <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Editando Registro</h4>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProjectSelector
            projects={projects}
            value={editData.project_id}
            onValueChange={(value) => setEditData({
              ...editData, 
              project_id: value, 
              stage_id: '', 
              task_id: ''
            })}
          />
          
          <StageSelector
            stages={getFilteredStages(editData.project_id)}
            value={editData.stage_id}
            onValueChange={(value) => setEditData({
              ...editData, 
              stage_id: value, 
              task_id: ''
            })}
            disabled={!editData.project_id}
          />
          
          <TaskSelector
            tasks={getFilteredTasks(editData.stage_id)}
            value={editData.task_id}
            onValueChange={(value) => setEditData({...editData, task_id: value})}
            disabled={!editData.stage_id}
          />
          
          <div className="flex space-x-2">
            <InlineEdit
              value={editData.worked_hours}
              onSave={(value) => setEditData({...editData, worked_hours: value})}
              onCancel={() => {}}
              type="number"
              step="0.1"
              className="flex-1"
            />
            <InlineEdit
              value={editData.percentage}
              onSave={(value) => setEditData({...editData, percentage: value})}
              onCancel={() => {}}
              type="number"
              max="100"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">{getProjectName(record.project_id)}</div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
  );
};