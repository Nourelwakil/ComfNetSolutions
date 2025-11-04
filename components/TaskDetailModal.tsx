import React, { useState, useRef } from 'react';
import { Task, Comment, Member, Status, Role } from '../types';
import { CalendarIcon, UserIcon, TrashIcon, XCircleIcon } from './icons';
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
  onRemoveTask: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  comments,
  members,
  currentUser,
  onClose,
  onUpdateTask,
  onAddComment,
  onRemoveTask,
}) => {
  const [newComment, setNewComment] = useState('');
  const newCommentRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isList, setIsList] = useState(false);

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


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border-t-8 ${colorClass}`}>
        <div className="p-6 flex justify-between items-start border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{task.title}</h2>
            <div className="mt-2">
              <StatusBadge status={task.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
              <div className="text-slate-600 whitespace-pre-wrap prose" dangerouslySetInnerHTML={{ __html: task.description }}></div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center"><UserIcon className="w-4 h-4 mr-2" /> Assignees</h3>
                 <div className="flex flex-wrap gap-2">
                    {task.assignedToIds.map(id => {
                        const member = members.find(m => m.id === id);
                        if (!member) return null;
                        return (
                            <div key={id} className="flex items-center space-x-2 bg-slate-100 p-1 rounded-full pr-2" title={member.name}>
                                <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full" />
                                <span className="text-sm text-slate-600">{member.name.split(' ')[0]}</span>
                            </div>
                        );
                    })}
                    {task.assignedToIds.length === 0 && <span className="text-slate-600">Unassigned</span>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center"><CalendarIcon className="w-4 h-4 mr-2" /> Due Date</h3>
                <p className="text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Status</h3>
                <select
                  value={task.status}
                  onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Status })}
                  disabled={!canPerformSensitiveActions}
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

        <div className="p-4 bg-slate-50 border-t flex justify-end">
          {canPerformSensitiveActions && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onRemoveTask(task.id);
                }
              }}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete Task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;