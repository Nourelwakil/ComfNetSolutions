import React, { useState, useMemo, useEffect } from 'react';
// Fix: Use scoped Firebase packages to resolve module errors and import `getAuth`.
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getAuth } from '@firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy, serverTimestamp, getDocs, where, writeBatch, deleteField } from '@firebase/firestore';
import { initializeApp, deleteApp, FirebaseApp } from '@firebase/app';

import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MyTasksView from './components/MyTasksView';
import MembersView from './components/MembersView';
import AddTaskModal from './components/AddTaskModal';
import LoginPage from './components/LoginPage';
import TaskDetailModal from './components/TaskDetailModal';
import CompletedTasksView from './components/CompletedTasksView';
import MemberEditModal from './components/MemberEditModal';
import MissingFirebaseConfig from './components/MissingFirebaseConfig';
import { Member, Task, Comment, Status, Role, Team } from './types';
import { auth, db, isFirebaseConfigured, firebaseConfig } from './firebase';
import AddMemberModal from './components/AddMemberModal';
import { AVATARS } from './constants';

type View = 'dashboard' | 'my-tasks' | 'members' | 'completed-tasks';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Effect for handling authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
        setAuthLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const membersCollectionRef = collection(db, 'members');
        const memberDocRef = doc(db, 'members', user.uid);
        
        // Check if there are any owners in the system.
        const membersSnapshot = await getDocs(membersCollectionRef);
        const owners = membersSnapshot.docs.filter(doc => doc.data().role === Role.Owner && !doc.data().isDeleted);
        const memberDocSnap = await getDoc(memberDocRef);

        if (memberDocSnap.exists()) {
          const userProfileData = memberDocSnap.data();
          if (userProfileData.isDeleted) {
            signOut(auth);
            setCurrentUser(null);
            setAuthLoading(false);
            return;
          }

          const userProfile = { id: memberDocSnap.id, ...userProfileData } as Member;
          
          // Fix: If this is the initial owner and their name is their email, update it.
          if (userProfile.email === 'n.elwakil@comfnet.com' && userProfile.name === userProfile.email) {
            await updateDoc(memberDocRef, { name: 'Noureldeen Elwakil' });
            userProfile.name = 'Noureldeen Elwakil'; // Update the object in memory as well.
          }

          // User exists. Check if they should be promoted.
          if (owners.length === 0 && userProfile.role !== Role.Owner) {
              // If there are no owners, promote this user to Owner. This is a self-healing mechanism.
              await updateDoc(memberDocRef, { role: Role.Owner });
              userProfile.role = Role.Owner;
          }
          setCurrentUser(userProfile);
        } else {
          // User does not exist. Create a new profile.
          const isInitialOwner = user.email === 'n.elwakil@comfnet.com';
          // Role is Owner if there are no existing owners, otherwise Member.
          const newMemberProfile: Omit<Member, 'id'> = {
              name: isInitialOwner ? 'Noureldeen Elwakil' : (user.displayName || user.email || 'New User'),
              email: user.email!.toLowerCase(),
              avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
              role: owners.length === 0 ? Role.Owner : Role.Member,
          };
          await setDoc(memberDocRef, newMemberProfile);
          setCurrentUser({ id: user.uid, ...newMemberProfile } as Member);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect for fetching data only when a user is authenticated
  useEffect(() => {
    if (!currentUser || !db) {
      // Clear data on logout or if db is not available
      setMembers([]);
      setTasks([]);
      setTeams([]);
      return;
    }

    // Set up Firestore listeners now that we have an authenticated user
    const unsubscribeMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const membersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
    });

    const unsubscribeTasks = onSnapshot(query(collection(db, 'tasks'), orderBy('dueDate', 'asc')), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    });
    
    const unsubscribeTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeams(teamsData);
    });

    // Cleanup listeners on logout or component unmount
    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeTeams();
    };
  }, [currentUser, db]); // Rerun this effect if the user or db connection changes

  // Effect for fetching comments for a selected task
  useEffect(() => {
    if (selectedTaskId && db) {
      const commentsQuery = query(collection(db, 'tasks', selectedTaskId, 'comments'), orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
        } as Comment));
        setComments(commentsData);
      });
      return () => unsubscribe();
    } else {
      setComments([]);
    }
  }, [selectedTaskId, db]);

  const handleLogin = async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
    if (!auth || !db) return { success: false, error: 'Firebase not configured.'};
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const memberDocRef = doc(db, 'members', user.uid);
      const memberDocSnap = await getDoc(memberDocRef);

      if (memberDocSnap.exists() && memberDocSnap.data().isDeleted) {
        await signOut(auth);
        return { success: false, error: 'This account has been deactivated.' };
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!db) return;
    const taskRef = doc(db, 'tasks', taskId);
    const finalUpdates: { [key: string]: any } = { ...updates };
    
    const originalTask = tasks.find(t => t.id === taskId);
    if (updates.status === Status.Done && originalTask?.status !== Status.Done) {
        finalUpdates.completedById = currentUser?.id;
        finalUpdates.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== Status.Done) {
        finalUpdates.completedById = deleteField();
        finalUpdates.completedAt = deleteField();
    }
    await updateDoc(taskRef, finalUpdates);
  };
  
  const handleAddComment = async (taskId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    if (!db) return;
    const commentsColRef = collection(db, 'tasks', taskId, 'comments');
    await addDoc(commentsColRef, { ...comment, timestamp: serverTimestamp() });
  };

  const handleUpdateMember = async (memberId: string, updates: Partial<Member>) => {
    if (!db) return;

    if (updates.role) {
      const memberToUpdate = members.find(m => m.id === memberId);
      if (memberToUpdate && memberToUpdate.role === Role.Owner && updates.role !== Role.Owner) {
        const activeOwners = members.filter(m => m.role === Role.Owner && !m.isDeleted);
        if (activeOwners.length <= 1) {
          alert("Action failed: Cannot demote the last owner. Please assign a new owner before changing this member's role.");
          return;
        }
      }
    }

    const memberRef = doc(db, 'members', memberId);
    await updateDoc(memberRef, updates);
    setEditingMemberId(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!db) return;
    const memberToRemove = members.find(m => m.id === memberId);
    if (!memberToRemove) return;

    if (memberToRemove.role === Role.Owner) {
        const activeOwners = members.filter(m => m.role === Role.Owner && !m.isDeleted);
        if (activeOwners.length <= 1) {
            alert("Action failed: Cannot remove the last owner. Please assign a new owner before removing this member.");
            return;
        }
    }
    
    if (!window.confirm(`Are you sure you want to remove ${memberToRemove.name}? Their account will be deactivated, but they will remain on any assigned tasks.`)) {
        return;
    }
    try {
        const memberRef = doc(db, 'members', memberId);
        await updateDoc(memberRef, { isDeleted: true });
    } catch (error) {
        console.error("Error removing member:", error);
        alert("Failed to remove the member. Please check the console for more details.");
    }
  };
  
  const handleRestoreMember = async (memberId: string) => {
    if (!db) return;
    const memberRef = doc(db, 'members', memberId);
    await updateDoc(memberRef, { isDeleted: false });
  };
  
  const handleToggleReaction = async (taskId: string, commentId: string, emoji: string) => {
    if (!db || !currentUser) return;
    const commentRef = doc(db, 'tasks', taskId, 'comments', commentId);
    
    const commentSnap = await getDoc(commentRef);
    if (!commentSnap.exists()) return;

    const commentData = commentSnap.data() as Comment;
    const reactions = { ...(commentData.reactions || {}) }; 
    const userId = currentUser.id;

    const hasReactedWithThisEmoji = reactions[emoji]?.includes(userId);

    for (const key in reactions) {
        reactions[key] = reactions[key]?.filter(id => id !== userId);
        if (reactions[key]?.length === 0) {
            delete reactions[key];
        }
    }

    if (!hasReactedWithThisEmoji) {
        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }
        reactions[emoji].push(userId);
    }

    await updateDoc(commentRef, { reactions });
  };
  
  const handleAddTask = async (taskData: { title: string; description: string; assignedToIds: string[]; dueDate: string; color: string; teamId: string; }) => {
    if (!db) return;
    const newTask: Omit<Task, 'id'> = {
      teamId: taskData.teamId,
      title: taskData.title,
      description: taskData.description,
      assignedToIds: taskData.assignedToIds,
      status: Status.ToDo,
      dueDate: taskData.dueDate,
      color: taskData.color,
    };
    await addDoc(collection(db, 'tasks'), newTask);
  };
  
  const handleAddMember = async (name: string, email: string, password: string): Promise<{success: boolean, error?: string}> => {
    if (!isFirebaseConfigured || !db || !firebaseConfig) {
        return { success: false, error: "Firebase not initialized." };
    }

    const membersCollectionRef = collection(db, 'members');
    const q = query(membersCollectionRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const existingMember = querySnapshot.docs[0].data() as Member;
        if (existingMember.isDeleted) {
            return { success: false, error: "This user was previously removed. Please restore them from the 'Removed Members' list." };
        }
        return { success: false, error: "A member with this email already exists." };
    }

    const tempAppName = `temp-user-creation-${Date.now()}`;
    let tempApp: FirebaseApp | null = null;

    try {
        tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);

        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
        const user = userCredential.user;

        const newMemberProfile: Omit<Member, 'id'> = {
            name,
            email: email.toLowerCase(),
            avatarUrl: AVATARS[members.length % AVATARS.length],
            role: Role.Member,
        };
        await setDoc(doc(db, 'members', user.uid), newMemberProfile);

        await signOut(tempAuth);

        return { success: true };

    } catch (error: any) {
        console.error("Error adding member:", error);
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use by another account.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    } finally {
        if (tempApp) {
            await deleteApp(tempApp);
        }
    }
  };

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [selectedTaskId, tasks]);

  const memberToEdit = useMemo(() => {
    if (!editingMemberId) return null;
    return members.find(m => m.id === editingMemberId) || null;
  }, [editingMemberId, members]);

  const activeMembers = useMemo(() => members.filter(m => !m.isDeleted), [members]);

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeView) {
      case 'dashboard':
        return <DashboardView tasks={tasks} teams={teams} members={activeMembers} />;
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
                    members={members} // Pass all members so completed tasks can show names of removed users
                    onSelectTask={setSelectedTaskId}
                />;
      case 'members':
        if (currentUser.role !== Role.Owner) {
            setActiveView('dashboard');
            return <DashboardView tasks={tasks} teams={teams} members={activeMembers} />;
        }
        return <MembersView 
          members={members}
          currentUser={currentUser}
          onEditMember={setEditingMemberId}
          onAddMemberClick={() => setIsAddMemberModalOpen(true)}
          onRemoveMember={handleRemoveMember}
          onRestoreMember={handleRestoreMember}
        />;
      default:
        return <DashboardView tasks={tasks} teams={teams} members={activeMembers} />;
    }
  };

  if (!isFirebaseConfigured) {
    return <MissingFirebaseConfig />;
  }
  
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">Authenticating...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  return (
    <div className="min-h-screen bg-slate-100">
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
       {isAddTaskModalOpen && (
        <AddTaskModal 
          members={activeMembers}
          teams={teams}
          currentUser={currentUser}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}
       {isAddMemberModalOpen && (
        <AddMemberModal
          onClose={() => setIsAddMemberModalOpen(false)}
          onAddMember={handleAddMember}
        />
       )}
      {selectedTask && currentUser && (
        <TaskDetailModal
          task={selectedTask}
          comments={comments}
          members={members} // Pass all members so comments can show names of removed users
          currentUser={currentUser}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onAddComment={handleAddComment}
          onToggleReaction={handleToggleReaction}
        />
      )}
       {/* Fix: Corrected typo from `memberToE dit` to `memberToEdit` */}
       {memberToEdit && currentUser && (
        <MemberEditModal
          member={memberToEdit}
          currentUser={currentUser}
          onClose={() => setEditingMemberId(null)}
          onUpdateMember={handleUpdateMember}
        />
      )}
    </div>
  );
};

export default App;