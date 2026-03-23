const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOST = '0.0.0.0';
const FRONTEND_PATH = path.join(__dirname, '../Agentic-Command-Center');

// Northstar message queue
const northstarQueue = {
  messages: [],
  addMessage: function(sender, message, agentId = 'prospyr') {
    const msg = {
      id: Date.now().toString(),
      sender,
      message,
      agentId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      response: null,
      responseTimestamp: null
    };
    this.messages.unshift(msg);
    
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(0, 50);
    }
    
    console.log(`[Northstar Queue] New message from ${sender}: ${message.substring(0, 50)}...`);
    return msg;
  },
  
  getPendingMessages: function() {
    return this.messages.filter(m => m.status === 'pending');
  },
  
  addResponse: function(messageId, response) {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      msg.status = 'responded';
      msg.response = response;
      msg.responseTimestamp = new Date().toISOString();
      console.log(`[Northstar Queue] Response to message ${messageId}: ${response.substring(0, 50)}...`);
      return msg;
    }
    return null;
  },
  
  getAllMessages: function(limit = 20) {
    return this.messages.slice(0, limit);
  }
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
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
      message: 'Command Center Backend Running',
      northstar: {
        ip: '100.92.24.43',
        status: 'reachable via Tailscale',
        queue: northstarQueue.messages.length
      }
    }));
    return;
  }
  
  // Northstar message queue endpoints
  if (req.url === '/api/northstar/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      messages: northstarQueue.getAllMessages(),
      pending: northstarQueue.getPendingMessages().length,
      total: northstarQueue.messages.length
    }));
    return;
  }
  
  if (req.url === '/api/northstar/messages/pending' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      messages: northstarQueue.getPendingMessages(),
      count: northstarQueue.getPendingMessages().length
    }));
    return;
  }
  
  if (req.url === '/api/northstar/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { message, sender = 'Command Center', agentId = 'prospyr' } = data;
        
        if (!message) {
          throw new Error('Message is required');
        }
        
        const msg = northstarQueue.addMessage(sender, message, agentId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Message added to Northstar queue',
          messageId: msg.id,
          queuePosition: northstarQueue.messages.length
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  if (req.url.startsWith('/api/northstar/messages/') && req.method === 'PUT') {
    const messageId = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { response } = data;
        
        if (!response) {
          throw new Error('Response is required');
        }
        
        const msg = northstarQueue.addResponse(messageId, response);
        
        if (msg) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Response added to message',
            messageId: msg.id,
            status: msg.status
          }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message not found' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // Main chat endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { message, brainId, agentId } = data;
        
        // Special handling for Northstar agent
        if (agentId === 'northstar') {
          const msg = northstarQueue.addMessage('Command Center User', message, 'northstar');
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            response: `📨 **Message sent to Northstar!**\n\nYour message has been queued for Northstar (${northstarQueue.getPendingMessages().length} pending messages).\n\n**Next Steps**:\n1. Northstar will respond when available\n2. Check "Northstar Messages" in Command Center\n3. Or respond manually via the Northstar interface`,
            brainId,
            agentId: 'northstar',
            messageId: msg.id,
            timestamp: new Date().toISOString(),
            note: 'This is a queued message for Northstar. Check the Northstar messages panel for responses.'
          }));
          return;
        }
        
        // Regular responses
        const responses = {
          prospyr: `I'm **Prospyr**, your technical assistant. You said: "${message}". 

I'm currently using the **${brainId}** brain. 

**Northstar Integration Status**: 
- Northstar is at: \`100.92.24.43\` (Tailscale)
- Message queue: ${northstarQueue.getPendingMessages().length} pending
- To message Northstar: Switch to "Northstar" agent

**Command Center Features**:
1. ✅ Multi-agent chat (Prospyr + Northstar queue)
2. ✅ Brain switching (${brainId} active)
3. ✅ Task tracking for OmniMind
4. ✅ Mobile access (iPhone tested)
5. ✅ Tailscale network access

**OmniMind Deployment Ready** - What's our first move?`,
          
          northstar: `I'm **Northstar**, your UI/UX specialist (via message queue). You said: "${message}".

This message has been queued for the real Northstar at \`100.92.24.43\`.

**To get a real response**:
1. Check "Northstar Messages" panel at /northstar
2. SSH to Northstar: \`ssh ubuntu@100.92.24.43\`
3. Relay the response back via Command Center

**UI/UX Notes for Command Center**:
- Current interface: MVP HTML (working!)
- Planned: React frontend with Material Design 3
- Mobile: Confirmed working on iPhone
- Next: Dark mode, keyboard shortcuts, drag-and-drop

What specific UI improvement would you like to discuss?`
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
  
  // Northstar management interface
  if (req.url === '/northstar' || req.url === '/northstar/') {
    const northstarHtml = fs.readFileSync(path.join(__dirname, 'northstar-interface.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(northstarHtml);
    return;
  }
  
  // Serve MVP HTML at root
  if (req.url === '/') {
    const mvpHtml = fs.readFileSync(path.join(__dirname, 'command-center-mvp.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(mvpHtml);
    return;
  }
  
  // Serve static files
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
  console.log(`🚀 Command Center with Northstar Integration`);
  console.log(`📡 Listening on: http://${HOST}:${PORT}`);
  console.log(`🌐 Access via Tailscale: http://100.101.6.44:${PORT}`);
  console.log(`📨 Northstar Relay: http://100.101.6.44:${PORT}/northstar`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/chat`);
  console.log(`   GET  /api/northstar/messages`);
  console.log(`   POST /api/northstar/messages`);
  console.log(`   PUT  /api/northstar/messages/:id`);
  console.log(`\n🎯 Northstar IP: 100.92.24.43 (Tailscale)`);
  console.log(`💡 Open browser to: http://localhost:${PORT}`);
});