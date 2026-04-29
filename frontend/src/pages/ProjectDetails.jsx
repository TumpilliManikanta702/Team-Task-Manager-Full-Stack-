import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import clsx from 'clsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bonus: Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, taskRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        user?.role === 'Admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });
      fetchProjectAndTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Status updated');
      fetchProjectAndTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));
    
    // API update
    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
      toast.success('Task moved successfully');
    } catch (error) {
      toast.error('Failed to move task');
      fetchProjectAndTasks(); // revert on failure
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectAndTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <div className="text-slate-400">Loading project...</div>;
  if (!project) return <div className="text-slate-400">Project not found.</div>;

  const columns = [
    { title: 'To Do', status: 'To Do', icon: AlertCircle, color: 'text-slate-400' },
    { title: 'In Progress', status: 'In Progress', icon: Clock, color: 'text-amber-400' },
    { title: 'Done', status: 'Done', icon: CheckCircle2, color: 'text-emerald-400' }
  ];

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
          <p className="text-slate-400 max-w-2xl">{project.description}</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        )}
      </div>
      
      <div className="mb-6 relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
          {columns.map((col) => (
            <div key={col.status} className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
              <div className="p-4 border-b border-slate-800/50 flex items-center gap-2 bg-slate-900">
                <col.icon className={`w-5 h-5 ${col.color}`} />
                <h3 className="font-semibold text-slate-200">{col.title}</h3>
                <span className="ml-auto bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-medium">
                  {filteredTasks.filter(t => t.status === col.status).length}
                </span>
              </div>
              
              <Droppable droppableId={col.status}>
                {(provided) => (
                  <div 
                    className="flex-1 p-4 overflow-y-auto space-y-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {filteredTasks.filter(t => t.status === col.status).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={clsx(
                              "bg-slate-800 rounded-lg p-4 shadow-sm border group transition-colors",
                              snapshot.isDragging ? "border-primary" : "border-slate-700 hover:border-primary/50"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-slate-200 font-medium">{task.title}</h4>
                              {user?.role === 'Admin' && (
                                <button 
                                  onClick={() => deleteTask(task._id)}
                                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mb-4">{task.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex gap-2">
                                <span className={clsx(
                                  "text-[10px] font-bold uppercase px-2 py-1 rounded-sm",
                                  task.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                                  task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-emerald-500/10 text-emerald-400'
                                )}>
                                  {task.priority}
                                </span>
                                {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-sm bg-red-500/10 text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Overdue
                                  </span>
                                )}
                                {task.assignedTo && (
                                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded-sm line-clamp-1 max-w-[100px]">
                                    {task.assignedTo.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assign To</label>
                <select
                  className="input-field"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                  {users.filter(u => u._id === project?.admin?._id).map(adminUser => (
                     <option key={adminUser._id} value={adminUser._id}>{adminUser.name} (Admin)</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
