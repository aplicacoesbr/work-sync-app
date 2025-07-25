export interface Record {
  id: string;
  project_id: string;
  stage_id: string;
  task_id?: string;
  worked_hours: number;
  percentage: number;
  description?: string;
  user_id: string;
  date: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  name: string;
  project_id: string;
}

export interface Task {
  id: string;
  name: string;
  stage_id: string;
}

export interface HorasPonto {
  total_hours: number;
}