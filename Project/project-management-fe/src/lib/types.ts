// Base types matching database schema
export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'PLANNING' | 'ACTIVE' | 'ARCHIVED';
}

export interface Epic {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  projectId: number;
}

export interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  status: "NOT_STARTED" | "ACTIVE" | "COMPLETED";
  startDate: string;
  endDate: string;
  projectId: number;
}

export interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  type: "STORY" | "BUG" | "TASK";
  storyPoints: number;
  location: "BACKLOG" | "SPRINT" | "COMPLETED";
  sprintId: number | null;
  projectId: number;
  epicId: number | null;
}

export interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Cost {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  category: string;
}

export interface CostAssignment {
  id: number;
  costId: number;
  epicId: number | null;
  workItemId: number | null;
}

export interface PersonAssignment {
  id: number;
  personId: number;
  epicId: number | null;
  workItemId: number | null;
  hours: number;
  description: string | null;
}
