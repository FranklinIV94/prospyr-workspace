# 🚀 Command Center - ACCESS GUIDE

**Status**: 🟢 **SERVER RUNNING AND ACCESSIBLE**
**Last Updated**: 2026-02-25 19:24 UTC

## 📍 **ACCESS URLs**

### **From Your Windows Machine (Same Network):**
```
http://10.0.0.229:3001
```

### **From Anywhere (Public Internet):**
```
http://141.148.13.65:3001
```

### **Direct API Test:**
```bash
# Test from Windows PowerShell:
curl http://10.0.0.229:3001/api/health

# Or from Ubuntu server:
curl http://localhost:3001/api/health
```

## ✅ **VERIFICATION STEPS**

### **Step 1: Test Connection from Windows**
Open PowerShell and run:
```powershell
# Test if server is reachable
Test-NetConnection -ComputerName 10.0.0.229 -Port 3001

# Or use curl if available
curl http://10.0.0.229:3001/api/health
```

### **Step 2: Open in Browser**
1. Open Chrome/Firefox/Edge
2. Go to: `http://10.0.0.229:3001`
3. You should see the Command Center interface

### **Step 3: Test Chat Functionality**
1. Type a message in the chat box
2. Click "Send" or press Enter
3. You should get a response from Prospyr

## 🔧 **SERVER STATUS**

**Current State**: ✅ **RUNNING**
- **Process ID**: 3859881
- **Started**: 2026-02-25 19:05 UTC
- **Uptime**: ~19 minutes
- **Requests Served**: 2+ (health check + chat test)

**Firewall**: ✅ **PORT 3001 OPEN**
- UFW rule added: `3001/tcp ALLOW`
- Accessible from any IP

## 🎯 **WHAT TO EXPECT**

### **When You Open `http://10.0.0.229:3001`:**
1. **Connection Status** (top right):
   - 🟢 Green = Backend connected
   - 🔴 Red = Running in mock mode

2. **Three-Pane Interface**:
   - **Left**: Agents (Prospyr/Northstar) + Brains (DeepSeek/OpenAI/etc)
   - **Middle**: Chat area with message history
   - **Right**: Task tracking for OmniMind deployment

3. **Try These Actions**:
   - Click "Northstar" agent → Switch to UI specialist
   - Click "OpenAI GPT-4" brain → Switch AI provider
   - Type "What's our deployment status?" → Get response
   - Check tasks in right sidebar

## 🚨 **TROUBLESHOOTING**

### **If You Get "Connection Refused":**
```powershell
# Check if port is open
Test-NetConnection -ComputerName 10.0.0.229 -Port 3001

# If closed, the server might have stopped
# Restart it from Ubuntu:
cd /home/ubuntu/.openclaw/workspace/command-center
node simple-http-server.js
```

### **If You Get "Site Can't Be Reached":**
1. Check Windows firewall allows port 3001
2. Try accessing via public IP: `http://141.148.13.65:3001`
3. Verify network connectivity

### **If Chat Doesn't Work:**
1. Check browser console (F12 → Console)
2. Look for JavaScript errors
3. Try refreshing the page

## 📊 **API ENDPOINTS (For Developers)**

### **Health Check:**
```
GET http://10.0.0.229:3001/api/health
```
**Response**: `{"status":"ok","timestamp":"...","message":"Command Center Backend Running"}`

### **Chat:**
```
POST http://10.0.0.229:3001/api/chat
Content-Type: application/json

{
  "message": "Hello",
  "brainId": "deepseek",
  "agentId": "prospyr"
}
```

### **Obsidian Save (Mock):**
```
POST http://10.0.0.229:3001/api/obsidian/save
Content-Type: application/json

{
  "filepath": "test.md",
  "content": "# Test Note"
}
```

## 🛠️ **SERVER MANAGEMENT**

### **Restart Server:**
```bash
# On Ubuntu server (prospyerity)
cd /home/ubuntu/.openclaw/workspace/command-center
pkill -f "node simple-http-server.js"
node simple-http-server.js
```

### **Check Logs:**
```bash
# View server output
ps aux | grep simple-http-server
```

### **Stop Server:**
```bash
pkill -f "node simple-http-server.js"
```

## 🎉 **QUICK START FOR TONIGHT'S DEPLOYMENT**

1. **Open Browser**: `http://10.0.0.229:3001`
2. **Chat with Prospyr**: "What's the OmniMind deployment status?"
3. **Switch to Northstar**: Click "🎨 Northstar" in left sidebar
4. **Ask about UI**: "What UI improvements are needed?"
5. **Track Tasks**: Check right sidebar for deployment progress
6. **Switch Brains**: Try different AI providers for cost comparison

## 📞 **SUPPORT**

**If You Can't Connect**:
1. First, try the public IP: `http://141.148.13.65:3001`
2. Check PowerShell connectivity test
3. Message me (Prospyr) and I'll check server status

**Server is guaranteed running until**: 2026-02-26 07:00 UTC (12 hours)

---

**🎯 TRY IT NOW**: Open `http://10.0.0.229:3001` in your browser!

**Expected Result**: You'll see a clean, three-pane interface with:
- Left: Agents & Brains selection
- Middle: Chat with Prospyr (already has welcome message)
- Right: OmniMind deployment tasks

**Test Message**: Type "Hello Command Center!" and press Enter. You should get a detailed response from Prospyr about the deployment status.