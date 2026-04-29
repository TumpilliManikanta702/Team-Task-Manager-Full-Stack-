import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Folder, Users, ArrowRight } from 'lucide-react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // For Admin creating projects
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Bonus: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        user?.role === 'Admin' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description, members: selectedMembers });
      toast.success('Project created');
      setShowModal(false);
      setName('');
      setDescription('');
      setSelectedMembers([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  if (loading) return <div className="text-slate-400">Loading projects...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage and track all your team projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage).map((project) => (
          <div key={project._id} className="card group hover:border-primary/50 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Folder className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                {project.tasks?.length || 0} Tasks
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.name}</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-2">
              {project.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <Link 
                to={`/projects/${project._id}`}
                className="text-primary hover:text-indigo-400 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full card text-center py-12">
            <Folder className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No projects found</h3>
            <p className="text-slate-500 text-sm mt-1">Get started by creating a new project.</p>
          </div>
        )}
      </div>

      {projects.length > projectsPerPage && (
        <div className="flex justify-center mt-8 gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-400">
            Page {currentPage} of {Math.ceil(projects.length / projectsPerPage)}
          </span>
          <button 
            disabled={currentPage === Math.ceil(projects.length / projectsPerPage)}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assign Members</label>
                <div className="max-h-32 overflow-y-auto space-y-2 border border-slate-700 p-2 rounded-md bg-slate-800">
                  {users.filter(u => u._id !== user._id).map((u) => (
                    <label key={u._id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary"
                        checked={selectedMembers.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u._id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                          }
                        }}
                      />
                      {u.name} ({u.email})
                    </label>
                  ))}
                  {users.length <= 1 && <span className="text-xs text-slate-500">No other users found.</span>}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
