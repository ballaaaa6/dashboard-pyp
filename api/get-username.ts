
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
    const shopeeResponse = await fetch('https://creator.shopee.co.th/insight/live/list', {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await shopeeResponse.text();
    
    // ค้นหา Nickname จาก HTML โดยใช้ Regex (เลียนแบบ ._nickName_3tava_32)
    // ปกติใน HTML ของ Shopee จะมี class นี้อยู่
    const nicknameMatch = html.match(/class="[^"]*_nickName_3tava_32[^"]*">([^<]+)<\/div>/);
    
    if (nicknameMatch && nicknameMatch[1]) {
      return response.status(200).json({ 
        success: true, 
        username: nicknameMatch[1].trim() 
      });
    }

    // Fallback: ลองหาจากข้อมูลที่อาจอยู่ใน script tag หรือส่วนอื่น
    const fallbackMatch = html.match(/"nick_name":"([^"]+)"/);
    if (fallbackMatch && fallbackMatch[1]) {
        return response.status(200).json({ 
            success: true, 
            username: fallbackMatch[1].trim() 
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
