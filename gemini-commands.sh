#!/bin/bash

# Sound Royale Gemini CLI Quick Commands
# Usage: chmod +x gemini-commands.sh && ./gemini-commands.sh [command]

# Set context file path  
CONTEXT_FILE="GEMINI.md"

# Check if Gemini CLI is installed
check_gemini() {
    if ! command -v gemini &> /dev/null; then
        echo "❌ Gemini CLI not found. Install with: npm install -g @google/generative-ai-cli"
        exit 1
    fi
}

# Phase 2B: Audio Integration Commands
audio_upload() {
    echo "🎵 Generating Audio Upload Component..."
    local prompt="$(cat $CONTEXT_FILE)

Create a React TypeScript component for audio file upload with:
- Drag & drop interface
- File validation (MP3/WAV, 10MB max, 30s-5min duration)
- Progress bar during upload
- Supabase Storage integration
- Error handling and loading states
- shadcn/ui components and Tailwind CSS styling
- Mobile responsive design

Return only the complete TypeScript code for src/components/AudioUpload.tsx"
    
    gemini -p "$prompt" > src/components/AudioUpload_generated.tsx
    echo "📁 Generated: src/components/AudioUpload_generated.tsx"
}

audio_player() {
    echo "🎧 Generating Audio Player Component..."
    local prompt="$(cat $CONTEXT_FILE)

Create a React TypeScript audio player component for spectator voting with:
- Play/pause controls
- Waveform visualization
- Volume control
- Playlist support for multiple submissions
- Integration with Web Audio API
- shadcn/ui components and Tailwind CSS styling
- Mobile responsive design

Return only the complete TypeScript code for src/components/AudioPlayer.tsx"
    
    gemini -p "$prompt" > src/components/AudioPlayer_generated.tsx
    echo "📁 Generated: src/components/AudioPlayer_generated.tsx"
}

audio_utils() {
    echo "🔧 Generating Audio Processing Utilities..."
    local prompt="$(cat $CONTEXT_FILE)\n\nCreate TypeScript utilities for audio file processing including validation, metadata extraction, compression, and format conversion. Use Web Audio API and ensure browser compatibility."
    
    gemini code --prompt "$PROMPTS/sound-royale-context.txt" --language typescript --output "src/utils/audioProcessing.ts" "Create audio processing utilities including format conversion, BPM detection, and waveform analysis"
    echo "📁 Generated: src/utils/audioProcessing.ts"
}

# Testing Commands
generate_tests() {
    echo "🧪 Generating Test Suite..."
    gemini generate tests \
        --context "$(cat $CONTEXT_FILE)" \
        --codebase "./src" \
        --framework "Vitest + Testing Library" \
        --focus "game logic, real-time features, audio processing" \
        --output "./tests/"
}

# Discord Bot Commands
discord_commands() {
    echo "🤖 Generating Discord Bot Commands..."
    gemini generate code \
        --context "$(cat $CONTEXT_FILE)" \
        --prompt "Create Discord.js slash commands for Sound Royale: /startroyale (create tournament), /join (join match), /spectate (watch game), /leaderboard (show rankings), /challenge (direct challenge). Integrate with Supabase database." \
        --output "discord-bot/commands/"
}

