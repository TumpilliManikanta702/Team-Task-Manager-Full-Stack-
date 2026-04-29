import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, ListTodo, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/me');
        const fetchedTasks = res.data;
        setTasks(fetchedTasks);
        
        // Bonus: Notifications for Overdue tasks
        const today = new Date();
        const overdueCount = fetchedTasks.filter(t => {
          if (t.status === 'Done' || !t.dueDate) return false;
          return new Date(t.dueDate) < today;
        }).length;
        
        if (overdueCount > 0) {
          toast(`You have ${overdueCount} overdue task(s)!`, {
            icon: '⚠️',
            duration: 5000,
            style: { border: '1px solid #ef4444' }
          });
        }
        
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <div className="text-slate-400 flex items-center justify-center h-64">Loading dashboard...</div>;

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const todo = tasks.filter(t => t.status === 'To Do').length;
  
  const today = new Date();
  const overdue = tasks.filter(t => {
    if (t.status === 'Done' || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  const stats = [
    { name: 'Total Tasks', value: total, icon: ListTodo, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Pending', value: inProgress + todo, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const chartData = [
    { name: 'To Do', count: todo, color: '#94a3b8' },
    { name: 'In Progress', count: inProgress, color: '#fbbf24' },
    { name: 'Done', count: completed, color: '#34d399' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-slate-400">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4 hover:border-slate-700 transition-colors">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card lg:col-span-2 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Task Progress</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff'}} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Recent Tasks</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {tasks.slice(0, 5).map(task => (
              <div key={task._id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        Overdue
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                      task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{task.description || 'No description'}</p>
                {task.projectId?.name && (
                   <div className="mt-3 text-xs text-primary bg-primary/10 inline-block px-2 py-1 rounded">
                     {task.projectId.name}
                   </div>
                )}
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-slate-500 text-sm mt-10">No tasks found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
