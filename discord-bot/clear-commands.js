import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function clearAllCommands() {
  try {
    console.log('🗑️ Clearing all existing commands...');
    
    // Clear guild commands (server-specific)
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );
    console.log('✅ Cleared guild commands');
    
    // Clear global commands (all servers)
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log('✅ Cleared global commands');
    
    console.log('🎉 All commands cleared! Old commands like /lol should be gone.');
    console.log('💡 Now run your main bot to register new commands.');
    
  } catch (error) {
    console.error('❌ Error clearing commands:', error);
    
    if (error.code === 50001) {
      console.error('💔 Missing Access: Check bot permissions and make sure it\'s in the server');
    }
    if (error.code === 10002) {
      console.error('💔 Unknown Application: Check your CLIENT_ID is correct');
    }
  }
}

clearAllCommands();
