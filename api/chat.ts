// api/chat.ts (Vercel Serverless Function)
/**
 * 这个文件运行在 Vercel 的服务端（Serverless 环境）
 * 它可以安全地访问环境变量而不会泄露给前端，
 * 并且能通过服务端请求完美解决浏览器 CORS（跨域）问题。
 */

export const config = {
  runtime: 'edge', // 使用边缘函数，提供极快的响应速度
}

export default async function handler(req: Request) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // ── 读取敏感环境变量（在服务器端运行，Key 不会暴露给浏览器） ──
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI_API_KEY is not configured on server' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientBody = await req.json();

    // ── 向 AI 厂商服务器发起请求 ──
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(clientBody),
    });

    // ── 直接透传厂商的响应给前端 ──
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Serverless] Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
