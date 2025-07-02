# Sound Royale - AI Development Context

## 🎯 **Current Priority: Phase 2B - Audio Integration**

You are helping build **Sound Royale**, a Discord-integrated music battle royale game where producers compete in real-time bingo matches.

### **Immediate Focus**
- ✅ Core game mechanics working (Phases 1A-2A complete)  
- 🔄 **BUILDING NOW**: Audio upload/playback system
- 📍 **Current File**: `src/components/AudioUpload.tsx`

## 🏗️ **Architecture**

### **Tech Stack**
```
Frontend: React 18 + TypeScript + Vite + Tailwind CSS
Backend: Supabase (PostgreSQL + Storage + Auth + Real-time)
State: TanStack React Query + custom hooks
UI: shadcn/ui + Radix primitives
Discord: OAuth + Bot (Discord.js)
```

### **File Structure**
```
src/
├── components/          # React components (GameBoard_v2, SinglePlayerMode)
├── hooks/              # React Query hooks (useMatches, useVoting, useRealtime)  
├── integrations/       # Supabase client
├── lib/               # Auth utilities
├── pages/             # Index.tsx (main entry)
├── types/             # game.ts (Player, GameState)
└── utils/             # gameLogic.ts (bingo logic)
```

## 🎮 **Game Mechanics**

### **Core Flow**
1. **5x5 bingo cards** with music genres
2. **Genre calling** (exists on ≥1 player's card)  
3. **30min production** + **5min voting** phases
4. **ELO-weighted spectator voting** (1.0x to 2.5x power)
5. **Real-time sync** via Supabase subscriptions

### **Database Schema** 
```sql
users: Discord profiles, ELO ratings, stats
matches: Game state, bingo cards, status  
votes: Weighted voting with ELO snapshots
audio_submissions: Beat uploads with metadata
```

## 🎵 **Audio System Requirements**

### **Upload Component** (CURRENT TASK)
```tsx
// File: src/components/AudioUpload.tsx
// Requirements:
- Drag & drop interface
- File validation (MP3/WAV, 10MB max, 30s-5min duration) 
- Progress indicator
- Supabase Storage integration
- Error handling & loading states
- Mobile responsive
```

### **Player Component** (NEXT)
```tsx
// File: src/components/AudioPlayer.tsx  
// Requirements:
- Play/pause controls
- Waveform visualization
- Volume control
- Playlist support for voting
- Integration with VotingPanel.tsx
```

### **Processing Utilities** (SUPPORTING)
```tsx
// File: src/utils/audioProcessing.ts
// Requirements:
- File validation helpers
- Metadata extraction
- Audio compression
- Format conversion utilities
```

## 🔧 **Development Context**

### **Existing Working Features**
- ✅ Discord OAuth authentication (`src/lib/auth.ts`)
- ✅ Real-time multiplayer (`src/hooks/useMatches.ts`, `useVoting.ts`, `useRealtime.ts`)
- ✅ Practice Mode vs AI (`src/components/SinglePlayerMode.tsx`)
- ✅ Database integration with Supabase

### **Current State**
- **Landing Page**: Practice Mode (AI) vs Multiplayer Arena
- **Game Modes**: Single-player working, multiplayer creating matches
- **Missing**: Audio upload/playback (Phase 2B priority)

### **Supabase Configuration**
```bash
# From .env.local:
VITE_SUPABASE_URL=https://futioilrogbfwpgyqlqu.supabase.co
VITE_DISCORD_CLIENT_ID=1041532193220071464
```

## 📋 **Audio Integration Checklist**

### **Phase 2B Tasks**
- [ ] **AudioUpload.tsx** - File upload with validation
- [ ] **AudioPlayer.tsx** - Playback with waveform  
- [ ] **audioProcessing.ts** - Validation & metadata utilities
- [ ] **Integration** - Connect to VotingPanel.tsx
- [ ] **Storage** - Supabase bucket configuration
- [ ] **Testing** - Upload/playback workflow

### **Technical Constraints**
- **Audio Formats**: MP3, WAV only
- **File Size**: 10MB maximum  
- **Duration**: 30 seconds to 5 minutes
- **Storage**: Supabase Storage buckets
- **Real-time**: Must sync across all spectators

## 🎨 **UI/UX Guidelines**

### **Design System**
- Use **shadcn/ui** components (`Button`, `Progress`, `Card`)
- **Tailwind CSS** for styling
- **Responsive** mobile-first design
- **Purple/pink/cyan** gradient theme
- **Loading states** for all async operations

### **Component Patterns**
```tsx
// Import pattern:
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// State management:
const { data, isLoading, error } = useQuery({...});
const mutation = useMutation({...});

// Error handling:
toast({ title: "Success!", description: "..." });
toast({ title: "Error", variant: "destructive" });
```

## 🚀 **Next Steps After Audio**

1. **Discord Bot Deployment** (Replit)
2. **Enhanced Matchmaking** (ELO-based pairing)
3. **Tournament System** (brackets, leaderboards)
4. **Discord Activity** (screen sharing, voice chat)

## 🎯 **Success Metrics**
- Users can upload beats during production phase
- Spectators can hear submissions during voting
- Real-time audio sync across all participants
- <3 second upload times, >95% success rate

---

**Use this context for all Sound Royale development assistance. Focus on Phase 2B audio integration with the existing architecture.**
