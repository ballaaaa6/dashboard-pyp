
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
    // ใช้ User-Agent ที่เป็นปัจจุบันที่สุด
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    
    // ลองดึงจาก API ดึงสถานะการ Login ของ Shopee โดยตรง (วิธีนี้มักจะเสถียรกว่าการดึง HTML)
    const apiResponse = await fetch('https://creator.shopee.co.th/api/v1/login/status', {
      headers: {
        'Cookie': cookie,
        'User-Agent': userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://creator.shopee.co.th/insight/live/list',
      },
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      if (apiData && apiData.data && apiData.data.username) {
        return response.status(200).json({ 
          success: true, 
          username: apiData.data.username 
        });
      }
    }

    // วิธีสำรอง: ดึงจากหน้า HTML (เหมือนที่ทดสอบสำเร็จในเบราว์เซอร์)
    const shopeeResponse = await fetch('https://creator.shopee.co.th/insight/live/list', {
      headers: {
        'Cookie': cookie,
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const html = await shopeeResponse.text();
    
    // ค้นหา Username จาก HTML โดยใช้ Regex (._nickName_3tava_32)
    const nicknameMatch = html.match(/class="[^"]*_nickName_3tava_32[^"]*">([^<]+)<\/div>/);
    if (nicknameMatch && nicknameMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: nicknameMatch[1].trim() 
      });
    }

    // ค้นหาจาก JSON ที่ฝังอยู่ในหน้าเว็บ
    const jsonMatch = html.match(/"nick_name":"([^"]+)"/);
    if (jsonMatch && jsonMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: jsonMatch[1].trim() 
      });
    }

    return response.status(200).json({ 
      success: false, 
      message: 'ไม่พบชื่อเล่นในหน้า Shopee (คุกกี้อาจหมดอายุหรือถูกบล็อกโดย Shopee)' 
    });

  } catch (error: any) {
    console.error('Shopee fetch error:', error);
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
