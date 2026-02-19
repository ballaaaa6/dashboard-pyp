
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  RefreshCw,
  Database,
  Wifi,
  ShieldCheck,
  Search,
  UserCheck
} from 'lucide-react';
import { ShopeeAccount } from '../types';

interface CookieManagerProps {
  accounts: ShopeeAccount[];
  onAdd: (cookie: string, note: string) => Promise<{ success: boolean; message?: string }>;
  onRemove: (id: string) => void;
  isSyncing: boolean;
}

const CookieManager: React.FC<CookieManagerProps> = ({ accounts, onAdd, onRemove, isSyncing }) => {
  const [cookieValue, setCookieValue] = useState('');
  const [noteValue, setNoteValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAdd = async () => {
    const cleanCookie = cookieValue.trim();
    const cleanNote = noteValue.trim();

    if (!cleanCookie || !cleanNote) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }
    
    setIsVerifying(true);
    const result = await onAdd(cleanCookie, cleanNote);
    if (result.success) {
      setCookieValue('');
      setNoteValue('');
    }
    setIsVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24">
      {/* Hero Header */}
      <div className="bg-[#1E293B] p-10 rounded-[50px] shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5340FF]/20 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-1000 ${isSyncing || isVerifying ? 'bg-[#5340FF] shadow-[0_0_40px_rgba(83,64,255,0.5)]' : 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'}`}>
                {isSyncing || isVerifying ? <Search className="animate-pulse text-white" size={36} /> : <UserCheck className="text-white" size={36} />}
              </div>
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tight italic">Profile Autopilot</h2>
                 <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-400 animate-ping' : 'bg-emerald-400'}`}></span>
                   {isSyncing ? 'กำลังติดต่อ Shopee API...' : 'ระบบพร้อมตรวจสอบคุกกี้อัตโนมัติ'}
                 </p>
              </div>
           </div>
           <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Profiles</p>
              <p className="text-4xl font-black text-white">{accounts.length}</p>
           </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white p-10 rounded-[55px] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#5340FF]">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-black text-[#1E293B] uppercase tracking-tight">เพิ่มบัญชีใหม่ (Auto-Verify)</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Paste Shopee Cookie</label>
            <textarea 
              value={cookieValue}
              onChange={(e) => setCookieValue(e.target.value)}
              placeholder="SPC_EC=...; SPC_U=...;"
              className="w-full h-32 p-8 bg-[#F9FBFF] border-2 border-transparent focus:border-[#5340FF] focus:bg-white rounded-[40px] transition-all resize-none outline-none text-gray-600 text-[11px] font-mono shadow-inner"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Account Note (ชื่อจำง่ายๆ)</label>
            <input 
              type="text"
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="ตัวอย่าง: ร้านแม่ค้าออนไลน์-01"
              className="w-full px-8 py-5 bg-[#F9FBFF] border-2 border-transparent focus:border-[#5340FF] focus:bg-white rounded-[25px] transition-all outline-none text-gray-700 text-sm font-bold shadow-inner"
            />
          </div>

          <button 
            onClick={handleAdd}
            disabled={isSyncing || isVerifying}
            className="w-full py-7 bg-[#5340FF] hover:bg-[#4330EE] text-white rounded-[35px] font-black text-lg transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 uppercase tracking-[0.2em] group disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={24} className="animate-spin" />
                <span>กำลังดึงชื่อจาก Shopee...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={24} className="group-hover:scale-110 transition-transform" />
                <span>Verify & Add Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Inventory */}
      <div className="bg-white rounded-[55px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-12 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Cloud Inventory ({accounts.length})</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase">Real-time Data Fetching Enabled</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-50">
              {accounts.length === 0 ? (
                <tr>
                  <td className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <Database size={80} />
                      <p className="font-black text-sm uppercase tracking-widest">No Cloud Data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  // แสดงชื่อจริงที่ดึงมาจาก Shopee เท่านั้น
                  const mainName = acc.username || 'Pending Verify...';
                  const isVerified = mainName !== 'Pending Verify...';
                  
                  return (
                    <tr key={acc.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-[22px] border flex items-center justify-center font-black text-xl shadow-sm relative ${isVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-[#F3F5FF] border-blue-50 text-[#5340FF]'}`}>
                             {mainName.charAt(0).toUpperCase()}
                             <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                          </div>
                          <div>
                            <p className="font-black text-[#1E293B] text-xl uppercase tracking-tight">
                              {mainName} <span className="text-[#5340FF] opacity-70 font-bold">({acc.note})</span>
                            </p>
                            <div className="flex items-center gap-4 mt-1.5">
                              <span className="text-[11px] text-[#5340FF] font-black uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                 ID: {acc.id}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                 <Wifi size={10} className={isVerified ? 'text-emerald-400' : 'text-amber-400'} /> {acc.expiry}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                         <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => window.location.reload()}
                              className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                            >
                               <RefreshCw size={18} />
                            </button>
                            <button 
                              onClick={() => onRemove(acc.id)}
                              className="p-5 bg-red-50 text-red-400 rounded-[22px] hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                            >
                              <Trash2 size={20} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CookieManager;
