const { Client, GatewayIntentBits } = require('discord.js');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const http = require('http');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play ')) {
        if (!message.member.voice.channel) {
            return message.reply('You need to join a voice channel first!');
        }

        const query = message.content.replace('!play ', '').trim();
        if (!query) {
            return message.reply('Please provide a song name or URL.');
        }

        const res = await ytSearch(query);
        const video = res.videos.length > 0 ? res.videos[0] : null;
        if (!video) {
            return message.reply('No results found.');
        }

        const connection = await message.member.voice.channel.join();
        const stream = ytdl(video.url, { filter: 'audioonly' });
        const dispatcher = connection.play(stream);

        dispatcher.on('start', () => {
            message.reply(`🎶 Playing: ${video.title}`);
        });

        dispatcher.on('finish', () => {
            connection.disconnect();
        });

        dispatcher.on('error', (error) => {
            console.error('Error with the audio player:', error);
            message.channel.send('There was an error playing the music. Please try again later.');
            connection.disconnect);
        });
    }
});

client.login(process.env.DISCORD_TOKEN);

// Create an HTTP server to keep the bot alive
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});