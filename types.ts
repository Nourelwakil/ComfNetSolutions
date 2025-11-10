
export enum Role {
  Owner = 'Owner',
  Member = 'Member',
  Viewer = 'Viewer',
}

export enum Status {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Blocked = 'Blocked',
  Done = 'Done',
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  password?: string;
  isDeleted?: boolean;
}

// Fix: Defined and exported the TeamMember interface to resolve a circular dependency.
export interface TeamMember extends Member {}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
  reactions?: Record<string, string[]>;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  assignedToIds: string[];
  status: Status;
  dueDate: string;
  color?: string;
  completedById?: string;
  completedAt?: string;
}

export interface Team {
  id:string;
  name: string;
  description: string;
  memberIds: { id: string, role: Role }[];
}