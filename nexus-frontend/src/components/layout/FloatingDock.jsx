import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiSearch, FiCompass, FiMessageSquare, FiHeart, FiPlus, FiUser, FiUsers } from 'react-icons/fi';

export default function FloatingDock() {
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Search', path: '/search', icon: FiSearch },
    { name: 'Create', path: '/create-post', icon: FiPlus, primary: true },
    { name: 'Messages', path: '/messages', icon: FiMessageSquare },
    { name: 'Campus', path: '/students', icon: FiUsers },
    { name: 'Profile', path: user ? `/profile/${user.username}` : '/login', icon: FiUser },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel rounded-full px-4 py-3 flex items-center gap-2 md:gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative group flex items-center justify-center rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'w-14 h-14 bg-gradient-to-r from-aurora-blue to-aurora-purple text-white shadow-[0_0_15px_rgba(0,210,255,0.4)] hover:scale-110' 
                    : 'w-12 h-12 text-dark-300 hover:text-white hover:bg-white/5 hover:-translate-y-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'text-2xl' : 'text-xl'} />
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 glass-panel px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white pointer-events-none">
                    {item.name}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
