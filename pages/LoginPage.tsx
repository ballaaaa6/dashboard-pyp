
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("กรุณาใส่ชื่อผู้ใช้งาน");
      return;
    }
    // กำหนดรหัสผ่านพื้นฐานไว้ก่อน หรือจะให้ใครเข้าก็ได้แต่แยกตาม username
    if (password === 'admin1234') { 
      onLogin(username.toLowerCase().trim(), password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#5340FF] rounded-[28px] flex items-center justify-center text-white font-black text-4xl mx-auto shadow-2xl shadow-blue-200">S</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#1E293B] tracking-tight uppercase italic">Shopee Dashboard</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Secure Personal Management System</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[45px] border border-gray-100 shadow-2xl shadow-blue-900/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#5340FF]"></div>
          
          <div className="flex items-center gap-3 text-[#5340FF] bg-blue-50/50 px-5 py-4 rounded-2xl border border-blue-50">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-wider">ระบุตัวตนเพื่อแยกฐานข้อมูลส่วนตัว</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Username / ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-5 bg-[#F9FBFF] border-2 border-transparent focus:border-[#5340FF] focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-700"
                  placeholder="เช่น user_01"
                  autoFocus
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                  <User size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-6 py-5 bg-[#F9FBFF] border-2 rounded-2xl transition-all outline-none font-bold ${error ? 'border-red-400' : 'border-transparent focus:border-[#5340FF] focus:bg-white'}`}
                  placeholder="••••••••"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                  <Lock size={20} />
                </div>
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase ml-2 animate-bounce">รหัสผ่านไม่ถูกต้อง!</p>}
            </div>

            <button
              type="submit"
              className="w-full py-6 bg-[#5340FF] hover:bg-[#4330EE] text-white rounded-[28px] font-black text-sm flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em] group mt-4"
            >
              <span>Login Account</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-2">
           <p className="text-gray-300 text-[9px] font-bold uppercase tracking-[0.4em]">Isolated User Experience v3.0</p>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
