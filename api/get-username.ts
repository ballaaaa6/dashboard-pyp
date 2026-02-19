
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { cookie } = request.body;

  if (!cookie) {
    return response.status(400).json({ error: 'Cookie is required' });
  }

  try {
    // 1. ลองดึงจาก Shopee Creator Insight (หน้าหลัก)
    const shopeeResponse = await fetch('https://creator.shopee.co.th/insight/live/list', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await shopeeResponse.text();
    
    // วิธีที่ 1: หาจาก Class ที่ผู้ใช้ระบุ (Regex แบบยืดหยุ่น)
    const nicknameMatch = html.match(/class="[^"]*_nickName_3tava_32[^"]*">([^<]+)<\/div>/);
    if (nicknameMatch && nicknameMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: nicknameMatch[1].trim() 
      });
    }

    // วิธีที่ 2: หาจาก JSON ข้อมูลผู้ใช้ที่มักฝังอยู่ในหน้าเว็บ (window.__INITIAL_STATE__ หรืออื่นๆ)
    const jsonMatch = html.match(/"nick_name":"([^"]+)"/);
    if (jsonMatch && jsonMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: jsonMatch[1].trim() 
      });
    }

    // วิธีที่ 3: ลองดึงจาก API ของ Shopee โดยตรง (ถ้าหน้าเว็บดึงไม่ได้)
    const apiResponse = await fetch('https://creator.shopee.co.th/api/v1/login/status', {
        headers: {
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    });
    const apiData = await apiResponse.json();
    if (apiData && apiData.data && apiData.data.username) {
        return response.status(200).json({ 
            success: true, 
            username: apiData.data.username 
        });
    }

    // วิธีที่ 4: ดึงจาก SPC_U ในคุกกี้ (เป็นทางเลือกสุดท้ายถ้าหาชื่อเล่นไม่เจอจริงๆ)
    const spcU = cookie.match(/SPC_U=([^;]+)/);
    if (spcU && spcU[1]) {
        return response.status(200).json({ 
            success: true, 
            username: `User_${spcU[1]}` 
        });
    }

    return response.status(200).json({ 
      success: false, 
      message: 'Could not find nickname in Shopee page' 
    });

  } catch (error: any) {
    console.error('Shopee fetch error:', error);
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
