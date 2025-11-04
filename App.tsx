import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MyTasksView from './components/MyTasksView';
import MembersView from './components/MembersView';
import AddMemberModal from './components/AddMemberModal';
import AddTaskModal from './components/AddTaskModal';
import LoginPage from './components/LoginPage';
import TaskDetailModal from './components/TaskDetailModal';
import CompletedTasksView from './components/CompletedTasksView';
import MemberEditModal from './components/MemberEditModal';
import { initialMembers, initialTasks, initialComments, initialTeams } from './data';
import { Member, Task, Comment, Status, Role, Team } from './types';

type View = 'dashboard' | 'my-tasks' | 'members' | 'completed-tasks';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [comments, setComments] = useState<{ [taskId: string]: Comment[] }>(initialComments);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  
  const handleLogin = (email: string, password: string): boolean => {
    const user = members.find(m => m.email.toLowerCase() === email.toLowerCase() && m.password === password);
    if (user) {
      setCurrentUser(user);
      setActiveView('dashboard');
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(currentTasks => 
        currentTasks.map(task => {
            if (task.id !== taskId) return task;
            
            const updatedTask = { ...task, ...updates };

            if (updates.status === Status.Done && task.status !== Status.Done) {
                updatedTask.completedById = currentUser?.id;
                updatedTask.completedAt = new Date().toISOString();
            } else if (updates.status && updates.status !== Status.Done) {
                updatedTask.completedById = undefined;
                updatedTask.completedAt = undefined;
            }
            return updatedTask;
        })
    );
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
    setComments(currentComments => {
        const newComments = {...currentComments};
        delete newComments[taskId];
        return newComments;
    });
    setSelectedTaskId(null);
  };
  
  const handleAddComment = (taskId: string, comment: Omit<Comment, 'id'>) => {
    const newComment: Comment = { ...comment, id: `com-${Date.now()}` };
    setComments(currentComments => ({
        ...currentComments,
        [taskId]: [...(currentComments[taskId] || []), newComment]
    }));
  };

  const handleAddMember = (name: string, email: string) => {
    const newId = `mem-${Date.now()}`;
    const newMember: Member = {
      id: newId,
      name,
      email,
      avatarUrl: `https://picsum.photos/seed/${newId}/40/40`,
      password: '12345',
      role: Role.Member,
    };
    setMembers(currentMembers => [...currentMembers, newMember]);
    setIsAddMemberModalOpen(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (currentUser && memberId === currentUser.id) {
      alert("You cannot remove yourself.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this member?")) {
      setMembers(currentMembers => currentMembers.filter(m => m.id !== memberId));
    }
  };

  const handleUpdateMember = (memberId: string, updates: Partial<Member>) => {
    let updatedUser: Member | undefined;
    setMembers(currentMembers =>
        currentMembers.map(m => {
            if (m.id === memberId) {
                updatedUser = { ...m, ...updates };
                return updatedUser;
            }
            return m;
        })
    );
    if (currentUser && currentUser.id === memberId && updatedUser) {
        setCurrentUser(updatedUser);
    }
    setEditingMemberId(null);
  };
  
  const handleAddTask = (taskData: { title: string; description: string; assignedToId: string; dueDate: string; color: string; }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      teamId: '',
      title: taskData.title,
      description: taskData.description,
      assignedToId: taskData.assignedToId,
      status: Status.ToDo,
      dueDate: taskData.dueDate,
      color: taskData.color,
    };
    setTasks(currentTasks => [...currentTasks, newTask]);
    setIsAddTaskModalOpen(false);
  };

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [selectedTaskId, tasks]);

  const memberToEdit = useMemo(() => {
    if (!editingMemberId) return null;
    return members.find(m => m.id === editingMemberId) || null;
  }, [editingMemberId, members]);


  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} teams={teams} members={members} />;
      case 'my-tasks':
        return <MyTasksView 
                    tasks={tasks} 
                    members={members} 
                    currentUser={currentUser}
                    onSelectTask={setSelectedTaskId} 
                    onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                />;
      case 'completed-tasks':
        return <CompletedTasksView 
                    tasks={tasks}
                    members={members}
                    onSelectTask={setSelectedTaskId}
                />;
      case 'members':
        if (currentUser.role !== Role.Owner) {
            setActiveView('dashboard');
            return <DashboardView tasks={tasks} teams={teams} members={members} />;
        }
        return <MembersView 
          members={members}
          currentUser={currentUser}
          onAddMember={() => setIsAddMemberModalOpen(true)}
          onRemoveMember={handleRemoveMember}
          onEditMember={setEditingMemberId}
        />;
      default:
        return <DashboardView tasks={tasks} teams={teams} members={members} />;
    }
  };
  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout}
        onProfileClick={() => setEditingMemberId(currentUser.id)}
        currentUser={currentUser}
      />
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
      {isAddMemberModalOpen && (
        <AddMemberModal 
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={handleAddMember}
        />
      )}
       {isAddTaskModalOpen && (
        <AddTaskModal 
          members={members}
          currentUser={currentUser}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}
      {selectedTask && currentUser && (
        <TaskDetailModal
          task={selectedTask}
          comments={comments[selectedTask.id] || []}
          members={members}
          currentUser={currentUser}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onAddComment={handleAddComment}
          onRemoveTask={handleRemoveTask}
        />
      )}
       {memberToEdit && (
        <MemberEditModal
          member={memberToEdit}
          onClose={() => setEditingMemberId(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}
    </div>
  );
};

export default App;