import React, { useState } from 'react';
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
  const assignedTo = members.find(m => m.id === task.assignedToId);
  const colorClass = TASK_COLORS.find(c => c.name === task.color)?.className || 'border-slate-400';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, {
        authorId: currentUser.id,
        text: newComment.trim(),
      });
      setNewComment('');
    }
  };
  
  const canEdit = currentUser.role === Role.Owner || currentUser.id === task.assignedToId;

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
              <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center"><UserIcon className="w-4 h-4 mr-2" /> Assignee</h3>
                <div className="flex items-center space-x-2">
                  {assignedTo && <img src={assignedTo.avatarUrl} alt={assignedTo.name} className="w-8 h-8 rounded-full" />}
                  <span className="text-slate-600">{assignedTo?.name || 'Unassigned'}</span>
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
                  disabled={!canEdit}
                  className="w-full p-2 border rounded-md bg-white text-black disabled:bg-slate-100"
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
                      <p className="text-slate-600 text-sm">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && <p className="text-slate-500 text-sm">No comments yet.</p>}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-4 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow p-2 border rounded-md bg-white text-black"
              />
              <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark">Send</button>
            </form>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end">
          {canEdit && (
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