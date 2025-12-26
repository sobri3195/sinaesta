import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  UserCircle,
  Plus,
  Menu,
  History,
  Layers,
  Activity,
  FileText,
  ClipboardCheck,
  Book,
  Users,
  School,
  Target,
  CheckCircle,
  Layout,
  MessageSquare,
  BrainCircuit,
  TrendingUp,
  Zap,
  BarChart2,
  Map,
  ShieldCheck,
  Timer,
  Upload
} from 'lucide-react';
import { SPECIALTIES, UserRole } from '../types';
import { useBranding } from '../providers/BrandingProvider';
import { useUser } from '../providers/UserProvider';

const NavButton = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
        isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
      }`
    }
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </NavLink>
);

const AppShell: React.FC = () => {
  const { logoUrl, setLogoUrl } = useBranding();
  const { user, switchRole, updateSpecialty, logout } = useUser();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSpecialtySelector, setShowSpecialtySelector] = useState(false);

  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PROGRAM_ADMIN || user.role === UserRole.TEACHER;
  const isMentor = user.role === UserRole.TEACHER || user.role === UserRole.PROGRAM_ADMIN;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (ev) => {
        if (ev.target?.result) {
          const result = ev.target.result as string;

          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            const aspectRatio = (width / height).toFixed(2);

            alert(`Logo Analyzed!\nDimensions: ${width}x${height}px\nAspect Ratio: ${aspectRatio}\nStatus: Logo successfully updated.`);
            setLogoUrl(result);
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    setShowSpecialtySelector(false);
    setIsSidebarOpen(false);
    navigate('/');
  };

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchRole(targetRole);
    setIsSidebarOpen(false);
    setShowSpecialtySelector(false);
    if (targetRole === UserRole.STUDENT) {
      navigate('/dashboard');
      return;
    }
    navigate('/admin');
  };

  const updateSpecialtyAndNavigate = (specialty: (typeof SPECIALTIES)[number]) => {
    updateSpecialty(specialty);
    setShowSpecialtySelector(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={closeSidebar} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 sm:h-20 flex items-center justify-center border-b border-gray-100 bg-white relative group px-4 sm:px-6">
          <img src={logoUrl} alt="Sinaesta Logo" className="h-8 sm:h-10 w-auto object-contain transition-all" />
          {isAdmin && (
            <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold gap-2">
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              <Upload size={14} /> Upload & Analyze Logo
              <span className="text-[10px] font-normal text-gray-300">Click to change</span>
            </label>
          )}
        </div>

        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {user.role === UserRole.STUDENT && (
            <>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mb-2">
                Study ({user.targetSpecialty})
              </div>
              <NavButton to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavButton to="/microlearning" icon={<Zap size={20} />} label="Microlearning" />
              <NavButton to="/flashcards" icon={<Layers size={20} />} label="Flashcards" />
              <NavButton to="/spot-dx" icon={<Timer size={20} />} label="Spot Dx Sprint" />
              <NavButton to="/clinical-reasoning" icon={<BrainCircuit size={20} />} label="Clinical Reasoning" />
              <NavButton to="/remedial" icon={<TrendingUp size={20} />} label="Remedial Path" />
              <NavButton to="/case-discussion" icon={<MessageSquare size={20} />} label="Diskusi Kasus" />
              <NavButton to="/mentors" icon={<Users size={20} />} label="Find Mentor" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Clinical Skills
              </div>
              <NavButton to="/osce" icon={<ClipboardCheck size={20} />} label="Simulasi OSCE" />
              <NavButton to="/logbook" icon={<Book size={20} />} label="E-Logbook" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Performance
              </div>
              <NavButton to="/benchmark" icon={<BarChart2 size={20} />} label="Benchmark" />
              <NavButton to="/history" icon={<History size={20} />} label="Exam History" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Preferences
              </div>
              <NavButton to="/settings" icon={<Settings size={20} />} label="Settings" />
            </>
          )}

          {isAdmin && (
            <>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mb-2">
                Program Management
              </div>
              {isMentor && <NavButton to="/mentor" icon={<Activity size={20} />} label="Mentor Dashboard" />}
              <NavButton to="/admin" icon={<LayoutDashboard size={20} />} label="Bank Soal" />
              <NavButton to="/admin/posts" icon={<FileText size={20} />} label="Postingan Berita" />
              <NavButton to="/admin/create-exam" icon={<Plus size={20} />} label="Input Soal Baru" />
              <NavButton to="/admin/vignette" icon={<Layout size={20} />} label="Vignette Builder" />
              <NavButton to="/admin/review" icon={<CheckCircle size={20} />} label="QC & Review" />
              <NavButton to="/admin/osce" icon={<ClipboardCheck size={20} />} label="OSCE Manager" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Clinical & Logs
              </div>
              <NavButton to="/logbook" icon={<Book size={20} />} label="Review Logbook" />
              <NavButton to="/case-discussion" icon={<MessageSquare size={20} />} label="Forum Diskusi" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Curriculum & Reports
              </div>
              <NavButton to="/admin/blueprint" icon={<Target size={20} />} label="Blueprint / Matrix" />
              <NavButton to="/admin/knowledge" icon={<BookOpen size={20} />} label="Referensi & Guideline" />
              <NavButton to="/admin/high-yield" icon={<Map size={20} />} label="High-Yield Map" />
              <NavButton to="/admin/quality" icon={<ShieldCheck size={20} />} label="Quality Score (Q-QS)" />

              {user.role === UserRole.PROGRAM_ADMIN && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50"
                >
                  <BarChart2 size={20} /> Analytics Report
                </button>
              )}

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Organization
              </div>
              <NavButton to="/admin/users" icon={<Users size={20} />} label="User Management" />
              <NavButton to="/admin/cohorts" icon={<School size={20} />} label="Batch / Cohort" />

              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">
                Preferences
              </div>
              <NavButton to="/settings" icon={<Settings size={20} />} label="Settings" />
            </>
          )}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-100 relative">
          <div
            className="flex items-center gap-2 sm:gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => setShowSpecialtySelector(!showSpecialtySelector)}
          >
            <img src={user.avatar} alt="User" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.targetSpecialty || user.role}</p>
            </div>
            <Settings size={14} className="text-gray-400 sm:w-4 sm:h-4 flex-shrink-0" />
          </div>

          {showSpecialtySelector && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in slide-in-from-bottom-2">
              <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wide">Target Specialty</div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => updateSpecialtyAndNavigate(spec)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-indigo-50 hover:text-indigo-700 ${
                      user.targetSpecialty === spec ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase">Switch Role (Bypass)</div>
                <button
                  onClick={() => handleRoleSwitch(UserRole.STUDENT)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  Student
                </button>
                <button
                  onClick={() => handleRoleSwitch(UserRole.TEACHER)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  Mentor/Teacher
                </button>
                <button
                  onClick={() => handleRoleSwitch(UserRole.PROGRAM_ADMIN)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  Program Admin
                </button>
                <button
                  onClick={() => handleRoleSwitch(UserRole.SUPER_ADMIN)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  Super Admin
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-1.5 rounded text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut size={14} /> Keluar Aplikasi
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex lg:hidden items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={22} className="sm:w-6 sm:h-6" />
            </button>
            <img src={logoUrl} alt="Sinaesta" className="h-7 sm:h-8 w-auto object-contain" />
          </div>
          <UserCircle size={24} className="text-gray-400 sm:w-7 sm:h-7" />
        </header>

        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
