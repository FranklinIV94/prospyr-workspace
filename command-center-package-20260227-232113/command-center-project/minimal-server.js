const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOST = '0.0.0.0';

// Simple HTTP server
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
      server: 'Command Center Minimal Server',
      timestamp: new Date().toISOString(),
      northstar: { ip: '100.92.24.43', status: 'needs_setup' }
    }));
    return;
  }
  
  if (req.url === '/api/northstar/messages' && req.method === 'GET') {
    // Return queued messages for Northstar
    const messages = [
      { id: 1, agent: 'prospyr', message: 'Welcome back Northstar! Need help with UI design for OmniMind.', timestamp: new Date().toISOString() },
      { id: 2, agent: 'prospyr', message: 'DeepSeek API configured: sk-35119153338a487aaba64ef62ce867e6', timestamp: new Date().toISOString() }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }
  
  if (req.url === '/api/northstar/setup' && req.method === 'GET') {
    // Return setup instructions for Northstar
    const setup = {
      ssh_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCZFzsQtKqEMZnG8jg7mMGu0uzbGLMbx7Hv6HIWLtHdoJMDZ/7GplYnnAbqv+is5sG/scLfuCdb/GumWwqmBG1fqBKvU34OZkrznXAhnOJTkWN7DcPkIypPIFBwzfAA4r2gj/RM8Y1Hx6SagJQ5s9jCWHQX6ZGI4y55m8Xan3qHkM0Vxsp8uLNAUkKGrwITKM97DcFvqXy7Kiq7cVDbmundWgWL/Tx9jc8Q6fnLuoGCu/5C42UWV8y159tv4j9ig/EAXr0nUotdonqIs1pVhXG0b2CZBmlgaOSOVUMV146FqpD5zTjhZh+AueNa16denhuo506wRhnB2pQCxtJwjnXrsymR8DPGmv056bf0daakRIbMWi3BMWu70sB3XgbuDwatyG5O2E4XeULf1gvX/VoLG1psmLPpmFBs9JvN1CNgudYM54QqXUJ0mZ7bwls+UTaUl8dN8ju1TdqnRhYv1qsYW9P5tQzpxuyZp4A4lJlxFCi8Z6VAXnkD6xuQdeMUeYfGICqiIcLDaiHHO5KlTu6BCi+0gbKzvlh8FjRjIjYd16+mlEI6hlVQyMhxK7C7eqRCt3zD9oUw0xtVEjNOn7OOc+09KP1460MAta7uxQ78a7kzt+z//mR1/rGU238Mqmvk0lTeTqILUl+yEhtT7xkFmHEjRgg2eT2Tpbx458IaQw== ubuntu@prospyerity",
      deepseek_key: "sk-35119153338a487aaba64ef62ce867e6",
      command_center_url: "http://100.101.6.44:3001",
      setup_script: "Run: wget -O setup-northstar.sh http://100.101.6.44:8888/setup-northstar.sh && chmod +x setup-northstar.sh && ./setup-northstar.sh"
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(setup));
    return;
  }
  
  // Serve HTML interface
  if (req.url === '/' || req.url === '/index.html') {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Command Center - Northstar Setup</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .status { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .status.ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50; }
        pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }
        button { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #45a049; }
        .step { margin: 30px 0; padding: 20px; background: #f0f8ff; border-radius: 5px; }
        .step-number { display: inline-block; background: #4CAF50; color: white; width: 30px; height: 30px; text-align: center; line-height: 30px; border-radius: 50%; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Command Center - Northstar Setup</h1>
        
        <div class="status ok">
            <strong>Prospyr Server:</strong> Running on 100.101.6.44:3001
        </div>
        
        <div class="status warning">
            <strong>Northstar Status:</strong> Offline - Needs SSH key setup
        </div>
        
        <div class="card">
            <h2>📋 Setup Instructions for Northstar</h2>
            
            <div class="step">
                <div class="step-number">1</div>
                <h3>Add SSH Key to Northstar</h3>
                <p>SSH into Northstar and add this public key to <code>~/.ssh/authorized_keys</code>:</p>
                <pre id="ssh-key">Loading...</pre>
                <button onclick="copySSHKey()">Copy SSH Key</button>
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <h3>Configure DeepSeek API</h3>
                <p>Use this API key in Northstar's OpenClaw configuration:</p>
                <pre>sk-35119153338a487aaba64ef62ce867e6</pre>
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <h3>Run Setup Script</h3>
                <p>On Northstar, run this command:</p>
                <pre>wget -O setup-northstar.sh http://100.101.6.44:8888/setup-northstar.sh && chmod +x setup-northstar.sh && ./setup-northstar.sh</pre>
                <button onclick="runTest()">Test Connection</button>
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 Quick Links</h2>
            <ul>
                <li><a href="http://100.101.6.44:3001/northstar" target="_blank">Northstar Interface</a></li>
                <li><a href="http://100.101.6.44:8888/" target="_blank">Shared Documentation</a></li>
                <li><a href="http://100.101.6.44:3001/api/health" target="_blank">API Health Check</a></li>
            </ul>
        </div>
    </div>
    
    <script>
        // Load SSH key from API
        fetch('/api/northstar/setup')
            .then(response => response.json())
            .then(data => {
                document.getElementById('ssh-key').textContent = data.ssh_key;
            })
            .catch(error => {
                console.error('Error loading SSH key:', error);
            });
        
        function copySSHKey() {
            const sshKey = document.getElementById('ssh-key').textContent;
            navigator.clipboard.writeText(sshKey)
                .then(() => alert('SSH key copied to clipboard!'))
                .catch(err => console.error('Copy failed:', err));
        }
        
        function runTest() {
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    alert('Server is running! Status: ' + data.status);
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                });
        }
        
        // Auto-refresh status every 30 seconds
        setInterval(() => {
            fetch('/api/health')
                .then(response => response.json())
                .then(data => {
                    console.log('Health check:', data.status);
                });
        }, 30000);
    </script>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }
  
  if (req.url === '/northstar') {
    // Serve the northstar interface
    try {
      const northstarHtml = fs.readFileSync(path.join(__dirname, 'northstar-interface.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(northstarHtml);
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Northstar Interface</h1><p>Interface file not found.</p>');
    }
    return;
  }
  
  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Command Center Minimal Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Accessible via Tailscale: http://100.101.6.44:${PORT}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/northstar/messages`);
  console.log(`   GET  /api/northstar/setup`);
  console.log(`   GET  /northstar - Northstar interface`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});