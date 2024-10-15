const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const play = require('play-dl');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ] 
});

client.once('ready', () => {
    console.log('Mitty the Mystery Box Bot is online!');
});

client.on('messageCreate', async message => {
    if (message.content.startsWith('!play ')) {
        if (!message.member.voice.channel) {
            return message.reply('You need to join a voice channel first!');
        }

        const query = message.content.replace('!play ', '').trim();
        if (!query) {
            return message.reply('Please provide a song name or URL.');
        }

        try {
            const voiceChannel = message.member.voice.channel;
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            let stream;
            if (await play.is_expired()) {
                await play.refreshToken(); // Refresh the token if it has expired
            }

            if (play.spotify.validate(query)) {
                const spotifyData = await play.spotify(query);
                if (!spotifyData) {
                    throw new Error('Spotify Data is missing');
                }
                stream = await play.stream(spotifyData.url);
            } else {
                stream = await play.stream(query);
            }

            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            message.reply(`🎶 Playing: ${query}`);
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
        } catch (error) {
            console.error('Error fetching audio:', error);
            message.reply('There was an error fetching the audio. Please try again.');
        }
    }
});

client.on('messageCreate', message => {
    if (message.content === '!hello') {
        message.channel.send('Hello @everyone! I am the Mystery Box Bot!');
    }
});

client.login(process.env.DISCORD_TOKEN);

// Create an HTTP server to keep the bot alive
const http = require('http');

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

// Create an HTTP server to keep the bot alive
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});