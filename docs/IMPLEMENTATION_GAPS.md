# Sound Royale - Implementation Gaps & TDD Roadmap

## Overview
This document outlines the critical gaps in the Sound Royale implementation and provides a Test-Driven Development (TDD) approach to building each feature systematically.

## 🔴 Critical Gaps (Must Fix for MVP)

### 1. Audio Integration System
**Current State:** Complete audio system missing  
**Impact:** Players can't submit beats, spectators can't hear submissions before voting  
**TDD Approach:**
```
RED: Write test for audio upload functionality
GREEN: Implement basic file upload to Supabase Storage
REFACTOR: Add audio validation, compression, and metadata extraction
```

**Test Cases:**
- [ ] Audio file upload (MP3, WAV support)
- [ ] File size validation (max 10MB)
- [ ] Audio duration limits (30 seconds - 5 minutes)
- [ ] Playback functionality for spectators
- [ ] Audio storage cleanup after matches

### 2. Real User Authentication
**Current State:** Mock username input only  
**Impact:** No user persistence, can't track real ELO/stats  
**TDD Approach:**
```
RED: Write test for Discord OAuth login flow
GREEN: Implement Supabase Auth with Discord provider
REFACTOR: Add session management and user state persistence
```

**Test Cases:**
- [ ] Discord OAuth login/logout
- [ ] User session persistence
- [ ] Profile creation from Discord data
- [ ] Guest user handling
- [ ] User role/permission management

### 3. Backend Database Operations
**Current State:** Supabase configured but no operations  
**Impact:** All data is mock, no real game persistence  
**TDD Approach:**
```
RED: Write tests for game state CRUD operations
GREEN: Implement React Query hooks for Supabase operations
REFACTOR: Add optimistic updates and error handling
```

**Test Cases:**
- [ ] Create/join match operations
- [ ] Real-time game state synchronization
- [ ] Player statistics persistence
- [ ] Vote submission and tallying
- [ ] ELO calculation and updates

## 🟡 Important Gaps (Post-MVP)

### 4. Real-time Multiplayer Synchronization
**Current State:** No WebSocket connections  
**Impact:** Players don't see each other's actions in real-time  
**TDD Approach:**
```
RED: Write tests for real-time event handling
GREEN: Implement Supabase real-time subscriptions
REFACTOR: Add connection resilience and offline handling
```

**Test Cases:**
- [ ] Real-time game state updates
- [ ] Live voting progress
- [ ] Player connection/disconnection handling
- [ ] Spectator count updates
- [ ] Match status broadcasting

### 5. Music Metadata Integration
**Current State:** Static genre list  
**Impact:** Limited genre variety, no music discovery  
**TDD Approach:**
```
RED: Write tests for music API integration
GREEN: Implement Spotify Web API for genre/track data
REFACTOR: Add caching and fallback systems
```

**Test Cases:**
- [ ] Spotify API authentication
- [ ] Genre discovery and expansion
- [ ] Track metadata enrichment
- [ ] API rate limiting handling
- [ ] Offline fallback genres

### 6. Advanced Handicap System
**Current State:** UI designed but not functional  
**Impact:** No strategic depth in gameplay  
**TDD Approach:**
```
RED: Write tests for handicap effects
GREEN: Implement each handicap's game logic
REFACTOR: Balance handicap power and cost
```

**Test Cases:**
- [ ] Blind Spot: Hide opponent's card for 1 round
- [ ] Double Trouble: Mark 2 squares if you win
- [ ] Coin Monsoon: Steal opponent's coins
- [ ] ELO Shift: Temporary ELO boost/reduction

## 🟢 Polish Gaps (Future Enhancements)

### 7. Discord Voice Integration
**Current State:** Text-based bot only  
**Impact:** No live performance streaming  

### 8. Mobile Optimization
**Current State:** Desktop-focused UI  
**Impact:** Limited mobile user experience  

### 9. Advanced Analytics
**Current State:** Basic stats only  
**Impact:** No deep insights for players  

## TDD Implementation Priority

### Phase 1: Core Functionality (Week 1-2)
1. **Audio System** - Most critical for game function
2. **User Authentication** - Required for real users
3. **Database Operations** - Backend foundation

### Phase 2: Real-time Features (Week 3-4)
4. **WebSocket Integration** - Live multiplayer
5. **Music API** - Enhanced content
6. **Handicap System** - Gameplay depth

### Phase 3: Polish (Week 5+)
7. **Voice Integration** - Professional experience
8. **Mobile Optimization** - User accessibility
9. **Analytics** - User retention

## Test Environment Setup

### Required Test Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Test Structure
```
tests/
├── unit/           # Component and utility tests
├── integration/    # API and database tests  
├── e2e/           # Full user flow tests
└── mocks/         # Mock data and services
```

### Testing Strategy
- **Unit Tests**: 80% coverage for utils and components
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Complete user journeys from Discord to game completion

## Success Metrics
- [ ] Users can complete full game cycle (join → play → vote → results)
- [ ] Real audio submissions and playback working
- [ ] Zero data loss during real-time gameplay
- [ ] Sub-3 second response times for all operations
- [ ] 99% uptime for Discord bot integration
