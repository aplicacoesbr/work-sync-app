import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
}

interface Stage {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  created_at: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  stage_id: string;
  created_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Dialog states
  const [projectDialog, setProjectDialog] = useState(false);
  const [stageDialog, setStageDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState(false);
  
  // Form states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'aberto'
  });
  
  const [stageForm, setStageForm] = useState({
    name: '',
    description: '',
    project_id: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    stage_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, stagesRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').order('name'),
        supabase.from('stages').select('*').order('name'),
        supabase.from('tasks').select('*').order('name')
      ]);

      setProjects(projectsRes.data || []);
      setStages(stagesRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectForm)
          .eq('id', editingProject.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectForm);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Projeto criado com sucesso!",
        });
      }

      setProjectForm({ name: '', description: '', status: 'aberto' });
      setEditingProject(null);
      setProjectDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto.",
        variant: "destructive",
      });
    }
  };

  const handleSaveStage = async () => {
    try {
      if (editingStage) {
        const { error } = await supabase
          .from('stages')
          .update(stageForm)
          .eq('id', editingStage.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Etapa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('stages')
          .insert(stageForm);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Etapa criada com sucesso!",
        });
      }

      setStageForm({ name: '', description: '', project_id: '' });
      setEditingStage(null);
      setStageDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving stage:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar etapa.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskForm)
          .eq('id', editingTask.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert(taskForm);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!",
        });
      }

      setTaskForm({ name: '', description: '', stage_id: '' });
      setEditingTask(null);
      setTaskDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Todas as etapas e tarefas relacionadas serão excluídas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa? Todas as tarefas relacionadas serão excluídas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', stageId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Etapa excluída com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir etapa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa.",
        variant: "destructive",
      });
    }
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      status: project.status
    });
    setProjectDialog(true);
  };

  const openEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStageForm({
      name: stage.name,
      description: stage.description || '',
      project_id: stage.project_id
    });
    setStageDialog(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      stage_id: task.stage_id
    });
    setTaskDialog(true);
  };

  const openNewStage = (projectId: string) => {
    setEditingStage(null);
    setStageForm({ name: '', description: '', project_id: projectId });
    setStageDialog(true);
  };

  const openNewTask = (stageId: string) => {
    setEditingTask(null);
    setTaskForm({ name: '', description: '', stage_id: stageId });
    setTaskDialog(true);
  };

  const getProjectStages = (projectId: string) => 
    stages.filter(stage => stage.project_id === projectId);

  const getStageTasks = (stageId: string) => 
    tasks.filter(task => task.stage_id === stageId);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos, etapas e tarefas</p>
        </header>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProject(null);
                setProjectForm({ name: '', description: '', status: 'aberto' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject ? 'Edite as informações do projeto.' : 'Crie um novo projeto.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="Nome do projeto"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Descrição do projeto"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={projectForm.status}
                    onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProject}>
                    {editingProject ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button variant="outline" onClick={() => setProjectDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum projeto encontrado.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {filteredProjects.map((project) => (
                  <AccordionItem key={project.id} value={project.id} className="border rounded-lg p-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {project.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditProject(project);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Etapas</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNewStage(project.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Etapa
                          </Button>
                        </div>
                        
                        {getProjectStages(project.id).map((stage) => (
                          <div key={stage.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{stage.name}</h5>
                                {stage.description && (
                                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditStage(stage)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteStage(stage.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="ml-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h6 className="text-sm font-medium">Tarefas</h6>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openNewTask(stage.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Nova Tarefa
                                </Button>
                              </div>
                              
                              {getStageTasks(stage.id).map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <div>
                                    <span className="text-sm font-medium">{task.name}</span>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground">{task.description}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditTask(task)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        )}

        {/* Stage Dialog */}
        <Dialog open={stageDialog} onOpenChange={setStageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStage ? 'Editar Etapa' : 'Nova Etapa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={stageForm.name}
                  onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                  placeholder="Nome da etapa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  placeholder="Descrição da etapa"
                />
              </div>
              {!editingStage && (
                <div>
                  <label className="text-sm font-medium">Projeto</label>
                  <Select
                    value={stageForm.project_id}
                    onValueChange={(value) => setStageForm({ ...stageForm, project_id: value })}
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
              )}
              <div className="flex space-x-2">
                <Button onClick={handleSaveStage}>
                  {editingStage ? 'Atualizar' : 'Criar'}
                </Button>
                <Button variant="outline" onClick={() => setStageDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                  placeholder="Nome da tarefa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Descrição da tarefa"
                />
              </div>
              {!editingTask && (
                <div>
                  <label className="text-sm font-medium">Etapa</label>
                  <Select
                    value={taskForm.stage_id}
                    onValueChange={(value) => setTaskForm({ ...taskForm, stage_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={handleSaveTask}>
                  {editingTask ? 'Atualizar' : 'Criar'}
                </Button>
                <Button variant="outline" onClick={() => setTaskDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Projects;