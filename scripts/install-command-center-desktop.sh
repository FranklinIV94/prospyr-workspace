#!/bin/bash
# Install Command Center Desktop Application

echo "🚀 Installing ALBS Command Center Desktop Application..."

# Method 1: Simple HTML Wrapper (works everywhere)
echo "📦 Creating HTML desktop wrapper..."
cp /home/franklin-bryant/.openclaw/workspace/scripts/command-center-wrapper.html ~/.local/share/applications/command-center.html
chmod +x ~/.local/share/applications/command-center.html

# Create desktop entry for HTML version
cat > ~/.local/share/applications/albs-command-center.desktop << 'EOF'
[Desktop Entry]
Name=ALBS Command Center (HTML)
Comment=Desktop access to Command Center with Prospyr & Northstar
Exec=xdg-open %f
MimeType=text/html;
Icon=web-browser
Terminal=false
Type=Application
Categories=Utility;Network;
StartupNotify=false
EOF

# Method 2: Electron App (more features)
echo "⚡ Setting up Electron application..."
mkdir -p ~/.config/albs-command-center/
cp /home/franklin-bryant/.openclaw/workspace/scripts/command-center-electron.js ~/.config/albs-command-center/
cp /home/franklin-bryant/.openclaw/workspace/scripts/package.json ~/.config/albs-command-center/

# Create Electron desktop entry
cat > ~/.local/share/applications/albs-command-center-electron.desktop << 'EOF'
[Desktop Entry]
Name=ALBS Command Center (Electron)
Comment=Advanced desktop app with Prospyr & Northstar integration
Exec=/usr/bin/electron /home/franklin-bryant/.openclaw/workspace/scripts/command-center-electron.js
Icon=system-run
Terminal=false
Type=Application
Categories=Utility;Network;
StartupNotify=false
EOF

# Make sure we have electron installed
if ! command -v electron >/dev/null 2>&1; then
    echo "⚠️ Electron not found. Installing..."
    # Try npm install if available
    if command -v npm >/dev/null 2>&1; then
        cd ~/.config/albs-command-center/ && npm install electron --save-dev
    else
        echo "💡 Please install Electron: npm install -g electron"
    fi
fi

# Method 3: Quick launcher script
echo "🔧 Creating quick launch script..."
cp /home/franklin-bryant/.openclaw/workspace/scripts/command-center-desktop.sh ~/.local/bin/command-center
chmod +x ~/.local/bin/command-center

# Update desktop database
update-desktop-database ~/.local/share/applications/

echo "✅ Installation complete!"
echo ""
echo "🎯 Access methods:"
echo "1. Search for 'ALBS Command Center' in your applications menu"
echo "2. Run: command-center (from terminal)"
echo "3. Open: ~/.local/share/applications/command-center.html"
echo ""
echo "The desktop application connects to:"
echo "   • Command Center: http://100.101.6.44:3001"
echo "   • Northstar: 100.92.24.43 (SSH access)"
echo "   • Both Prospyr and Northstar agents integrated"

# Test connection
echo ""
echo "🔍 Testing connection..."
if curl -s --connect-timeout 3 http://100.101.6.44:3001/api/health >/dev/null 2>&1; then
    echo "✅ Command Center accessible"
else
    echo "⚠️ Command Center not responding - check Tailscale network"
fi