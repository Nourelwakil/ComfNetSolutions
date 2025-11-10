import React, { useState, useRef, useEffect } from 'react';
import { Task, Comment, Member, Status, Role } from '../types';
import { CalendarIcon, UserIcon, TrashIcon, XCircleIcon, PencilIcon, SmileIcon } from './icons';
import StatusBadge from './StatusBadge';
import { TASK_COLORS } from '../constants';

interface TaskDetailModalProps {
  task: Task;
  comments: Comment[];
  members: Member[];
  currentUser: Member;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  onAddComment: (taskId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onToggleReaction: (taskId: string, commentId: string, emoji: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  comments,
  members,
  currentUser,
  onClose,
  onUpdateTask,
  onAddComment,
  onToggleReaction,
}) => {
  const [newComment, setNewComment] = useState('');
  const newCommentRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isList, setIsList] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedAssignedToIds, setEditedAssignedToIds] = useState(task.assignedToIds);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate);

  const [reactingToCommentId, setReactingToCommentId] = useState<string | null>(null);

  useEffect(() => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedAssignedToIds(task.assignedToIds);
    setEditedDueDate(task.dueDate);
  }, [task]);


  const colorClass = TASK_COLORS.find(c => c.name === task.color)?.className || 'border-slate-400';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, {
        authorId: currentUser.id,
        text: newComment.trim(),
      });
      setNewComment('');
      if (newCommentRef.current) {
        newCommentRef.current.innerHTML = '';
      }
    }
  };
  
  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsList(document.queryCommandState('insertUnorderedList'));
  };

  const applyCommentStyle = (command: string) => {
    document.execCommand(command, false);
    if(newCommentRef.current) {
        newCommentRef.current.focus();
        setNewComment(newCommentRef.current.innerHTML);
        updateToolbarState();
    }
  };
  
  const canPerformSensitiveActions = currentUser.role === Role.Owner;
  const canComment = canPerformSensitiveActions || task.assignedToIds.includes(currentUser.id);

  const handleAssigneeChange = (memberId: string) => {
    setEditedAssignedToIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = () => {
    const updates = {
      title: editedTitle,
      description: editedDescription,
      assignedToIds: editedAssignedToIds,
      dueDate: editedDueDate,
    };
    onUpdateTask(task.id, updates);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedAssignedToIds(task.assignedToIds);
    setEditedDueDate(task.dueDate);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border-t-8 ${colorClass}`}>
        <div className="p-6 flex justify-between items-start border-b">
          <div>
            {isEditing ? (
              <input 
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold text-slate-800 border-b-2 border-slate-300 focus:border-brand-primary outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-800">{task.title}</h2>
            )}
            <div className="mt-2">
              <StatusBadge status={task.status} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
             {canPerformSensitiveActions && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-brand-primary" title="Edit Task">
                    <PencilIcon className="w-6 h-6" />
                </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XCircleIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
              {isEditing ? (
                 <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md bg-white text-slate-900"
                    rows={5}
                />
              ) : (
                <div className="text-slate-600 whitespace-pre-wrap prose" dangerouslySetInnerHTML={{ __html: task.description }}></div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center"><UserIcon className="w-4 h-4 mr-2" /> Assignees</h3>
                 {isEditing ? (
                    <div className="border border-slate-300 rounded-md p-2 max-h-32 overflow-y-auto">
                        {members.filter(m => !m.isDeleted).map(member => (
                        <div key={member.id} className="flex items-center">
                            <input
                            type="checkbox"
                            id={`assignee-edit-${member.id}`}
                            checked={editedAssignedToIds.includes(member.id)}
                            onChange={() => handleAssigneeChange(member.id)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <label htmlFor={`assignee-edit-${member.id}`} className="ml-2 block text-sm text-slate-900">{member.name}</label>
                        </div>
                        ))}
                    </div>
                 ) : (
                    <div className="flex flex-wrap gap-2">
                        {task.assignedToIds.map(id => {
                            const member = members.find(m => m.id === id);
                            if (!member) return null;
                            return (
                                <div key={id} className={`flex items-center space-x-2 bg-slate-100 p-1 rounded-full pr-2 ${member.isDeleted ? 'opacity-60' : ''}`} title={member.name}>
                                    <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full" />
                                    <span className={`text-sm text-slate-600 ${member.isDeleted ? 'line-through' : ''}`}>{member.name.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                        {task.assignedToIds.length === 0 && <span className="text-slate-600">Unassigned</span>}
                    </div>
                 )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center"><CalendarIcon className="w-4 h-4 mr-2" /> Due Date</h3>
                {isEditing ? (
                     <input type="date" value={editedDueDate} onChange={(e) => setEditedDueDate(e.target.value)} className="w-full p-2 border rounded-md bg-white text-slate-900" required />
                ) : (
                    <p className="text-slate-600">{new Date(task.dueDate).toLocaleString()}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Status</h3>
                <select
                  value={task.status}
                  onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Status })}
                  disabled={!canPerformSensitiveActions && !task.assignedToIds.includes(currentUser.id)}
                  className="w-full p-2 border rounded-md bg-white disabled:bg-slate-100 text-slate-900"
                >
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-slate-700 mb-4">Comments</h3>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
              {comments.map(comment => {
                const author = members.find(m => m.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <img src={author?.avatarUrl} alt={author?.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 bg-slate-100 p-3 rounded-lg">
                      <p className="font-semibold text-slate-800 text-sm">{author?.name}</p>
                      <div className="text-slate-600 text-sm prose" dangerouslySetInnerHTML={{ __html: comment.text }}></div>
                       <div className="flex items-center space-x-2 mt-2">
                          {comment.reactions && Object.entries(comment.reactions).map(([emoji, userIds]) => (
                            // Fix: Add Array.isArray check to safely access properties on userIds, which could be of an unknown type from Firestore.
                            Array.isArray(userIds) && userIds.length > 0 && (
                              <button
                                key={emoji}
                                onClick={() => onToggleReaction(task.id, comment.id, emoji)}
                                className={`px-2 py-0.5 border rounded-full text-xs flex items-center space-x-1 ${userIds.includes(currentUser.id) ? 'bg-brand-secondary/30 border-brand-secondary' : 'bg-slate-200 border-slate-300'}`}
                                title={userIds.map(id => members.find(m => m.id === id)?.name).join(', ')}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            )
                          ))}
                          <div className="relative">
                            <button onClick={() => setReactingToCommentId(reactingToCommentId === comment.id ? null : comment.id)} className="p-1 rounded-full hover:bg-slate-200">
                              <SmileIcon className="w-4 h-4 text-slate-500 hover:text-brand-primary" />
                            </button>
                            {reactingToCommentId === comment.id && (
                              <div className="absolute bottom-full mb-1 left-0 bg-white shadow-lg rounded-full p-1 flex space-x-1 border z-10">
                                {['👍', '❤️', '🎉', '🤔', '😂'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      onToggleReaction(task.id, comment.id, emoji);
                                      setReactingToCommentId(null);
                                    }}
                                    className="text-xl p-1 rounded-full hover:bg-slate-200 transition-transform duration-100 ease-in-out hover:scale-125"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && <p className="text-slate-500 text-sm">No comments yet.</p>}
            </div>
             {canComment ? (
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <div className="border border-slate-300 rounded-md">
                   <div className="flex items-center p-1 border-b bg-slate-50 space-x-1">
                        <button type="button" onClick={() => applyCommentStyle('bold')} className={`p-1 rounded font-bold ${isBold ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>B</button>
                        <button type="button" onClick={() => applyCommentStyle('italic')} className={`p-1 rounded italic ${isItalic ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>I</button>
                        <button type="button" onClick={() => applyCommentStyle('insertUnorderedList')} className={`p-1 rounded ${isList ? 'bg-slate-300' : 'hover:bg-slate-200'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </button>
                    </div>
                    <div
                        ref={newCommentRef}
                        onInput={(e) => setNewComment(e.currentTarget.innerHTML)}
                        onKeyUp={updateToolbarState}
                        onMouseUp={updateToolbarState}
                        contentEditable
                        className="w-full min-h-[60px] p-2 bg-white text-slate-900 focus:outline-none"
                    />
                </div>
                <div className="flex justify-end mt-2">
                    <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark">Send</button>
                </div>
              </form>
            ) : (
                 <p className="mt-4 text-sm text-center text-slate-500 bg-slate-100 p-3 rounded-md">You must be assigned to this task to comment.</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button onClick={handleCancelEdit} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-brand-primary-dark">Save Changes</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;