
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

  // ดึงข้อมูลจาก Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shopee_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setAccounts(data as ShopeeAccount[]);
      }
    } catch (err) {
      console.error("Supabase fetch failed:", err);
      const saved = localStorage.getItem('shopee_accounts_backup');
      if (saved) setAccounts(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชัน "เพิ่มและตรวจสอบ"
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
        // 2. ถ้า Proxy ตรวจสอบสำเร็จ ให้บันทึกลง Supabase
        const newAccount = {
          id: result.account.id || Date.now(),
          username: result.account.username,
          cookie: result.account.cookie,
          note: result.account.note,
          expiry: result.account.expiry || 'Active'
        };

        const { error } = await supabase
          .from('shopee_accounts')
          .insert([newAccount]);

        if (error) throw error;

        await fetchData(); // โหลดข้อมูลใหม่
        return { success: true };
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification/Insert Error:", err);
      // Fallback: ถ้า API ตรวจสอบไม่ได้ ให้เพิ่มแบบ Manual ลง Supabase
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
