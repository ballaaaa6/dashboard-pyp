
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

  const fetchData = useCallback(async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
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
      setError("ไม่สามารถดึงข้อมูลจาก Supabase ได้: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAndVerifyAccount = async (cookie: string, note: string) => {
    setIsSyncing(true);
    try {
      // 1. ดึง SPC_U จากคุกกี้ก่อน (เพื่อใช้เป็น ID และ Fallback Username)
      const spcU = cookie.match(/SPC_U=([^;]+)/);
      if (!spcU || !spcU[1]) {
          throw new Error("ไม่พบ SPC_U ในคุกกี้ กรุณาตรวจสอบคุกกี้ที่ใส่เข้ามา");
      }
      const shopeeId = spcU[1];

      // 2. ดึง Username จริงจาก Shopee
      let finalUsername = `User_${shopeeId}`; // ตั้งค่าเริ่มต้นเป็น ID หากดึงชื่อไม่ได้
      
      try {
        const response = await fetch('/api/get-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookie })
        });
        const result = await response.json();
        if (result.success && result.username) {
          finalUsername = result.username;
        }
      } catch (e) {
        console.error("Backend fetch error:", e);
      }

      // 3. ทำการ Upsert ลง Supabase
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

      await fetchData();
      return { success: true };
      
    } catch (err: any) {
      console.error("Verification Error:", err);
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

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

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
