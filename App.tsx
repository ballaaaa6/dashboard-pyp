
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
      setError("กรุณาตั้งค่า Environment Variables ใน Vercel Dashboard");
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
      setError("ไม่สามารถดึงข้อมูลได้: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชันดึง Username จาก Shopee โดยตรง (Client-side)
  const fetchShopeeUsername = async (cookie: string) => {
    try {
      // ใช้ Proxy เพื่อเลี่ยง CORS (เหมือนที่เว็บอื่นทำกัน)
      // หรือเรียก API Shopee โดยตรงถ้าเบราว์เซอร์อนุญาต (บางครั้ง Shopee ยอมถ้ามีคุกกี้ถูกต้อง)
      const response = await fetch('https://creator.shopee.co.th/api/v1/login/status', {
        headers: {
          'Accept': 'application/json',
          'Cookie': cookie // เบราว์เซอร์จะส่งคุกกี้นี้ไปให้ Shopee
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.username) {
          return data.data.username;
        }
      }
      
      // ถ้า API ดึงไม่ได้ ให้ลองดึงจากหน้า HTML (Fallback)
      const htmlResponse = await fetch('https://creator.shopee.co.th/insight/live/list', {
        headers: { 'Cookie': cookie }
      });
      const html = await htmlResponse.text();
      const nicknameMatch = html.match(/class="[^"]*_nickName_3tava_32[^"]*">([^<]+)<\/div>/);
      if (nicknameMatch && nicknameMatch[1]) {
        return nicknameMatch[1].trim();
      }
      
      return null;
    } catch (e) {
      console.error("Client-side fetch error:", e);
      return null;
    }
  };

  const addAndVerifyAccount = async (cookie: string, note: string) => {
    setIsSyncing(true);
    try {
      // 1. ดึง SPC_U จากคุกกี้ (ID หลัก)
      const spcU = cookie.match(/SPC_U=([^;]+)/);
      if (!spcU || !spcU[1]) {
        throw new Error("ไม่พบ SPC_U ในคุกกี้ กรุณาตรวจสอบคุกกี้");
      }
      const shopeeId = spcU[1];

      // 2. ดึงชื่อจริงจาก Shopee (ผ่านเบราว์เซอร์ผู้ใช้)
      let finalUsername = await fetchShopeeUsername(cookie);
      
      // ถ้ายังดึงไม่ได้ (ติด CORS) ให้ลองใช้ Proxy Backend (ที่เราทำไว้ก่อนหน้าเป็นทางเลือกสุดท้าย)
      if (!finalUsername) {
        try {
          const proxyResponse = await fetch('/api/get-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cookie })
          });
          const result = await proxyResponse.json();
          if (result.success && result.username) {
            finalUsername = result.username;
          }
        } catch (e) {
          console.error("Proxy fetch error:", e);
        }
      }

      // ถ้าดึงไม่ได้เลยจริงๆ (คุกกี้อาจจะมีปัญหา)
      if (!finalUsername) {
        finalUsername = `User_${shopeeId}`;
      }

      // 3. Upsert ลง Supabase
      const { error: upsertError } = await supabase
        .from('shopee_accounts')
        .upsert({
          id: shopeeId,
          username: finalUsername,
          cookie: cookie,
          note: note,
          expiry: 'Active'
        }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      await fetchData();
      return { success: true };
      
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
      return { success: false, message: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const removeAccount = async (id: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('shopee_accounts').delete().eq('id', id);
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
