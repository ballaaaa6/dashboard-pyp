
import React from 'react';
import { 
  Calendar, 
  MonitorPlay,
  Video,
  ShoppingBag,
  CircleDollarSign,
  ChevronDown,
  Circle,
  BarChart2
} from 'lucide-react';
import { ShopeeAccount } from '../types';

interface AffiliateDashboardProps {
  accounts: ShopeeAccount[];
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ accounts }) => {
  // คำนวณข้อมูลเบื้องต้น (ในอนาคตส่วนนี้จะมาจากการดึงค่าจริงผ่านคุกกี้)
  const totalAccounts = accounts.length;
  const accountsWithCommission = totalAccounts > 0 ? 1 : 0; // Mock ไว้ก่อน 1 บัญชีถ้ามีข้อมูล
  const totalOrders = totalAccounts > 0 ? 1 : 0;
  const totalSales = totalAccounts > 0 ? 77.00 : 0.00;
  const totalComm = totalAccounts > 0 ? 7.70 : 0.00;

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      <div className="text-center">
        <h1 className="text-[44px] font-black text-[#1E293B] tracking-tight leading-none">Shopee Affiliate Dashboard</h1>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 w-fit mx-auto">
        <button className="px-10 py-3 bg-[#5340FF] text-white rounded-xl text-sm font-black transition-all">ทั้งหมด</button>
        <button className="px-10 py-3 text-gray-400 hover:text-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <MonitorPlay size={18} />
          Shopee Live
        </button>
        <button className="px-10 py-3 text-gray-400 hover:text-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Video size={18} />
          Shopee Video
        </button>
      </div>

      {/* Date Filter & Control */}
      <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="flex gap-2 h-fit">
           {['Last 7 Days', 'Last 15 Days', 'Last 30 Days'].map((label, i) => (
             <button key={label} className={`flex-1 py-3 px-1 text-[10px] font-black rounded-xl border transition-all ${i === 0 ? 'bg-[#EBF1FF] border-[#D1E1FF] text-[#5340FF]' : 'bg-white border-gray-100 text-gray-400'}`}>
               {label}
             </button>
           ))}
        </div>
        <div className="space-y-1">
           <label className="text-[10px] font-black text-[#5340FF] uppercase ml-1">Start Date</label>
           <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-600 shadow-sm">
             <span className="font-bold">17-02-2026</span>
             <Calendar size={16} className="text-blue-400" />
           </div>
        </div>
        <div className="space-y-1">
           <label className="text-[10px] font-black text-[#5340FF] uppercase ml-1">End Date</label>
           <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-600 shadow-sm">
             <span className="font-bold">17-02-2026</span>
             <Calendar size={16} className="text-blue-400" />
           </div>
        </div>
        <button className="py-4 bg-[#5340FF] hover:bg-[#4330EE] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest">
          <MonitorPlay size={18} />
          <span>โหลดข้อมูล</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 bg-[#F0FBFF] rounded-[24px] flex items-center justify-center text-[#4CC5EB]">
            <Video size={32} fill="currentColor" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">ช่อง(ที่มีค่าคอม) / จำนวนช่อง</p>
            <h4 className="text-4xl font-black text-[#1E293B] tracking-tighter">{accountsWithCommission} / {totalAccounts}</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 bg-[#F3F5FF] rounded-[24px] flex items-center justify-center text-[#5340FF]">
            <div className="bg-[#5340FF] w-7 h-9 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">คำสั่งซื้อ</p>
            <h4 className="text-4xl font-black text-[#1E293B] tracking-tighter">{totalOrders}</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 bg-[#F8F2FF] rounded-[24px] flex items-center justify-center text-[#A377FF]">
            <div className="w-9 h-9 bg-[#A377FF] rounded-full flex items-center justify-center shadow-sm">
               <CircleDollarSign size={20} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">ยอดขายรวม</p>
            <h4 className="text-4xl font-black text-[#1E293B] tracking-tighter">{totalSales.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 bg-[#EFFFF6] rounded-[24px] flex items-center justify-center text-[#3ED383]">
            <div className="w-9 h-9 bg-[#3ED383] rounded-full flex items-center justify-center shadow-sm">
               <Circle size={20} className="text-white fill-current" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">ค่าคอมมิชชั่น</p>
            <h4 className="text-4xl font-black text-[#1E293B] tracking-tighter">{totalComm.toFixed(2)}</h4>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm p-10 space-y-6">
        <h3 className="text-center font-black text-[#1E293B] uppercase tracking-[0.2em] text-sm">กราฟค่าคอมมิชชั่นรายวัน</h3>
        <div className="flex justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
           <div className="flex items-center gap-2">
             <div className="w-10 h-3 bg-[#6495ED] rounded-sm"></div>
             <span>Shopee Live (THB)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-10 h-3 bg-[#C796FF] rounded-sm"></div>
             <span>Shopee Video (THB)</span>
           </div>
        </div>
        
        <div className="h-64 w-full border-l border-b border-gray-100 relative mt-12 mb-8">
           {totalAccounts > 0 && (
             <div className="absolute left-[15%] bottom-0 w-[30%] h-[85%] bg-[#6495ED] opacity-90 rounded-t-sm"></div>
           )}
           <div className="absolute left-0 bottom-0 w-full h-full flex flex-col justify-between pointer-events-none">
              {[8, 7, 6, 5, 4, 3, 2, 1, 0].map(val => (
                <div key={val} className="flex items-center gap-4 w-full h-0">
                  <span className="text-[9px] text-gray-300 w-4 text-right">{val}</span>
                  <div className="flex-1 border-t border-gray-50"></div>
                </div>
              ))}
           </div>
           <div className="absolute -bottom-7 left-[30%] -translate-x-1/2 text-[10px] text-gray-400 font-bold">2026/02/17</div>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b">
                <th className="px-10 py-6 w-16">#</th>
                <th className="px-10 py-6">User</th>
                <th className="px-10 py-6 text-center">คลิก</th>
                <th className="px-10 py-6 text-center">คำสั่งซื้อ</th>
                <th className="px-10 py-6 text-center">ยอดขาย</th>
                <th className="px-10 py-6 text-center">ค่าคอมมิชชั่น</th>
                <th className="px-10 py-6 text-center">% คอม/ยอดขาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
               {accounts.length === 0 ? (
                 <tr>
                    <td colSpan={7} className="px-10 py-20 text-center text-gray-300 italic">
                      กรุณาเพิ่มคุกกี้เพื่อดูรายงาน
                    </td>
                 </tr>
               ) : (
                 accounts.map((acc, i) => (
                   <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-10 py-8 text-gray-400">{i + 1}</td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-black uppercase">
                             {acc.note.charAt(0)}
                           </div>
                           <div className="flex items-center gap-1 cursor-pointer group">
                             <span>{acc.note} (r0)</span>
                             <ChevronDown size={14} className="text-gray-300 group-hover:text-gray-400" />
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-8 text-center text-gray-500 font-medium">45</td>
                     <td className="px-10 py-8 text-center">1</td>
                     <td className="px-10 py-8 text-center">77.00</td>
                     <td className="px-10 py-8 text-center">
                        <span className="bg-[#EFFFF6] text-[#3ED383] px-4 py-1.5 rounded-full border border-emerald-50 shadow-sm">
                          7.70
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-black text-gray-800">10%</span>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className="bg-[#5340FF] h-full rounded-full" style={{width: '10%'}}></div>
                          </div>
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

export default AffiliateDashboard;
