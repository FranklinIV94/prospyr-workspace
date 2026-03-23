#!/bin/bash
# Command Center Desktop Application Installer
# Creates a desktop app that connects to Command Center with Prospyr + Northstar integration

echo "🚀 Setting up Command Center Desktop Application..."

# Create desktop app directory
mkdir -p ~/.local/share/applications/
mkdir -p ~/.config/command-center/

# Create the desktop entry
cat > ~/.local/share/applications/command-center.desktop << 'EOF'
[Desktop Entry]
Name=ALBS Command Center
Comment=AI Coordination Hub for Prospyr and Northstar
Exec=/home/franklin-bryant/.openclaw/workspace/scripts/command-center-launcher.sh
Icon=system-run
Terminal=false
Type=Application
Categories=Utility;Network;
StartupNotify=false
EOF

# Create the launcher script
cat > /home/franklin-bryant/.openclaw/workspace/scripts/command-center-launcher.sh << 'EOF'
#!/bin/bash
# Command Center Desktop Launcher
# Connects to Command Center with Prospyr + Northstar integration

CC_URL="http://100.101.6.44:3001"
NORTHSTAR_IP="100.92.24.43"

echo "🎯 Launching ALBS Command Center..."
echo "📍 Command Center: $CC_URL"
echo "🤖 Northstar: $NORTHSTAR_IP"

# Check if Command Center is accessible
if curl -s --connect-timeout 5 "$CC_URL/api/health" >/dev/null 2>&1; then
    echo "✅ Command Center online"
else
    echo "⚠️ Command Center not responding - checking Tailscale..."
    if ping -c 1 100.101.6.44 >/dev/null 2>&1; then
        echo "✅ Tailscale network OK - Command Center may be starting"
    else
        echo "❌ Network issue - check Tailscale"
        exit 1
    fi
fi

# Launch in default browser
xdg-open "$CC_URL" &

# Also open Northstar interface
xdg-open "$CC_URL/northstar" &

echo " launched Command Center and Northstar interfaces"
echo "Use the web interface to switch between Prospyr and Northstar agents"
echo "For direct SSH access: ssh ubuntu@$NORTHSTAR_IP"

# Optional: Start local monitoring
# (Can be expanded later for real-time status)
EOF

# Make scripts executable
chmod +x /home/franklin-bryant/.openclaw/workspace/scripts/command-center-launcher.sh
chmod +x /home/franklin-bryant/.openclaw/workspace/scripts/command-center-desktop.sh

echo "✅ Desktop application setup complete!"
echo "➡️ Run: ./command-center-desktop.sh to install"
echo "➡️ Then search for 'ALBS Command Center' in your applications menu"