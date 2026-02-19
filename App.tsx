
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveDashboard from './pages/LiveDashboard';
import CookieManager from './pages/CookieManager';
import AffiliateDashboard from './pages/AffiliateDashboard';
import { ShopeeAccount } from './types';

// ลิงก์ GAS ของคุณที่ทำหน้าที่เป็นทั้ง Database และ Proxy
const CLOUD_URL = "https://script.google.com/macros/s/AKfycbwvSDRK2Qj8ONEAoAYKR0hD5IxLVN3KyZLLuDlgU5X71NHZZeKk7UaxPkDoY8mQNfuZSQ/exec";

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<ShopeeAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ดึงข้อมูลจาก Sheet (ดึงมาทั้งหมด)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(CLOUD_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch (err) {
      console.error("Cloud fetch failed:", err);
      const saved = localStorage.getItem('shopee_accounts_backup');
      if (saved) setAccounts(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชัน "เพิ่มและตรวจสอบ" (ส่งไปให้ GAS ดึงชื่อ Username จาก Shopee)
  const addAndVerifyAccount = async (cookie: string, note: string) => {
    setIsSyncing(true);
    try {
      // ส่ง POST ไปที่ GAS พร้อมระบุ action ว่าจะ 'add'
      // หมายเหตุ: GAS ของคุณต้องรองรับการรับ JSON ที่มี cookie เพื่อไป fetch Shopee ต่อ
      const response = await fetch(CLOUD_URL, {
        method: 'POST',
        // mode: 'no-cors' จะไม่สามารถอ่าน response ได้ 
        // ดังนั้น GAS ต้องตั้งค่าให้ส่ง Header CORS กลับมา หรือใช้การ fetch ปกติถ้า GAS รองรับ
        body: JSON.stringify({
          action: 'add_account',
          cookie: cookie,
          note: note
        })
      });

      // ถ้า GAS เขียนให้ return ข้อมูลบัญชีใหม่กลับมา
      const result = await response.json();
      if (result.success) {
        await fetchData(); // โหลดข้อมูลใหม่ทั้งหมดหลังเพิ่มสำเร็จ
        return { success: true };
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      // ถ้า API ตรวจสอบไม่ได้ ให้เพิ่มแบบ Manual ไปก่อน (กันเหนียว)
      const manualEntry: ShopeeAccount = {
        id: Date.now().toString(),
        username: 'Pending Verify...',
        cookie: cookie,
        note: note,
        expiry: 'Active'
      };
      const newAccounts = [...accounts, manualEntry];
      setAccounts(newAccounts);
      await syncAllToCloud(newAccounts);
      return { success: true };
    } finally {
      setIsSyncing(false);
    }
  };

  const removeAccount = async (id: string) => {
    const newAccounts = accounts.filter(acc => acc.id !== id);
    setAccounts(newAccounts);
    await syncAllToCloud(newAccounts);
  };

  const syncAllToCloud = async (currentAccounts: ShopeeAccount[]) => {
    setIsSyncing(true);
    localStorage.setItem('shopee_accounts_backup', JSON.stringify(currentAccounts));
    try {
      await fetch(CLOUD_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'sync_all', data: currentAccounts })
      });
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#5340FF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#5340FF] font-black uppercase tracking-widest text-xs italic">Connecting to Shopee Cloud Engine...</p>
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
