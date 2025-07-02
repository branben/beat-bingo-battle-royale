# Gemini CLI Integration for Sound Royale Development

## 🚀 Setup & Installation

### 1. Install Gemini CLI
```bash
# Install Google AI CLI
npm install -g @google/generative-ai-cli
# or
pip install google-generativeai

# Authenticate with your Google account
gemini auth login
```

### 2. Set API Key
```bash
# Get API key from https://makersuite.google.com/app/apikey
export GEMINI_API_KEY="your_api_key_here"

# Add to your shell profile (.bashrc, .zshrc, etc.)
echo 'export GEMINI_API_KEY="your_api_key_here"' >> ~/.zshrc
```

## 🎯 Sound Royale Development Workflows

### **Phase 2B: Audio Integration (High Priority)**

#### Generate Audio Upload Component
```bash
gemini generate code \
  --context "React TypeScript component for audio file upload with validation" \
  --requirements "MP3/WAV support, 10MB max, duration 30s-5min, Supabase Storage integration" \
  --framework "React + TypeScript + Tailwind CSS" \
  --output "src/components/AudioUpload.tsx"
```

#### Design Audio Player Component
```bash
gemini generate code \
  --context "Audio playback component for spectator voting" \
  --requirements "Play/pause, waveform visualization, volume control, playlist support" \
  --dependencies "@/components/ui/button, Web Audio API" \
  --output "src/components/AudioPlayer.tsx"
```

#### Create Audio Processing Utilities
```bash
gemini generate code \
  --context "Audio file processing utilities" \
  --requirements "File validation, metadata extraction, compression, format conversion" \
  --libraries "Web Audio API, ffmpeg.wasm" \
  --output "src/utils/audioProcessing.ts"
```

### **Testing & Quality Assurance**

#### Generate Comprehensive Test Suite
```bash
gemini generate tests \
  --codebase "./src" \
  --framework "Vitest + Testing Library" \
  --coverage "unit, integration, e2e" \
  --focus "game logic, authentication, real-time features" \
  --output "./tests/"
```

#### Create Mock Data Generators
```bash
gemini generate code \
  --context "Mock data generators for Sound Royale testing" \
  --requirements "Realistic user profiles, match states, voting patterns" \
  --output "src/mocks/generators.ts"
```

### **Discord Bot Enhancement**

#### Generate Discord Commands
```bash
gemini generate code \
  --context "Discord.js slash commands for Sound Royale" \
  --requirements "/startroyale, /join, /spectate, /leaderboard, /challenge" \
  --integration "Supabase database, match creation API" \
  --output "discord-bot/commands/"
```

#### Create Bot Event Handlers
```bash
gemini generate code \
  --context "Discord bot event handlers for real-time game updates" \
  --requirements "Match notifications, voting reminders, tournament announcements" \
  --output "discord-bot/events/"
```

## 📝 Custom Prompt Templates

### **Sound Royale Context Prompt**
Create a file `prompts/sound-royale-context.txt`:
```
You are helping develop Sound Royale, a Discord-integrated music battle royale game.

TECH STACK:
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL + Real-time + Storage + Auth)
- State: TanStack React Query + Zustand
- UI: shadcn/ui + Radix primitives
- Discord: Discord.js bot + OAuth integration

ARCHITECTURE:
- Real-time multiplayer bingo with music genres
- ELO-based competitive ranking system  
- Weighted spectator voting (ELO determines vote power)
- Audio submission system (30 second beats)
- Discord bot for tournaments and social features

CURRENT STATUS:
- ✅ Phase 1: Core game mechanics + Discord auth
- ✅ Phase 2A: Real database integration
- 🔄 Phase 2B: Audio integration (CURRENT PRIORITY)
- 🔄 Phase 3: Discord bot deployment + Activities

Always consider:
- Mobile responsiveness
- Real-time synchronization
- Audio quality standards
- Discord community integration
- Performance optimization
- Security best practices
```

### **Quick Generation Commands**

#### Feature Development
```bash
# Generate new game feature
gemini generate feature \
  --context "$(cat prompts/sound-royale-context.txt)" \
  --feature "handicap system with blind spot, double trouble, coin steal" \
  --output "src/features/handicaps/"

# Generate API integration
gemini generate api \
  --context "$(cat prompts/sound-royale-context.txt)" \
  --service "Spotify Web API for genre discovery" \
  --output "src/integrations/spotify/"
```

