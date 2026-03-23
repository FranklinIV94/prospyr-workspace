# Command Center

A mission-critical multi-agent AI dashboard with intelligent routing, cost tracking, and real-time observability.

## 🚀 Local Installation (Linux)

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (optional, for containerized deployment)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/command-center.git
cd command-center
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
GEMINI_API_KEY=your_key_here
NODE_ENV=production
```

### 3. Build & Start
```bash
npm run build
npm start
```
The app will be available at `http://localhost:3000`.

## 🐳 Docker Deployment
```bash
docker-compose up -d --build
```

## 🛠 Architecture
- **Backend**: Node.js/Express with SQLite persistence.
- **Frontend**: React 19 + Tailwind CSS 4.
- **Real-time**: WebSockets for agent/task sync.
- **Routing**: Weighted scoring engine (Capability, Cost, Health).
- **Agents**: Supports local (Ollama) and cloud (DeepSeek, Gemini) agents.

## 📁 Project Structure
- `server.ts`: Main entry point & API Gateway.
- `src/database/db.ts`: SQLite schema & seeding.
- `src/services/routerEngine.ts`: Intelligent routing logic.
- `src/App.tsx`: Real-time dashboard frontend.
