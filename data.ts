import { Team, Member, Task, Role, Status, Comment } from './types';
import { AVATARS } from './constants';

export const initialMembers: Member[] = [
  {
    id: 'user-1',
    name: 'Noureldeen Elwakil',
    email: 'n.elwakil@comfnet.com',
    avatarUrl: AVATARS[0],
    role: Role.Owner,
    password: 'A123456789!',
  },
];

export const initialTeams: Team[] = [
    {
        id: 'team-1',
        name: 'Core Development',
        description: 'Team responsible for the core application features.',
        memberIds: [
            { id: 'user-1', role: Role.Owner },
        ]
    }
];

export const initialTasks: Task[] = [];

export const initialComments: { [taskId: string]: Comment[] } = {};