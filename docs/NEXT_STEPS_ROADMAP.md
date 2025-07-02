# Sound Royale - Next Steps Roadmap

## Current Status ✅
- [x] Name changed to "Sound Royale"
- [x] Player ready simulation working
- [x] Discord bot commands functional locally
- [x] Core game UI and logic complete
- [ ] Discord bot working on Replit (in progress)

## Week 1 Priority: Audio Integration

### Day 1-2: Setup & Test Framework
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Configure Vitest
# Create tests/setup.js
# Update package.json scripts
```

### Day 3-4: Audio Upload Component
**TDD Steps:**
1. Write test for `AudioUpload` component
2. Create basic file upload UI
3. Connect to Supabase Storage
4. Add file validation (MP3/WAV, 10MB max)

### Day 5-7: Audio Playback System
**TDD Steps:**
1. Write test for `AudioPlayer` component  
2. Implement basic playback controls
3. Add to voting panel for spectators
4. Test with real audio files

## Week 2 Priority: Real Authentication

### Discord OAuth Setup
1. Configure Supabase Auth provider
2. Replace mock username with real Discord login
3. Create user profiles from Discord data
4. Test login/logout flow

### User State Management
1. Add user context/hooks
2. Connect to game state
3. Persist user preferences
4. Handle guest users

## Week 3-4: Database Integration

### Game State Persistence
1. Replace mock game data with Supabase tables
2. Implement real-time subscriptions
3. Add React Query hooks
4. Test multiplayer synchronization

### ELO & Statistics
1. Implement real ELO calculations
2. Store match results
3. Create leaderboard queries
4. Add player statistics tracking

## Success Criteria for Phase 1

### Must Have:
- [ ] Users can upload and play audio files
- [ ] Discord OAuth login working
- [ ] Basic game data persisted to Supabase
- [ ] Real-time updates between players

### Should Have:
- [ ] Audio validation and compression
- [ ] User session management
- [ ] Error handling and loading states
- [ ] Mobile-responsive design

### Nice to Have:
- [ ] Audio waveform visualization
- [ ] Advanced file format support
- [ ] Offline capability
- [ ] Performance analytics

## Risk Mitigation

### Technical Risks:
1. **Audio file size/quality issues**
   - Solution: Implement client-side compression
   - Fallback: Server-side processing with FFmpeg

2. **Real-time sync complexity**
   - Solution: Start with simple polling
   - Upgrade: Supabase real-time when stable

3. **User authentication edge cases**
   - Solution: Comprehensive error handling
   - Fallback: Guest mode with limited features

### Business Validation:
1. **Will users actually upload beats?**
   - Test: Start with close beta group
   - Metric: Upload completion rate >70%

2. **Is the voting system engaging?**
   - Test: Track spectator participation
   - Metric: Voting participation rate >60%

## Development Workflow

### TDD Cycle:
1. **RED:** Write failing test for new feature
2. **GREEN:** Write minimal code to pass test
3. **REFACTOR:** Clean up and optimize
4. **COMMIT:** Save progress with clear message

### Testing Strategy:
- **Unit Tests:** Components and utilities (80% coverage)
- **Integration Tests:** API calls and database operations
- **E2E Tests:** Complete user journeys

### Code Review Checklist:
- [ ] Tests written and passing
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Mobile compatibility verified
- [ ] Security best practices followed

## Tools & Resources Needed

### Development:
- Vitest for testing
- React Query for state management
- Supabase CLI for database migrations
- Discord.js for bot integration

### Audio Processing:
- Web Audio API for client-side processing
- FFmpeg (future) for server-side processing
- Waveform.js for visualization

### Monitoring:
- Supabase dashboard for database metrics
- Vercel analytics for web app performance
- Discord bot logs for command usage

## Next Review Points

### After Week 1:
- Review audio upload implementation
- Test with real users if possible
- Adjust timeline based on complexity

### After Week 2:
- Evaluate authentication flow
- Plan real-time features
- Consider performance optimizations

### After Phase 1:
- Conduct user testing sessions
- Gather feedback on core features
- Plan Phase 2 priorities

---

**Start Date:** December 28, 2024  
**Phase 1 Target:** January 11, 2025  
**Review Schedule:** Weekly on Fridays
