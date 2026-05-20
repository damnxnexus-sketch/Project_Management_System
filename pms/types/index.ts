export type Role = 'Master Admin' | 'Admin' | 'Worker';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  aiRisk?: boolean; // If true, indicates 'High Risk of Delay'
}

export interface Project {
  id: string;
  name: string;
  description: string;
}
