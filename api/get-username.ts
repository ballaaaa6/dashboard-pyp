
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
    // 1. ดึงข้อมูลจากหน้า Creator Insight โดยตรง (เหมือนที่ Manus ทดสอบในเบราว์เซอร์)
    const shopeeResponse = await fetch('https://creator.shopee.co.th/insight/live/list', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const html = await shopeeResponse.text();
    
    // ค้นหา Username จาก HTML โดยใช้ Regex ที่แม่นยำขึ้น (มองหา class _nickName_3tava_32)
    // หรือมองหาชื่อเล่นที่อยู่ใกล้ๆ กับรูปโปรไฟล์ใน header
    const nicknameMatch = html.match(/class="[^"]*_nickName_3tava_32[^"]*">([^<]+)<\/div>/);
    
    if (nicknameMatch && nicknameMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: nicknameMatch[1].trim() 
      });
    }

    // วิธีสำรอง: ค้นหาจาก JSON ที่ฝังอยู่ในหน้าเว็บ (มักจะอยู่ใน window.__INITIAL_STATE__)
    const jsonMatch = html.match(/"nick_name":"([^"]+)"/);
    if (jsonMatch && jsonMatch[1]) {
        return response.status(200).json({ 
            success: true, 
            username: jsonMatch[1].trim() 
        });
    }

    // วิธีสำรอง 2: ค้นหาจาก username ตรงๆ ใน JSON
    const usernameMatch = html.match(/"username":"([^"]+)"/);
    if (usernameMatch && usernameMatch[1]) {
        return response.status(200).json({ 
            success: true, 
            username: usernameMatch[1].trim() 
        });
    }

    // ถ้าดึงไม่ได้เลย ให้ส่ง Error กลับไปเพื่อให้ Frontend รู้
    return response.status(200).json({ 
      success: false, 
      message: 'ไม่พบชื่อเล่นในหน้า Shopee (คุกกี้อาจหมดอายุหรือหน้าเว็บเปลี่ยนโครงสร้าง)' 
    });

  } catch (error: any) {
    console.error('Shopee fetch error:', error);
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