#### Bug Fixing & Optimization
```bash
# Analyze and fix performance issues
gemini analyze performance \
  --codebase "./src" \
  --focus "React Query caching, WebSocket optimization, audio processing"

# Generate error handling improvements
gemini generate error-handling \
  --context "$(cat prompts/sound-royale-context.txt)" \
  --components "audio upload, real-time voting, match creation"
```

## 🎵 Phase 2B: Audio Integration Roadmap

### **Week 1: Audio Upload System**
```bash
# Day 1-2: File Upload Component
gemini generate component AudioUpload \
  --features "drag-drop, progress bar, validation, preview" \
  --integration "Supabase Storage" \
  --styling "shadcn/ui + Tailwind"

# Day 3-4: Audio Validation & Processing  
gemini generate utilities \
  --context "Audio file validation and processing" \
  --features "format check, duration limits, compression, metadata"

# Day 5-7: Integration Testing
gemini generate tests \
  --focus "audio upload workflow, file validation, storage integration"
```

### **Week 2: Audio Playback System**
```bash
# Day 1-3: Audio Player Component
gemini generate component AudioPlayer \
  --features "waveform, controls, playlist, volume" \
  --libraries "Web Audio API, wavesurfer.js"

# Day 4-5: Voting Integration
gemini generate integration \
  --context "Audio playback during spectator voting phase" \
  --features "synchronized playback, vote submission, real-time updates"

# Day 6-7: Mobile Optimization
gemini generate mobile-optimizations \
  --focus "audio playback, touch controls, performance"
```

## 🤖 Advanced Gemini Workflows

### **Architectural Decisions**
```bash
# Get architectural advice
gemini analyze architecture \
  --context "$(cat prompts/sound-royale-context.txt)" \
  --question "Best approach for real-time audio synchronization across multiple users?"

# Compare implementation options
gemini compare solutions \
  --problem "Audio streaming for live voting" \
  --options "WebRTC, Supabase Storage, AWS S3, direct file sharing"
```

### **Code Review & Refactoring**
```bash
# Review specific components
gemini review code \
  --file "src/components/GameBoard_v2.tsx" \
  --focus "performance, maintainability, best practices"

# Suggest refactoring opportunities
gemini refactor \
  --codebase "./src/hooks" \
  --patterns "custom hooks, type safety, error handling"
```

### **Documentation Generation**
```bash
# Generate API documentation
gemini generate docs \
  --codebase "./src/hooks" \
  --format "JSDoc + TypeScript" \
  --output "./docs/api/"

# Create deployment guides
gemini generate guide \
  --context "Sound Royale deployment to production" \
  --platforms "Vercel (web), Replit (Discord bot), Supabase (database)"
```

## 💡 Pro Tips for Gemini CLI with Sound Royale

### **1. Context-Aware Prompts**
Always include your project context file to get relevant suggestions:
```bash
gemini generate --context "$(cat prompts/sound-royale-context.txt)" [your_request]
```

### **2. Iterative Development**
Use Gemini for rapid prototyping, then refine:
```bash
# Generate initial implementation
gemini generate component VotingSystem

# Refine with feedback
gemini refine --feedback "needs real-time updates and mobile optimization"
```

### **3. Domain-Specific Knowledge**
Leverage Gemini's knowledge of music technology:
```bash
gemini suggest libraries \
  --domain "web audio processing, music visualization, real-time audio"
  --constraints "TypeScript, browser-compatible, lightweight"
```

### **4. Integration Testing**
Generate integration tests for complex workflows:
```bash
gemini generate integration-tests \
  --workflow "Discord login → match creation → audio upload → voting → ELO update"
```

## 🚀 Next Steps

1. **Set up Gemini CLI** with your API key
2. **Create context prompts** specific to Sound Royale
3. **Start with Phase 2B** audio integration using Gemini assistance
4. **Use iterative prompting** to refine implementations
5. **Generate comprehensive tests** for quality assurance

This approach will dramatically accelerate your development while maintaining code quality and architectural consistency!
