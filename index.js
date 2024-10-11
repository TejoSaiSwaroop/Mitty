const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ] 
});

const lofiStreamUrls = [
    'https://www.youtube.com/watch?v=5qap5aO4i9A', // Example URL
    // Add more URLs as needed
];

client.once('ready', () => {
    console.log('Mitty the Mystery Box Bot is online!');
    joinAndPlayLofi(); // Call the function to join and play lofi music
});

client.on('messageCreate', async message => {
    if (message.content === '!play lofi') {
        if (!message.member.voice.channel) {
            return message.reply('You need to join a voice channel first!');
        }

        const voiceChannel = message.member.voice.channel;

        // Join the voice channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        // Pick a random lo-fi stream URL
        const randomLofiUrl = lofiStreamUrls[Math.floor(Math.random() * lofiStreamUrls.length)];
        
        // Stream audio from the YouTube URL using ytdl
        const stream = ytdl(randomLofiUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 25, // Increase buffer size to prevent stalling
            quality: 'highestaudio'
        });
        const resource = createAudioResource(stream);

        // Create an audio player and play the stream
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);
        
        message.reply('🎶 Playing some chill lo-fi music in your voice channel!');
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The bot is playing music!');
        });
        
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('The music has stopped, leaving the channel.');
            connection.destroy();
        });
        
        player.on('error', error => {
            console.error('Error with the audio player:', error);
            message.channel.send('There was an error playing the music. Please try again later.');
            connection.destroy();
        });
    }
});

async function joinAndPlayLofi() {
    const guild = client.guilds.cache.first(); // Replace with the specific guild if needed
    const musicChannels = guild.channels.cache.filter(channel =>
        channel.type === 2 && channel.name.toLowerCase().includes('music')
    );

    if (musicChannels.size === 0) {
        console.log('No music channels found.');
        return;
    }

    // Select a random music channel
    const randomChannel = musicChannels.random();
    const connection = joinVoiceChannel({
        channelId: randomChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    console.log(`Joining channel: ${randomChannel.name}`);

    const player = createAudioPlayer();
    const randomLofiUrl = lofiStreamUrls[Math.floor(Math.random() * lofiStreamUrls.length)];

    const stream = ytdl(randomLofiUrl, { filter: 'audioonly', quality: 'highestaudio' });
    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The bot is playing music!');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('The music has stopped, leaving the channel.');
        connection.destroy();
    });

    player.on('error', error => {
        console.error('Error with the audio player:', error);
        connection.destroy();
    });
}

client.login(process.env.DISCORD_TOKEN);

// Create an HTTP server to keep the bot alive
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
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
        message.channel.send('!hello "Says hello! \n!commands "Lists all commands! \n!open "Gives a mystery challenge! \n!trivia "Asks a trivia question! \n!Hola "Greets you in Spanish!');
    }
});

client.on('messageCreate', message => {
    if (message.content === '!Hola') {
        message.channel.send('Hola Amigo! I am the Mystery Box Bot!');
    }
});

const triviaQuestions = [
    { question: "What is the capital of France?", answer: "Paris" || "paris" },
    { question: "Who's the first person to set foot on moon?", answer: "neil armstrong" || "Neil Armstrong" },
    { question: "What is the largest mammal in the world?", answer: "Blue Whale" || "blue whale" },
    { question: "What is the smallest planet in our solar system?", answer: "Mercury" || "mercury" },
    // { question: "What is the smallest planet in our solar system?", answer: "Mercury" },
];

client.on('messageCreate', message => {
    if (message.content === '!trivia') {
        const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
        message.channel.send(randomQuestion.question);

        const filter = response => response.content.toLowerCase() === randomQuestion.answer.toLowerCase();
        message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
            .then(collected => {
                message.channel.send(`${collected.first().author} got it right! 🎉`);
            })
            .catch(() => {
                message.channel.send('Time\'s up! The correct answer was: ' + randomQuestion.answer);
            });
    }
});

client.login(process.env.DISCORD_TOKEN);