# Code Review & Analysis
review_code() {
    local file=$1
    if [ -z "$file" ]; then
        echo "Usage: ./gemini-commands.sh review [file_path]"
        exit 1
    fi
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        exit 1
    fi
    
    echo "👀 Reviewing code: $file"
    local prompt="$(cat $CONTEXT_FILE)

CURRENT CODE TO REVIEW:
\`\`\`typescript
$(cat "$file")
\`\`\`

Please review this code focusing on:
- Performance optimizations
- Maintainability and code structure  
- TypeScript best practices
- React patterns and hooks usage
- Integration with existing Sound Royale architecture
- Error handling and edge cases
- Mobile responsiveness
- Security considerations

Provide specific suggestions for improvement."
    
    gemini -p "$prompt"
}

# Architecture Advice
architecture() {
    local question=$1
    if [ -z "$question" ]; then
        echo "Usage: ./gemini-commands.sh architecture 'your question'"
        exit 1
    fi
    
    echo "🏗️ Getting architectural advice..."
    local prompt="$(cat $CONTEXT_FILE)

ARCHITECTURAL QUESTION: $question

Please provide detailed technical advice considering:
- Sound Royale's current architecture and tech stack
- Real-time multiplayer requirements
- Audio processing and streaming needs
- Supabase integration patterns
- Performance and scalability considerations
- Security best practices
- Mobile and cross-platform compatibility

Provide specific implementation recommendations with code examples if relevant."
    
    gemini -p "$prompt"
}

# Feature Generation
feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo "Usage: ./gemini-commands.sh feature 'feature description'"
        exit 1
    fi
    
    echo "✨ Generating feature: $feature_name"
    gemini generate feature \
        --context "$(cat $CONTEXT_FILE)" \
        --feature "$feature_name" \
        --output "src/features/"
}

# Documentation Generation
docs() {
    echo "📚 Generating Documentation..."
    gemini generate docs \
        --context "$(cat $CONTEXT_FILE)" \
        --codebase "./src" \
        --format "Markdown + JSDoc" \
        --output "./docs/"
}

# Performance Analysis
performance() {
    echo "⚡ Analyzing Performance..."
    gemini analyze performance \
        --context "$(cat $CONTEXT_FILE)" \
        --codebase "./src" \
        --focus "React Query optimization, WebSocket efficiency, audio processing performance"
}

# Deployment Guide
deployment() {
    echo "🚀 Generating Deployment Guide..."
    gemini generate guide \
        --context "$(cat $CONTEXT_FILE)" \
        --topic "Production deployment to Vercel (web app), Replit (Discord bot), and Supabase (database)" \
        --output "DEPLOYMENT_GUIDE.md"
}

# Help function
help() {
    echo "🎵 Sound Royale Gemini CLI Commands"
    echo ""
    echo "Phase 2B - Audio Integration:"
    echo "  audio-upload     Generate audio upload component"
    echo "  audio-player     Generate audio player component" 
    echo "  audio-utils      Generate audio processing utilities"
    echo ""
    echo "Testing & Quality:"
    echo "  tests           Generate comprehensive test suite"
    echo "  review [file]   Review specific code file"
    echo "  performance     Analyze performance bottlenecks"
    echo ""
    echo "Discord Features:"
    echo "  discord         Generate Discord bot commands"
    echo ""
    echo "Development:"
    echo "  feature [desc]  Generate new feature"
    echo "  architecture [q] Get architectural advice"
    echo "  docs            Generate documentation"
    echo "  deployment      Generate deployment guide"
    echo ""
    echo "Example usage:"
    echo "  ./gemini-commands.sh audio-upload"
    echo "  ./gemini-commands.sh review src/components/GameBoard_v2.tsx"
    echo "  ./gemini-commands.sh architecture 'How to implement real-time audio sync?'"
}

# Main command router
main() {
    check_gemini
    
    case $1 in
        "audio-upload"|"upload")
            audio_upload
            ;;
        "audio-player"|"player")
            audio_player
            ;;
        "audio-utils"|"utils")
            audio_utils
            ;;
        "tests"|"test")
            generate_tests
            ;;
        "discord"|"bot")
            discord_commands
            ;;
        "review")
            review_code $2
            ;;
        "architecture"|"arch")
            architecture "$2"
            ;;
        "feature")
            feature "$2"
            ;;
        "docs"|"documentation")
            docs
            ;;
        "performance"|"perf")
            performance
            ;;
        "deployment"|"deploy")
            deployment
            ;;
        "help"|"-h"|"--help"|"")
            help
            ;;
        *)
            echo "❌ Unknown command: $1"
            echo "Run './gemini-commands.sh help' for available commands"
            exit 1
            ;;
    esac
}

./gemini-commands.sh refresh-context
main "$@"
