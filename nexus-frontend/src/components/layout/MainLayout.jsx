import { Outlet } from 'react-router-dom';
import FloatingDock from './FloatingDock';

export default function MainLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 text-dark-50">
      
      {/* Animated Aurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="bg-blob w-[50vw] h-[50vw] bg-aurora-purple/20 top-[-10%] left-[-10%] animate-blob"></div>
        <div className="bg-blob w-[40vw] h-[40vw] bg-aurora-blue/20 top-[40%] right-[-10%] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="bg-blob w-[60vw] h-[60vw] bg-aurora-cyan/10 bottom-[-20%] left-[20%] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-screen overflow-y-auto hide-scroll pb-32">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Outlet />
        </main>
      </div>

      {/* Navigation */}
      <FloatingDock />
      
    </div>
  );
}
