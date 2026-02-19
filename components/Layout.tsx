
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  RefreshCw,
  Database,
  Cloud
} from 'lucide-react';
import { ShopeeAccount } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  accounts: ShopeeAccount[];
  isSyncing?: boolean;
  onRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, accounts, isSyncing, onRefresh }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

  const navItems = [
    { name: 'หาสินค้า', path: '/products' },
    { name: 'แฟลชเซลล์', path: '/flash-sale' },
    { name: 'เช็คค่าคอม', path: '/check-commission' },
    { name: 'เช็ควิดีโอ', path: '/check-video', badge: 'NEW' },
    { name: 'ดึงสินค้า (ไลฟ์)', path: '/pull-live' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-700 bg-[#F9FBFF]">
      {/* Top Navigation */}
      <header className="h-20 bg-white border-b flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#5340FF] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">S</div>
            <span className="font-bold text-2xl tracking-tight text-[#5340FF] uppercase">Shopee Dashboard</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <span
                key={item.path}
                className="px-4 py-2 text-[13px] font-semibold text-gray-300 cursor-not-allowed transition-colors relative flex items-center gap-1"
              >
                {item.name}
              </span>
            ))}

            <div className="relative ml-2">
              <button 
                onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                  location.pathname.includes('dashboard') || location.pathname.includes('affiliate') || location.pathname.includes('cookie')
                  ? 'bg-[#EBF1FF] text-[#5340FF]' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                แดชบอร์ด
                <ChevronDown size={14} />
              </button>
              
              {isDashboardMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                  <Link to="/dashboard-live" className="block px-4 py-3 text-sm font-medium hover:bg-blue-50 text-gray-600 hover:text-[#5340FF]" onClick={() => setIsDashboardMenuOpen(false)}>รายงานไลฟ์</Link>
                  <Link to="/affiliate" className="block px-4 py-3 text-sm font-medium hover:bg-blue-50 text-gray-600 hover:text-[#5340FF]" onClick={() => setIsDashboardMenuOpen(false)}>รายงานค่าคอม</Link>
                  <Link to="/cookie-manager" className="block px-4 py-3 text-sm font-medium hover:bg-blue-50 text-gray-600 hover:text-[#5340FF]" onClick={() => setIsDashboardMenuOpen(false)}>จัดการคุกกี้</Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100">
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                   {isSyncing ? (
                     <RefreshCw size={12} className="text-[#5340FF] animate-spin" />
                   ) : (
                     <Cloud size={12} className="text-emerald-500" />
                   )}
                   <span className={`text-[9px] font-black uppercase tracking-widest ${isSyncing ? 'text-[#5340FF]' : 'text-emerald-500'}`}>
                     {isSyncing ? 'Syncing...' : 'Cloud Connected'}
                   </span>
                </div>
                <p className="text-[11px] font-black text-gray-700 uppercase">Database Online</p>
             </div>
             <button 
               onClick={onRefresh}
               className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#5340FF] hover:border-blue-100 transition-all shadow-sm"
               title="Refresh Data"
             >
               <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <button className="xl:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 xl:px-12">
        {children}
      </main>
      
      <footer className="py-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">
        © 2025 <span className="text-[#5340FF]">SHOPEE DASHBOARD</span> • PRIVATE CLOUD DATABASE
      </footer>
    </div>
  );
};

export default Layout;
