# Sound Royale - User Flow Guide

## 🎯 **Current User Experience (Fixed)**

### **Landing Page**
1. **Discord Users**: 
   - Connect Discord → Shows stats → Choose game mode
   - **Practice Mode**: Play vs AI with simulated spectators
   - **Multiplayer Arena**: Find/create real matches with other players

2. **Guest Users**:
   - Enter username → Choose game mode
   - Same options as Discord users but no persistent stats

### **Practice Mode (Single Player)**
- ✅ **Perfect for testing** - no database required
- ✅ **AI opponent** (RhythmBot) with realistic stats  
- ✅ **Simulated spectator voting** with random outcomes
- ✅ **Full game flow** - genre calling, voting, bingo detection
- ✅ **No waiting** - immediate game start

### **Multiplayer Arena**
- ✅ **Real database integration** with Supabase
- ✅ **Match creation** - creates waiting room for opponents
- ✅ **Real-time sync** via WebSocket subscriptions
- ✅ **Persistent stats** - ELO, wins/losses tracked

## 🔧 **Fixed Issues**

### ✅ **Database Errors Resolved**
- **Problem**: 400 errors when creating matches with non-existent opponent IDs
- **Solution**: Matches now create with `player2_id: null`, filled when someone joins
- **Result**: "Start New Battle" button works correctly

### ✅ **User Flow Clarified**
- **Problem**: Confusing entry point - unclear what happens after login
- **Solution**: Clear choice between Practice Mode and Multiplayer Arena
- **Result**: Users understand options and can test immediately

### ✅ **Immediate Testing Available**
- **Problem**: Users stuck waiting for opponents or database setup
- **Solution**: Practice Mode works 100% offline with AI
- **Result**: Full game experience available instantly

## 🎮 **Recommended User Journey**

### **For Development/Testing**
1. **Start with Practice Mode** to verify game mechanics work
2. **Test Discord login** to confirm authentication persists
3. **Try Multiplayer Arena** to test database integration
4. **Verify real-time features** work with multiple browser tabs

### **For Real Users**
1. **Connect Discord** for persistent stats and social features
2. **Practice Mode** to learn gameplay mechanics
3. **Multiplayer Arena** to compete with real players
4. **Discord Bot** (when deployed) for tournaments and community

## 🚀 **Next Phase: Enhanced Social Features**

### **Discord Bot Integration** `/commands`
```
/startroyale        - Create tournament room
/join #room         - Join specific match
/spectate #room     - Watch as spectator  
/leaderboard        - View server rankings
/challenge @user    - Direct challenge opponent
/stats              - Personal statistics
```

### **Discord Activity Integration**
- **Screen sharing** during battles
- **Voice chat** for real-time commentary
- **Rich presence** showing current game state
- **Embedded web app** directly in Discord

### **Matchmaking Systems**
1. **Quick Match**: Auto-pair similar ELO players
2. **Invite Links**: Share custom game URLs
3. **Tournament Brackets**: Multi-round competitions
4. **Private Rooms**: Custom game modes with friends

## 📊 **Data Persistence Strategy**

### **Discord Users**
- ✅ **Full persistence** - ELO, stats, match history
- ✅ **Cross-session** - data survives browser refresh
- ✅ **Social features** - friend challenges, server leaderboards

### **Guest Users**  
- ✅ **Session-only** - stats reset on browser refresh
- ✅ **Quick entry** - no signup required for testing
- ✅ **Upgrade path** - can connect Discord anytime to save progress

### **Data Sync**
- ✅ **Real-time** - live updates via Supabase subscriptions
- ✅ **Offline resilience** - React Query handles connection issues
- ✅ **Conflict resolution** - timestamp-based data merging

## 🎵 **Current Status**

### **✅ Working Features**
- Discord OAuth authentication
- Practice Mode with AI opponent
- Real-time multiplayer match creation
- Persistent user stats and ELO
- Responsive UI with mobile support

### **🔄 In Development** 
- Audio submission system (Phase 2B)
- Discord bot deployment to Replit
- Enhanced matchmaking algorithms
- Tournament and bracket systems

### **💡 Future Enhancements**
- Discord Activity integration
- Voice chat during matches  
- Mobile app development
- Label partnership features

## 📝 **Developer Notes**

### **Testing the Current Build**
1. **Practice Mode**: Works 100% - no database needed
2. **Discord Login**: Should persist between sessions
3. **Multiplayer**: Creates real database records
4. **Real-time**: WebSocket updates work in multiple tabs

### **Common Issues & Solutions**
- **Auth not persisting**: Check if Supabase URL/keys are correct in `.env.local`
- **Loading indefinitely**: Usually means database connection failed
- **400 errors**: Ensure database schema is properly migrated
- **Vote submissions failing**: Check that user has spectator_elo > 0

### **Ready for Production**
The current build provides a complete gaming experience and is ready for user testing. The Practice Mode ensures users can experience the full game immediately, while Multiplayer Arena demonstrates the real-time capabilities for competitive play.
