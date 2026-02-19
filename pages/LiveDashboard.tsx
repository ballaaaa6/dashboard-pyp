
import React from 'react';
import { 
  Video, 
  ShoppingBag, 
  CircleDollarSign, 
  RefreshCw, 
  Info,
  ExternalLink,
  MousePointer2,
  MoreVertical
} from 'lucide-react';
import { ShopeeAccount } from '../types';

interface LiveDashboardProps {
  accounts: ShopeeAccount[];
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({ accounts }) => {
  // In a real app, these would be fetched using the cookies
  const totalSales = 0;
  const totalOrders = 0;

  return (
    <div className="space-y-10">
      {/* Alert info block */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-blue-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-full text-blue-500">
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg leading-tight">Live Dashboard</h3>
              <p className="text-blue-500 text-sm font-medium">ข้อมูลจะโหลดใหม่อัตโนมัติทุกๆ <span className="font-bold">5 นาที</span></p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white border border-blue-200 px-6 py-2.5 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Live Sessions</p>
            <h4 className="text-5xl font-black text-[#1E293B]">0 / {accounts.length}</h4>
          </div>
          <div className="w-16 h-16 bg-[#F0FBFF] rounded-[24px] flex items-center justify-center text-[#4CC5EB]">
            <Video size={32} fill="currentColor" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Orders (LIVE)</p>
            <h4 className="text-5xl font-black text-[#1E293B]">{totalOrders}</h4>
          </div>
          <div className="w-16 h-16 bg-[#FFF2F2] rounded-[24px] flex items-center justify-center text-[#FF8585]">
            <ShoppingBag size={32} fill="currentColor" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Sales (LIVE)</p>
            <h4 className="text-5xl font-black text-[#1E293B]">฿ {totalSales.toFixed(2)}</h4>
          </div>
          <div className="w-16 h-16 bg-[#EFFFF6] rounded-[24px] flex items-center justify-center text-[#3ED383]">
            <CircleDollarSign size={32} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-6 w-12 text-center">#</th>
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Session</th>
                <th className="px-8 py-6">Live Info</th>
                <th className="px-8 py-6">Start Time</th>
                <th className="px-8 py-6">Engagement</th>
                <th className="px-8 py-6">Performance</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                         <Video size={40} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 font-bold">ยังไม่มีบัญชีที่ติดตาม</p>
                        <p className="text-gray-300 text-sm">กรุณาเพิ่มคุกกี้ในเมนู "จัดการคุกกี้" เพื่อเริ่มดึงข้อมูล</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((account, index) => (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-8 text-center text-gray-400 font-bold text-xs">{index + 1}</td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-[#1E293B] text-sm">{account.note} (r0)</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{account.level || 'Lv ? • N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-emerald-500 font-black text-sm cursor-pointer hover:underline flex items-center gap-1">
                        -
                        <ExternalLink size={10} />
                      </span>
                    </td>
                    <td className="px-8 py-8 max-w-[220px]">
                      <div className="flex flex-col">
                        <span className="font-black text-[#1E293B] text-sm truncate">ไม่มีข้อมูลการไลฟ์</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <ShoppingBag size={10} /> - items
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-600 text-sm">-</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <RefreshCw size={10} /> -
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MousePointer2 size={12} className="text-blue-400" />
                          <span className="font-black text-xs">0 clicks</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ShoppingBag size={12} className="text-orange-400" />
                          <span className="font-black text-xs">0 added</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-[#1E293B] tracking-tight">฿ 0.00</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">0 orders</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center justify-center gap-2">
                        <span className="bg-[#F1F5F9] text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                          OFFLINE
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
