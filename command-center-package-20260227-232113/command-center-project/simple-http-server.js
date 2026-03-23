const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOST = '0.0.0.0'; // Listen on all interfaces
const FRONTEND_PATH = path.join(__dirname, '../Agentic-Command-Center');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API endpoints
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Command Center Backend Running'
    }));
    return;
  }
  
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { message, brainId, agentId } = data;
        
        // Mock responses based on agent
        const responses = {
          prospyr: `I'm **Prospyr**, your technical assistant. You said: "${message}". 

I'm currently using the **${brainId}** brain. 

**Current Status**: Command Center backend is running successfully! 

**Next Steps**: 
1. Test the chat functionality
2. Verify Obsidian integration
3. Coordinate OmniMind deployment

What specific aspect would you like to work on?`,
          
          northstar: `I'm **Northstar**, your UI/UX specialist. You said: "${message}".

I'm currently using the **${brainId}** brain.

**UI Status**: Frontend is serving correctly from ${FRONTEND_PATH}

**Design Notes**:
- Three-pane layout (Agents | Chat | Tasks)
- Brain switching interface
- Mobile-responsive design
- Material Design 3 inspired

Would you like me to adjust any UI elements?`
        };
        
        const response = responses[agentId] || `Agent ${agentId} received: "${message}" using brain: ${brainId}`;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          response,
          brainId,
          agentId,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  if (req.url === '/api/obsidian/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { filepath, content } = data;
        
        console.log(`[Obsidian] Would save to: ${filepath}`);
        console.log(`[Obsidian] Content preview: ${content.substring(0, 100)}...`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Note would be saved to Obsidian: ${filepath}`,
          timestamp: new Date().toISOString(),
          note: 'In production, this would call the Obsidian REST API'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // Serve MVP HTML at root
  if (req.url === '/') {
    const mvpHtml = fs.readFileSync(path.join(__dirname, 'command-center-mvp.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(mvpHtml);
    return;
  }
  
  // Serve static files from frontend
  let filePath = req.url;
  filePath = path.join(FRONTEND_PATH, filePath);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
  }
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(FRONTEND_PATH, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Command Center Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${FRONTEND_PATH}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/chat`);
  console.log(`   POST /api/obsidian/save`);
  console.log(`\n💡 Open your browser to: http://localhost:3001`);
  console.log(`💡 Or access from another machine: http://${getLocalIP()}:3001`);
});

function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}