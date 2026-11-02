const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    REST,
    Routes,
    PermissionFlagsBits
} = require('discord.js');

const http = require('http');
const { Snake } = require('discord-gamecord');

const PORT = process.env.PORT || 3000;
const SUNUCU_ID = '1349749476624957562';
const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

// Biletleri görebilecek yetkili rol ID'si
const ROL_YETKILI = '1533059872655151116';

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('TMA Oyun ve Eğlence Botu Aktif!\n');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`TMA oyun sunucusu ${PORT} portunda çalışıyor.`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('bilet-panel')
        .setDescription('Resimli TMA Destek Bilet Panelini Kurar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Discord içinde yılan oyunu oynarsın.'),

    new SlashCommandBuilder()
        .setName('tkm')
        .setDescription('Taş Kağıt Makas oyununu oyna.')
        .addStringOption(option =>
            option.setName('secim')
                .setDescription('Taş, kağıt veya makas seçin.')
                .setRequired(true)
                .addChoices(
                    { name: 'Taş 🪨', value: 'taş' },
                    { name: 'Kağıt 📄', value: 'kağıt' },
                    { name: 'Makas ✂️', value: 'makas' }
                )),

    new SlashCommandBuilder()
        .setName('yazitura')
        .setDescription('Yazı tura atar ve şansını denersin.')
        .addStringOption(option =>
            option.setName('tahmin')
                .setDescription('Yazı mı Tura mı?')
                .setRequired(true)
                .addChoices(
                    { name: 'Yazı', value: 'yazı' },
                    { name: 'Tura', value: 'tura' }
                ))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log('================================');
    console.log(`${client.user.tag} giriş yaptı!`);
    console.log('TMA Oyun & Destek Botu aktif!');
    console.log('================================');

    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, SUNUCU_ID), { body: commands });
        console.log('✅ Oyun ve Destek Komutları Yüklendi!');
    } catch (error) {
        console.error('❌ Komut Yükleme Hatası:', error);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const icerik = message.content.toLowerCase().trim();
    if (icerik === 'sa' || icerik === 'selamın aleykum' || icerik === 'selamin aleykum' || icerik === 'selamun aleykum') {
        await message.reply('As reis hoş geldin! 🎮').catch(() => {});
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const cmd = interaction.commandName;

            if (cmd === 'bilet-panel') {
                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Turkish Modern Army | Destek Merkezi')
                    .setDescription('Destek talebi oluşturmak için aşağıdaki menüden ilgili kategoriyi seçiniz.\n\n• **Transfer Bileti**\n• **Geri Dönüş Bileti**\n• **Oyun Destek**\n• **Sunucu Destek**')
                    .setColor(0x00AEFF)
                    .setImage('https://cdn.discordapp.com/attachments/1349749476624957562/1000032255.jpg')
                    .setFooter({ text: 'TMA Eğlence ve Destek Sistemi' });

                const menu = new StringSelectMenuBuilder()
                    .setCustomId('bilet_menu')
                    .setPlaceholder('Destek kategorisi seçiniz...')
                    .addOptions(
                        { label: 'Transfer Bileti', description: 'Grup ve birlik transfer işlemleri', value: 'transfer_bilet', emoji: '🔄' },
                        { label: 'Geri Dönüş Bileti', description: 'Orduya geri dönüş talepleri', value: 'geridonus_bilet', emoji: '🎖️' },
                        { label: 'Oyun Destek', description: 'Roblox oyun içi destek talepleri', value: 'oyun_destek', emoji: '🎮' },
                        { label: 'Sunucu Destek', description: 'Discord sunucu ile ilgili destek', value: 'sunucu_destek', emoji: '🛡️' }
                    );

                const row = new ActionRowBuilder().addComponents(menu);
                return interaction.reply({ embeds: [embed], components: [row] });
            }

            if (cmd === 'snake') {
                const game = new Snake({
                    message: interaction,
                    isSlashGame: true,
                    embed: { title: 'Snake Game', overTitle: 'Game Over', color: '#00FF00' },
                    emojis: { board: '⬛', food: '🍎', up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' },
                    stopButton: 'Stop',
                    timeoutTime: 60000,
                    snake: { head: '🟢', body: '🟩', tail: '🟢', over: '💀' },
                    foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
                    playerOnlyMessage: 'Sadece komutu kullanan kişi bu butonları kullanabilir.'
                });
                return game.startGame();
            }

            if (cmd === 'tkm') {
                await interaction.deferReply({ ephemeral: true });
                const secim = interaction.options.getString('secim');
                const secenekler = ['taş', 'kağıt', 'makas'];
                const botSecim = secenekler[Math.floor(Math.random() * secenekler.length)];

                let sonuc;
                if (secim === botSecim) sonuc = '🤝 Berabere!';
                else if ((secim === 'taş' && botSecim === 'makas') || (secim === 'kağıt' && botSecim === 'taş') || (secim === 'makas' && botSecim === 'kağıt')) sonuc = '🎉 Kazandın!';
                else sonuc = '😢 Kaybettin!';

                return interaction.editReply({ content: `Senin seçimin: **${secim}**\nBotun seçimi: **${botSecim}**\n\n**Sonuç:** ${sonuc}` });
            }

            if (cmd === 'yazitura') {
                await interaction.deferReply({ ephemeral: true });
                const tahmin = interaction.options.getString('tahmin');
                const sonuc = Math.random() < 0.5 ? 'yazı' : 'tura';
                const kazandiMi = tahmin === sonuc;
                const mesaj = kazandiMi ? `🎉 Tebrikler! Para **${sonuc}** geldi ve kazandın!` : `😢 Maalesef, para **${sonuc}** geldi ve kaybettin.`;
                return interaction.editReply({ content: mesaj });
            }
        }

        // BİLET MENÜSÜ & BUTONLARI
        if (interaction.isStringSelectMenu() && interaction.customId === 'bilet_menu') {
            await interaction.deferReply({ ephemeral: true });

            const secim = interaction.values[0];
            const guild = interaction.guild;
            const user = interaction.user;

            const kanalAdi = `bilet-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            const biletKanal = await guild.channels.create({
                name: kanalAdi,
                type: 0,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: ROL_YETKILI, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle(`📌 ${secim.toUpperCase().replace('_', ' ')}`)
                .setDescription(`Merhaba ${user}, yetkililer kısa süre içinde sizinle ilgilenecektir.\nDestek talebini kapatmak için aşağıdaki **Bileti Kapat** butonunu kullanabilirsiniz.`)
                .setColor(0x00FF00);

            const kapatButon = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('bilet_kapat')
                    .setLabel('🔒 Bileti Kapat')
                    .setStyle(ButtonStyle.Danger)
            );

            await biletKanal.send({ content: `<@&${ROL_YETKILI}> | ${user}`, embeds: [embed], components: [kapatButon] });

            return interaction.editReply({ content: `✅ Bilet kanalınız oluşturuldu: ${biletKanal}` });
        }

        if (interaction.isButton() && interaction.customId === 'bilet_kapat') {
            await interaction.reply({ content: '🔒 Bilet 5 saniye içinde kapatılıyor...' });
            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 5000);
        }

    } catch (error) {
        console.error(error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `❌ Hata oluştu: ${error.message}` }).catch(() => {});
        } else {
            await interaction.reply({ content: `❌ Hata oluştu: ${error.message}`, ephemeral: true }).catch(() => {});
        }
    }
});

if (!TOKEN) process.exit(1);
client.login(TOKEN);
