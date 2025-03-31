import { Contact } from './contact.model';

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  status: string;
  assignedTo: Contact[];
  subtasks: { title: string; completed: boolean }[];
  createdAt?: number;
}
