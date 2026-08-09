const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const CONFIG = {
    token: 'MTUyMDM2NzU3ODA1MTI1MjI4NA.GESIvD.V17f90wiPo5X9SCnUlkDOGBichOjtDfHlEhdL4',
    clientId: '1520367578051252284',
    adminId: '1306473992441430056',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    contact: 'https://www.facebook.com/minhquang1102.a'
};

const CHAR_7S = [
    { id: 63, name: "Ace" }, { id: 66, name: "Echo" }, { id: 67, name: "Smartie" }, { id: 68, name: "Khan" },
    { id: 49, name: "Lucy(thần)" }, { id: 64, name: "Bebee" }, { id: 65, name: "Ruby" }, { id: 48, name: "Goldman" },
    { id: 56, name: "Gingerman" }, { id: 62, name: "Bensi" }, { id: 75, name: "Jey" }, { id: 81, name: "Koo" },
    { id: 99, name: "Thrue" }, { id: 50, name: "Lucy(xe)" },
];

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const KEY_FILE = './userkeys.json';
function loadKeys() { try { if (fs.existsSync(KEY_FILE)) return JSON.parse(fs.readFileSync(KEY_FILE, 'utf8')); } catch(e) {} return {}; }
function saveKeys(keys) { fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2)); }
let userKeys = loadKeys();

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Xem hướng dẫn'),
    new SlashCommandBuilder().setName('chars').setDescription('Danh sách nhân vật'),
    new SlashCommandBuilder().setName('getkey').setDescription('Nhận key riêng'),
    new SlashCommandBuilder().setName('mykey').setDescription('Xem key'),
    new SlashCommandBuilder()
        .setName('hack').setDescription('Hack nhân vật')
        .addStringOption(o => o.setName('hostid').setDescription('Host ID').setRequired(true))
        .addStringOption(o => o.setName('platform').setDescription('Platform').setRequired(true)
            .addChoices({name:'AMO',value:'AMO'},{name:'ATV',value:'ATV'},{name:'LG',value:'LG'},{name:'SS',value:'SS'}))
        .addIntegerOption(o => o.setName('charid').setDescription('Char ID').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(CONFIG.token);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: commands });
        console.log('✅ Commands OK!');
    } catch(e) { console.error(e.message); }
})();

client.on('ready', () => console.log('✅ Bot:', client.user.tag));

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    const userId = interaction.user.id;
    const username = interaction.user.username;

    if (commandName === 'help') {
        await interaction.reply('🤖 **CHAR HACK BOT** ⭐7 Sao\n\n/getkey - Nhận key\n/mykey - Xem key\n/hack - Hack\n/chars - Nhân vật');
    }

    if (commandName === 'chars') {
        await interaction.reply('⭐ **NHÂN VẬT 7 SAO:**\n' + CHAR_7S.map(c => '`' + c.id + '` - ' + c.name).join('\n'));
    }

    if (commandName === 'getkey') {
        if (userKeys[userId]) return interaction.reply({ content: '❌ Bạn đã có key!', ephemeral: true });
        try {
            const res = await axios.post(CONFIG.apiUrl + '/api/admin/create-key', { userId, username, duration: '30d' });
            if (res.data.success) {
                userKeys[userId] = { key: res.data.key, username, createdAt: Date.now() };
                saveKeys(userKeys);
                await interaction.reply({ content: '✅ Key: ||' + res.data.key + '||', ephemeral: true });
            }
        } catch(e) { await interaction.reply({ content: '❌ Lỗi!', ephemeral: true }); }
    }

    if (commandName === 'mykey') {
        const myKey = userKeys[userId];
        if (!myKey) return interaction.reply({ content: '❌ Chưa có key!', ephemeral: true });
        await interaction.reply({ content: '🔑 Key: ||' + myKey.key + '||', ephemeral: true });
    }

    if (commandName === 'hack') {
        const hostId = interaction.options.getString('hostid');
        const platform = interaction.options.getString('platform');
        const charId = interaction.options.getInteger('charid');
        const charData = CHAR_7S.find(c => c.id === charId);
        if (!charData) return interaction.reply({ content: '❌ Sai char ID!', ephemeral: true });
        const myKey = userKeys[userId];
        if (!myKey) return interaction.reply({ content: '❌ Chưa có key!', ephemeral: true });

        await interaction.reply('🔄 Đang hack...');
        try {
            const res = await axios.post(CONFIG.apiUrl + '/api/hack', { key: myKey.key, userId, hostId, platform, charId: String(charId) });
            if (res.data.success) {
                await interaction.editReply('✅ ' + res.data.msg);
            } else {
                await interaction.editReply('❌ ' + res.data.msg);
            }
        } catch(e) { await interaction.editReply('❌ Lỗi server!'); }
    }
});

