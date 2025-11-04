import { Team, Member, Task, Role, Status, Comment } from './types';

export const initialMembers: Member[] = [
  { 
    id: 'mem-1', 
    name: 'Noureldeen Elwakil', 
    email: 'n.elwakil@comfnet.com', 
    avatarUrl: 'https://picsum.photos/seed/mem-1/40/40',
    password: 'A123456789!',
    role: Role.Owner,
  },
];

export const initialTeams: Team[] = [];

export const initialTasks: Task[] = [];

export const initialComments: { [taskId:string]: Comment[] } = {};