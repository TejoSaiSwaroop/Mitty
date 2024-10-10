const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const cron = require('cron');
const http = require('http');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ] 
});
const lofiStreamUrls = [
    'https://www.youtube.com/watch?v=5qap5aO4i9A', // Example Lo-Fi YouTube stream link
    'https://www.youtube.com/watch?v=jfKfPfyJRdk'
];

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);

    // Set up a job that runs at a random time every day
    const job = new cron.CronJob('0 0 * * *', async () => {
        // Randomly set a time in the range (e.g., between 12 PM and 6 PM)
        const randomHour = Math.floor(Math.random() * 6) + 12; // 12 to 17 (12 PM to 5 PM)
        const randomMinute = Math.floor(Math.random() * 60);
        const time = `${randomMinute} ${randomHour} * * *`;

        console.log(`Next join will be at: ${randomHour}:${randomMinute}`);

        // Set the next random job
        new cron.CronJob(time, () => joinAndPlayLofi(), null, true);
    }, null, true);

    job.start();
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

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy(); // Leave the channel when the music is done
        console.log('Music finished, leaving the channel.');
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        connection.destroy();
    });

    // Send a message in the text channel announcing the session
    const textChannel = guild.channels.cache.find(channel => channel.type === 0);
    if (textChannel) {
        textChannel.send(`🎶 Join me in **${randomChannel.name}** for some chill lo-fi music!`);
    }
}

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

// Create an HTTP server to keep the bot alive
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});