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
      status: 'pending', // pending, delivered, responded
      response: null,
      responseTimestamp: null
    };
    this.messages.unshift(msg); // Add to beginning (newest first)
    
    // Keep only last 50 messages
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
  
  // Main chat endpoint (enhanced with Northstar integration)
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { message, brainId, agentId } = data;
        
        // Special handling for Northstar agent
        if (agentId === 'northstar') {
          // Add to Northstar queue
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
        
        // Regular responses for other agents
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
1. Check "Northstar Messages" panel
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
        res.statusCode = 400;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // Obsidian save endpoint
  if (req.url === '/api/obsidian/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { filepath, content } = data;
        
        console.log(`[Obsidian] Would save to: ${filepath}`);
        console.log(`[Obsidian] Content length: ${content.length} chars`);
        
        // Also log Northstar messages to Obsidian
        if (filepath.includes('northstar') || filepath.includes('Northstar')) {
          console.log(`[Obsidian] Northstar-related note: ${filepath}`);
        }
        
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
  
  // Northstar management interface
  if (req.url === '/northstar' || req.url === '/northstar/') {
    const northstarHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Northstar Message Relay</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #1a1a1a; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .panel { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .message { border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 15px; background: #f8fafc; }
        .message.pending { border-left-color: #f59e0b; }
        .message.responded { border-left-color: #10b981; }
        .message-id { font-size: 12px; color: #666; margin-bottom: 5px; }
        .message-content { margin-bottom: 10px; }
        .response { background: #dcfce7; padding: 10px; border-radius: 6px; margin-top: 10px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; }
        textarea, input { width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: inherit; }
        button { background: #1a1a1a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        button:hover { background: #333; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.responded { background: #d1fae5; color: #065f46; }
        .refresh { float: right; background: #3b82f6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📨 Northstar Message Relay</h1>
        <p class="subtitle">Tailscale IP: 100.92.24.43 | Queue: <span id="queueCount">0</span> messages</p>
        
        <div class="panel">
            <h2>Send Message to Northstar</h2>
            <form id="sendForm">
                <div class="form-group">
                    <label>Your Message:</label>
                    <textarea id="messageInput" rows="4" placeholder="What would you like to ask Northstar?"></textarea>
                </div>
                <button type="submit">Send to Northstar Queue</button>
            </form>
        </div>
        
        <div class="panel">
            <h2>Pending Messages <span id="pendingCount">0</span> <button class="refresh" onclick="loadMessages()">Refresh</button></h2>
            <div id="pendingMessages"></div>
        </div>
        
        <div class="panel">
            <h2>Add Response from Northstar</h2>
            <form id="responseForm">
                <div class="form-group">
                    <label>Message ID:</label>
                    <input type="text" id="messageId" placeholder="Enter message ID from above">
                </div>
                <div class="form-group">
                    <label>Northstar's Response:</label>
                    <textarea id="responseInput" rows="4" placeholder="Enter Northstar's response..."></textarea>
                </div>
                <button type="submit">Add Response</button>
            </form>
        </div>
        
        <div class="panel">
            <h2>Recent Messages</h2>
            <div id="recentMessages"></div>
        </div>
    </div>
    
    <script>
        async function loadMessages() {
            try {
                // Load pending messages
                const pendingRes = await fetch('/api/northstar/messages/pending');
                const pendingData = await pendingRes.json();
                
                document.getElementById('pendingCount').textContent = pendingData.count;
                document.getElementById('queueCount').textContent = pendingData.count;
                
                let pendingHtml = '';
                if (pendingData.messages.length === 0) {
                    pendingHtml = '<p>No pending messages.</p>';
                } else {
                    pendingData.messages.forEach(msg => {
                        pendingHtml += \`
                        <div class="message pending">
                            <div class="message-id">ID: \${msg.id} | From: \${msg.sender} | \${new Date(msg.timestamp).toLocaleString()}</div>
                            <div class="message-content"><strong>Message:</strong> \${msg.message}</div>
                            <div class="status pending">Pending Response</div>
                        </div>\`;
                    });
                }
                document.getElementById('pendingMessages').innerHTML = pendingHtml;
                
                // Load recent messages
                const recentRes = await fetch('/api/northstar/messages');
                const recentData = await recentRes.json();
                
                let recentHtml = '';
                recentData.messages.slice(0, 10).forEach(msg => {
                    recentHtml += \`
                    <div class="message \${msg.status}">
                        <div class="message-id">ID: \${msg.id} | From: \${msg.sender} | \${new Date(msg.timestamp).toLocaleString()}</div>
                        <div class="message-content"><strong>Message:</strong> \${msg.message}</div>
                        \${msg.response ? \`
                        <div class="response">
                            <strong>Northstar Response:</strong> \${msg.response}
                            <div class="message-id">Responded: \${new Date(msg.responseTimestamp).toLocaleString()}</div>
                        </div>\` : ''}
                        <div class="status \${msg.status}">\${msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}</div>
                    </div>\`;
                });
                document.getElementById('recentMessages').innerHTML = recentHtml;
                
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
        
        document.getElementById('sendForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = document.getElementById('messageInput').value.trim();
            if (!message) return;
            
            try {
                const response = await fetch('/api/northstar/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, sender: 'Web Interface' })
                });
                
                const                const data = await response.json();
                if (data.success) {
                    alert(`Message sent! ID: ${data.messageId}`);
                    document.getElementById('messageInput').value = '';
                    loadMessages();
                }
            } catch (error) {
                alert('Error sending message: ' + error.message);
            }
        });
        
        document.getElementById('responseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageId = document.getElementById('messageId').value.trim();
            const response = document.getElementById('responseInput').value.trim();
            if (!messageId || !response) return;
            
            try {
                const res = await fetch(\`/api/northstar/messages/\${messageId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ response })
                });
                
                const data = await res.json();
                if (data.success) {
                    alert('Response added!');
                    document.getElementById('messageId').value = '';
                    document.getElementById('responseInput').value = '';
                    loadMessages();
                }
            } catch (error) {
                alert('Error adding response: ' + error.message);
            }
        });
        
        // Load messages on page load
        loadMessages();
        // Refresh every 30 seconds
        setInterval(loadMessages, 30000);
    </script>
</body>
</html>`;

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