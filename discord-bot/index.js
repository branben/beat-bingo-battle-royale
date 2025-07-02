import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join a Sound Royale match as a competitor'),
  
  new SlashCommandBuilder()
    .setName('spectate')
    .setDescription('Join a Sound Royale match as a spectator'),
  
  new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote for a competitor during the voting phase')
    .addStringOption(option =>
      option.setName('player')
        .setDescription('Which player to vote for')
        .setRequired(true)
        .addChoices(
          { name: 'Player 1', value: 'player1' },
          { name: 'Player 2', value: 'player2' }
        )),
  
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your Sound Royale stats and current match status'),
  
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the Sound Royale leaderboard'),

  new SlashCommandBuilder()
    .setName('handicap')
    .setDescription('Use a handicap during your turn')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of handicap to use')
        .setRequired(true)
        .addChoices(
          { name: 'Blind Opponent', value: 'blind' },
          { name: 'Extra Time', value: 'time' },
          { name: 'Genre Hint', value: 'hint' }
        ))
];

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('🔄 Started refreshing application (/) commands...');
    console.log(`📋 Registering ${commands.length} commands...`);
    
    // Clear both global AND guild commands to remove old ones like /lol
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('🗑️ Cleared global commands.');
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );
    console.log('🗑️ Cleared guild commands.');
    
    // Wait a moment for Discord to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Then register our new commands
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    
    console.log(`✅ Successfully registered ${data.length} application (/) commands:`);
    data.forEach(cmd => console.log(`   - /${cmd.name}: ${cmd.description}`));
    
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    if (error.code === 50001) {
      console.error('Missing Access - Check bot permissions and server membership');
    }
    if (error.code === 10002) {
      console.error('Unknown Application - Check CLIENT_ID is correct');
    }
  }
}

// Bot event handlers
client.once('ready', async () => {
  console.log(`🎵 Sound Royale Bot is online as ${client.user.tag}!`);
  client.user.setActivity('Sound Royale battles', { type: 'WATCHING' });
  
  // Register commands after bot is ready
  await registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'join':
        await handleJoinCommand(interaction);
        break;
      case 'spectate':
        await handleSpectateCommand(interaction);
        break;
      case 'vote':
        await handleVoteCommand(interaction);
        break;
      case 'status':
        await handleStatusCommand(interaction);
        break;
      case 'leaderboard':
        await handleLeaderboardCommand(interaction);
        break;
      case 'handicap':
        await handleHandicapCommand(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown command!', flags: [64] });
    }
  } catch (error) {
    console.error('Error handling command:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error executing this command!', flags: [64] });
    }
  }
});

// Command handlers
async function handleJoinCommand(interaction) {
  await interaction.reply({
    content: `🎵 **Welcome to Sound Royale!**\\n\\n` +
             `You're joining as a competitor. Click the link below to enter the battle arena:\\n` +
             `${process.env.WEB_APP_URL || 'http://localhost:8080'}\\n\\n` +
             `Good luck, beat maker! 🎧`,
    flags: []
  });
}

async function handleSpectateCommand(interaction) {
  await interaction.reply({
    content: `👀 **Joining as a spectator!**\\n\\n` +
             `Watch the battle unfold and vote for your favorite beats:\\n` +
             `${process.env.WEB_APP_URL || 'http://localhost:8080'}\\n\\n` +
             `Your votes matter - help decide the winner! 🗳️`,
    flags: []
  });
}

async function handleVoteCommand(interaction) {
  const player = interaction.options.getString('player');
  
  await interaction.reply({
    content: `🗳️ **Vote submitted for ${player}!**\\n\\n` +
             `Thank you for participating in the voting process.\\n` +
             `Check the web app for live results!`,
    flags: [64] // 64 = EPHEMERAL flag
  });
}

async function handleStatusCommand(interaction) {
  await interaction.reply({
    content: `📊 **Your Sound Royale Stats**\\n\\n` +
             `🏆 Competitor ELO: 1200 (Silver III)\\n` +
             `👀 Spectator ELO: 1150\\n` +
             `💰 Coins: 250\\n` +
             `✅ Wins: 15 | ❌ Losses: 8\\n` +
             `🎯 Correct Votes: 45\\n\\n` +
             `View detailed stats: ${process.env.WEB_APP_URL || 'http://localhost:8080'}`,
    flags: [64] // 64 = EPHEMERAL flag
  });
}

async function handleLeaderboardCommand(interaction) {
  await interaction.reply({
    content: `🏆 **Sound Royale Leaderboard**\\n\\n` +
             `1. 🥇 BeatMaster_2024 - 1250 ELO\\n` +
             `2. 🥈 RhythmKing - 1180 ELO\\n` +
             `3. 🥉 SoundWave - 1150 ELO\\n\\n` +
             `View full leaderboard: ${process.env.WEB_APP_URL || 'http://localhost:8080'}`,
    flags: []
  });
}

async function handleHandicapCommand(interaction) {
  const handicapType = interaction.options.getString('type');
  
  const handicapMessages = {
    'blind': '🙈 **Blind Opponent** handicap activated! Your opponent cannot see the current genre.',
    'time': '⏰ **Extra Time** handicap activated! You have an additional 10 minutes to produce.',
    'hint': '💡 **Genre Hint** handicap activated! You received a hint about the upcoming genre.'
  };
  
  await interaction.reply({
    content: handicapMessages[handicapType] || 'Unknown handicap type.',
    flags: []
  });
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
