import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar could go here if needed, but sidebar is usually enough for this dashboard */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
           <div className="max-w-6xl mx-auto">
             <Outlet />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
