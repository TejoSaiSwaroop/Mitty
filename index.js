const { Client, GatewayIntentBits } = require('discord.js');
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

client.on('guildCreate', guild => {
    console.log(`Aye Hey Mitty is here to liven up the server!`);
}
)

const mysteryItems = [
    "🎁 Mini Challenge: Share a funny meme!",
    "🎁 You are now the 'Meme Master' for 24 hours!",
    "🎁 Compliment the user above you in chat!",
    "🎁 Share a fun fact!",
    "🎁 Sike you got nothing lol!",
];

client.on('messageCreate', message => {
    if (message.content === '!open') {
        const randomItem = mysteryItems[Math.floor(Math.random() * mysteryItems.length)];
        message.channel.send(randomItem);
    }
});

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.channel.send('Hello @everyone! I am the Mystery Box Bot!');
    }
});
client.on('messageCreate', message => {
    if (message.content === '!commands') {
        message.channel.send('!hello "Says hello! \n!commands "Lists all commands! \n!open "Gives a mystery challenge!');
        // message.channel.send('!open "Gives a mystery challenge!"');

    }
});
client.on('messageCreate', message => {
    if (message.content === '!Hola') {
        message.channel.send('Hola Amigo! I am the Mystery Box Bot!');
    }
});

const PORT = 3100;
ServiceWorkerRegistration.listen((PORT), () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
client.login(process.env.DISCORD_TOKEN);