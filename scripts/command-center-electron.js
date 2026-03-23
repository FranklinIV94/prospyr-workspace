const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'ALBS Command Center - Prospyr & Northstar Integration'
  });

  // Load the Command Center web interface
  win.loadURL('http://100.101.6.44:3001');

  // Add custom menu for ALBS operations
  const menu = [
    {
      label: 'ALBS',
      submenu: [
        { label: 'Switch to Prospyr', click: () => win.webContents.send('agent-switch', 'prospyr') },
        { label: 'Switch to Northstar', click: () => win.webContents.send('agent-switch', 'northstar') },
        { type: 'separator' },
        { label: 'Check Northstar Status', click: () => win.webContents.send('check-status', 'northstar') },
        { label: 'Send Test Message', click: () => win.webContents.send('send-message', 'Hello from desktop app!') },
        { type: 'separator' },
        { label: 'Open SSH Console', click: () => {
          const { exec } = require('child_process');
          exec('gnome-terminal -- ssh ubuntu@100.92.24.43');
        }},
        { label: 'Quit', role: 'quit' }
      ]
    }
  ];

  // Create menu
  const Menu = require('electron').Menu;
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  // IPC handlers for communication
  ipcMain.on('agent-switch', (event, agent) => {
    console.log(`Switching to ${agent} agent`);
    // Could send API request to Command Center
  });

  ipcMain.on('check-status', (event, agent) => {
    fetch(`http://100.101.6.44:3001/api/health`)
      .then(res => res.json())
      .then(data => {
        event.reply('status-response', data);
      });
  });

  ipcMain.on('send-message', (event, message) => {
    // Send to Command Center message queue
    fetch('http://100.101.6.44:3001/api/northstar/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, timestamp: new Date().toISOString() })
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});