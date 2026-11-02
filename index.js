const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder
} = require('discord.js');

const http = require('http');
const { Snake } = require('discord-gamecord');

const PORT = process.env.PORT || 3000;
const SUNUCU_ID = '1349749476624957562';
const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('TMA Snake Oyunu Botu Aktif!\n');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`TMA sunucusu ${PORT} portunda çalışıyor.`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Discord içinde yılan oyunu oynarsın.')
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log('================================');
    console.log(`${client.user.tag} giriş yaptı!`);
    console.log('TMA Snake Oyunu Botu aktif!');
    console.log('================================');

    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, SUNUCU_ID), { body: commands });
        console.log('✅ Snake Komutu Başarıyla Yüklendi!');
    } catch (error) {
        console.error('❌ Komut Yükleme Hatası:', error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'snake') {
            const game = new Snake({
                message: interaction,
                isSlashGame: true,
                embed: {
                    title: 'Snake Game',
                    color: '#5865F2',
                    OverTitle: 'Game Over'
                },
                emojis: {
                    board: '⬛',
                    food: '🍎',
                    up: '⬆️',
                    down: '⬇️',
                    left: '⬅️',
                    right: '➡️',
                    stop: '🛑'
                },
                stopButton: 'Stop',
                timeout: 60000,
                snake: { head: '🟢', body: '🟩', tail: '🟢', over: '💀' },
                foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
                playerOnlyMessage: 'Sadece komutu kullanan kişi bu butonları kullanabilir.'
            });

            return game.startGame();
        }
    } catch (error) {
        console.error(error);
    }
});

if (!TOKEN) process.exit(1);
client.login(TOKEN);
