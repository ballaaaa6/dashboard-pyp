
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveDashboard from './pages/LiveDashboard';
import CookieManager from './pages/CookieManager';
import AffiliateDashboard from './pages/AffiliateDashboard';
import { ShopeeAccount } from './types';
import { supabase } from './supabaseClient';

// ลิงก์ GAS เดิมที่ใช้เป็น Proxy สำหรับ Shopee API (เรายังคงไว้เพื่อ fetch ข้อมูลจาก Shopee)
const PROXY_URL = "https://script.google.com/macros/s/AKfycbwvSDRK2Qj8ONEAoAYKR0hD5IxLVN3KyZLLuDlgU5X71NHZZeKk7UaxPkDoY8mQNfuZSQ/exec";

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<ShopeeAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลจาก Supabase
  const fetchData = useCallback(async () => {
    // ตรวจสอบว่า Supabase พร้อมทำงานหรือไม่
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
        // แปลง id เป็น string เพื่อให้ตรงกับ interface ShopeeAccount
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

  // ฟังก์ชัน "เพิ่มและตรวจสอบ" (รองรับ Upsert)
  const addAndVerifyAccount = async (cookie: string, note: string) => {
    setIsSyncing(true);
    try {
      // 1. ส่งไปให้ Proxy (GAS) เพื่อตรวจสอบ Username จาก Shopee
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add_account',
          cookie: cookie,
          note: note
        })
      });

      const result = await response.json();
      
      if (result.success && result.account) {
        // 2. ถ้า Proxy ตรวจสอบสำเร็จ ให้ใช้ ID เดิมจาก Shopee เพื่อทำการ Upsert
        const accountId = result.account.id || Date.now();
        const newAccount = {
          id: accountId,
          username: result.account.username,
          cookie: result.account.cookie,
          note: note, // ใช้ Note ล่าสุดที่ผู้ใช้พิมพ์มา
          expiry: result.account.expiry || 'Active'
        };

        // ใช้ upsert เพื่ออัปเดตถ้ามี ID เดิมอยู่แล้ว
        const { error } = await supabase
          .from('shopee_accounts')
          .upsert(newAccount, { onConflict: 'id' });

        if (error) throw error;

        await fetchData(); // โหลดข้อมูลใหม่
        return { success: true };
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err: any) {
      console.error("Verification/Insert Error:", err);
      // Fallback: ถ้า API ตรวจสอบไม่ได้ ให้เพิ่มแบบ Manual ลง Supabase (ใช้ timestamp เป็น ID)
      const manualEntry = {
        id: Date.now(),
        username: 'Pending Verify...',
        cookie: cookie,
        note: note,
        expiry: 'Active'
      };
      
      const { error } = await supabase
        .from('shopee_accounts')
        .insert([manualEntry]);
        
      if (!error) {
        await fetchData();
        return { success: true };
      }
      return { success: false };
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
      localStorage.setItem('shopee_accounts_backup', JSON.stringify(accounts.filter(acc => acc.id.toString() !== id.toString())));
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