client.login(CONFIG.token);        .addIntegerOption(o => o.setName('charid').setDescription('Char ID').setRequired(true)),
    new SlashCommandBuilder()
        .setName('adminkey').setDescription('👑 Admin: Tạo key')
        .addUserOption(o => o.setName('user').setDescription('Chọn user').setRequired(true))
        .addStringOption(o => o.setName('thoihan').setDescription('Thời hạn').setRequired(true)
            .addChoices({name:'1h',value:'1h'},{name:'1d',value:'1d'},{name:'7d',value:'7d'},{name:'30d',value:'30d'},{name:'perm',value:'perm'})),
    new SlashCommandBuilder().setName('listkey').setDescription('👑 Admin: Xem danh sách key'),
    new SlashCommandBuilder()
        .setName('delkey').setDescription('👑 Admin: Xóa key')
        .addUserOption(o => o.setName('user').setDescription('Chọn user').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(CONFIG.token);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: [] });
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: commands });
        console.log('✅ Commands OK!');
    } catch(e) { console.error('Lỗi:', e.message); }
})();

client.on('ready', () => {
    console.log('✅ Bot:', client.user.tag);
    client.user.setPresence({ activities: [{ name: '/getkey | ⭐7 Sao', type: ActivityType.Playing }], status: 'online' });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    const userId = interaction.user.id;
    const username = interaction.user.username;

    if (commandName === 'help') {
        const embed = new EmbedBuilder().setColor('#9b59b6').setTitle('🤖 CHAR HACK BOT ⭐7 SAO')
            .setDescription('**KEY RIÊNG - Mỗi người 1 key**')
            .addFields(
                { name: '🔑 /getkey', value: 'Nhận key riêng', inline: false },
                { name: '🔍 /mykey', value: 'Xem key', inline: false },
                { name: '🎮 /hack', value: 'Hack nhân vật', inline: false },
                { name: '⭐ /chars', value: 'Danh sách nhân vật', inline: false }
            );
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'chars') {
        const half = Math.ceil(CHAR_7S.length / 2);
        const embed = new EmbedBuilder().setColor('#f1c40f').setTitle('⭐ NHÂN VẬT 7 SAO')
            .addFields(
                { name: '▸', value: CHAR_7S.slice(0, half).map(c => '`' + c.id + '` **' + c.name + '**').join('\n'), inline: true },
                { name: '▸', value: CHAR_7S.slice(half).map(c => '`' + c.id + '` **' + c.name + '**').join('\n'), inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'getkey') {
        if (userKeys[userId]) return interaction.reply({ content: '❌ Bạn đã có key! Dùng /mykey.', ephemeral: true });
        await interaction.reply({ content: '🔄 Đang tạo...', ephemeral: true });
        try {
            const res = await axios.post(CONFIG.apiUrl + '/api/admin/create-key', { token: 'admin', userId, username, duration: '30d' });
            if (res.data.success) {
                userKeys[userId] = { key: res.data.key, username, createdAt: Date.now() };
                saveKeys(userKeys);
                const embed = new EmbedBuilder().setColor('#2ecc71').setTitle('🔑 KEY CỦA BẠN')
                    .addFields({ name: 'Key', value: '```' + res.data.key + '```' });
                await interaction.editReply({ content: '', embeds: [embed] });
            }
        } catch(e) { await interaction.editReply({ content: '❌ Lỗi!' }); }
    }

    if (commandName === 'mykey') {
        const myKey = userKeys[userId];
        if (!myKey) return interaction.reply({ content: '❌ Chưa có key!', ephemeral: true });
        const embed = new EmbedBuilder().setColor('#3498db').setTitle('🔑 KEY CỦA BẠN')
            .addFields({ name: 'Key', value: '```' + myKey.key + '```' });
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === 'hack') {
        const hostId = interaction.options.getString('hostid');
        const platform = interaction.options.getString('platform');
        const charId = interaction.options.getInteger('charid');
        const charData = CHAR_7S.find(c => c.id === charId);
        if (!charData) return interaction.reply({ content: '❌ Sai char ID!', ephemeral: true });
        const myKey = userKeys[userId];
        if (!myKey) return interaction.reply({ content: '❌ Chưa có key!', ephemeral: true });

        const embed = new EmbedBuilder().setColor('#f39c12').setTitle('🔄 ĐANG HACK...')
            .addFields({ name: '👤 Host', value: hostId, inline: true }, { name: '🎮 Platform', value: platform, inline: true }, { name: '⭐ Char', value: '**' + charData.name + '** ⭐7', inline: true });
        await interaction.reply({ embeds: [embed] });

        try {
            const res = await axios.post(CONFIG.apiUrl + '/api/hack', { key: myKey.key, userId, hostId, platform, charId: String(charId) });
            if (res.data.success) {
                const ok = new EmbedBuilder().setColor('#2ecc71').setTitle('✅ THÀNH CÔNG!')
                    .setDescription('### ✨ ' + res.data.msg)
                    .addFields({ name: '👤 Host', value: hostId, inline: true }, { name: '⭐ Char', value: '**' + charData.name + '** ⭐7', inline: true });
                await interaction.editReply({ embeds: [ok] });
            } else {
                await interaction.editReply({ content: '❌ ' + res.data.msg });
            }
        } catch(e) { await interaction.editReply({ content: '❌ Lỗi server!' }); }
    }

    if (commandName === 'adminkey' && userId === CONFIG.adminId) {
        const user = interaction.options.getUser('user');
        const thoihan = interaction.options.getString('thoihan');
        try {
            const res = await axios.post(CONFIG.apiUrl + '/api/admin/create-key', { token: 'admin', userId: user.id, username: user.username, duration: thoihan });
            if (res.data.success) {
                userKeys[user.id] = { key: res.data.key, username: user.username, createdAt: Date.now() };
                saveKeys(userKeys);
                await interaction.reply({ content: '✅ Key: ||' + res.data.key + '||', ephemeral: true });
            }
        } catch(e) { await interaction.reply({ content: '❌ Lỗi!', ephemeral: true }); }
    }

    if (commandName === 'listkey' && userId === CONFIG.adminId) {
        const entries = Object.entries(userKeys);
        const list = entries.map(([uid, data], i) => '**' + (i + 1) + '.** <@' + uid + '> - `' + data.key.substring(0, 12) + '...`').join('\n');
        await interaction.reply({ content: '📋 **' + entries.length + '** keys:\n' + list.substring(0, 2000), ephemeral: true });
    }

    if (commandName === 'delkey' && userId === CONFIG.adminId) {
        const user = interaction.options.getUser('user');
        delete userKeys[user.id];
        saveKeys(userKeys);
        await interaction.reply({ content: '✅ Đã xóa!', ephemeral: true });
    }
});

client.login(CONFIG.token);
