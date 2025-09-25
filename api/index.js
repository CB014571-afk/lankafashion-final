// This is a Vercel serverless function that acts as a proxy to your backend
// This helps bypass CORS issues temporarily

export default async function handler(req, res) {
  // Enable CORS for all origins (temporary fix)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // For now, return a simple response
  if (req.method === 'GET' && req.url === '/api/health') {
    return res.status(200).json({ message: 'Vercel API proxy is working!' });
  }

  // Temporary fallback for all API requests
  res.status(503).json({ 
    error: 'Backend server temporarily unavailable. Please ensure your Render server is deployed and running.',
    suggestion: 'Check your Render deployment at https://dashboard.render.com'
  });
}