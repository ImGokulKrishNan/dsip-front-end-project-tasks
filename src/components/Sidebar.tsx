
import React from 'react';
import { Icons } from '../constants';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  setView: (v: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView }) => {
  const menuItems = [
    { label: 'Dashboard', icon: <Icons.TrendUp />, view: 'DASHBOARD' as AppView },
    { label: 'Activate Stock Engine', icon: <Icons.Plus />, view: 'ADD_STOCK' as AppView },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col border-r border-slate-800">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <span className="text-white font-bold text-xl tracking-tight">SmartSIP</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setView(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeView === item.view 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="p-4 bg-slate-800/50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">Auto-Optimize On</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
