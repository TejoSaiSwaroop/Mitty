const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.once('ready', () => {
    console.log('Mitty the Mystery Box Bot is online!');
});

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.channel.send('Hello @everyone! I am the Mystery Box Bot!');
    }
});

client.on('messageCreate', message => {
    if (message.content === '!commands') {
        message.channel.send('!hello "Says hello! \n!commands "Lists all commands! \n!open "Gives a mystery challenge!');
    }
});

client.on('messageCreate', message => {
    if (message.content === '!Hola') {
        message.channel.send('Hola Amigo! I am the Mystery Box Bot!');
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