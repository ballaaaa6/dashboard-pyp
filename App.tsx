
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveDashboard from './pages/LiveDashboard';
import CookieManager from './pages/CookieManager';
import AffiliateDashboard from './pages/AffiliateDashboard';
import { ShopeeAccount } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<ShopeeAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลจาก Supabase
  const fetchData = useCallback(async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase configuration");
      setError("กรุณาตั้งค่า Environment Variables (VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY) ใน Vercel Dashboard");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('shopee_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      
      if (data) {
        const formattedData = data.map(item => ({
          ...item,
          id: item.id.toString()
        }));
        setAccounts(formattedData as ShopeeAccount[]);
      }
    } catch (err: any) {
      console.error("Supabase fetch failed:", err);
      const saved = localStorage.getItem('shopee_accounts_backup');
      if (saved) setAccounts(JSON.parse(saved));
      setError("ไม่สามารถดึงข้อมูลจาก Supabase ได้: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชัน "เพิ่มและตรวจสอบ" (ดึงชื่อจริงจาก Shopee ผ่าน API Backend)
  const addAndVerifyAccount = async (cookie: string, note: string) => {
    setIsSyncing(true);
    try {
      // 1. ดึง Username จริงจาก Shopee ผ่าน API ของเรา
      const response = await fetch('/api/get-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookie })
      });

      const result = await response.json();
      
      // 2. ดึง SPC_U จากคุกกี้เพื่อใช้เป็น ID บัญชี Shopee (สำคัญมากสำหรับการทำ Upsert)
      const spcU = cookie.match(/SPC_U=([^;]+)/);
      if (!spcU || !spcU[1]) {
          throw new Error("ไม่พบ SPC_U ในคุกกี้ กรุณาตรวจสอบคุกกี้ที่ใส่เข้ามา");
      }
      const shopeeId = spcU[1];

      // ถ้าดึงชื่อเล่นไม่ได้ ให้แจ้ง Error ชัดเจน (ไม่ fallback ไป Shop_xx)
      if (!result.success || !result.username) {
          throw new Error(result.message || "ไม่สามารถดึงชื่อเล่นจาก Shopee ได้ กรุณาลองใหม่อีกครั้ง");
      }
      
      const finalUsername = result.username;

      // 3. ทำการ Upsert ลง Supabase (ใช้ id เป็นตัวเช็คว่าซ้ำไหม)
      const accountData = {
        id: shopeeId,
        username: finalUsername,
        cookie: cookie,
        note: note,
        expiry: 'Active'
      };

      const { error: upsertError } = await supabase
        .from('shopee_accounts')
        .upsert(accountData, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      await fetchData(); // โหลดข้อมูลใหม่
      return { success: true };
      
    } catch (err: any) {
      console.error("Verification/Insert Error:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
      return { success: false, message: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const removeAccount = async (id: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('shopee_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAccounts(prev => prev.filter(acc => acc.id.toString() !== id.toString()));
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#5340FF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#5340FF] font-black uppercase tracking-widest text-xs italic">Connecting to Supabase Cloud...</p>
      </div>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-8 rounded-[30px] border border-red-100 max-w-md">
          <h2 className="text-red-500 font-black text-xl mb-4 uppercase">Configuration Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500 text-white rounded-full font-bold uppercase text-xs hover:bg-red-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout accounts={accounts} isSyncing={isSyncing} onRefresh={fetchData}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard-live" replace />} />
          <Route path="/dashboard-live" element={<LiveDashboard accounts={accounts} />} />
          <Route path="/cookie-manager" element={
            <CookieManager 
              accounts={accounts} 
              onAdd={addAndVerifyAccount} 
              onRemove={removeAccount}
              isSyncing={isSyncing}
            />
          } />
          <Route path="/affiliate" element={<AffiliateDashboard accounts={accounts} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
