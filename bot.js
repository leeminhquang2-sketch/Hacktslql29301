cat > ~/botel/bot.js << 'EOF'
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const CONFIG = {
    token: process.env.TOKEN || 'MTUyMDM2NzU3ODA1MTI1MjI4NA.GsGNrL.KWo9kouVF5aiqj6phT4pYWw7dhkkfFdabnUVqA',
    clientId: process.env.CLIENT_ID || '1520367578051252284',
    adminId: '1306473992441430056',
    apiUrl: 'http://localhost:3000',
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

// ===== KEY SYSTEM - LƯU VÀO FILE =====
const KEY_FILE = './userkeys.json';

// Load keys từ file
function loadKeys() {
    try {
        if (fs.existsSync(KEY_FILE)) {
            const data = fs.readFileSync(KEY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch(e) {
        console.error('Lỗi load keys:', e.message);
    }
    return {};
}

// Save keys vào file
function saveKeys(keys) {
    try {
        fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
    } catch(e) {
        console.error('Lỗi save keys:', e.message);
    }
}

let userKeys = loadKeys(); // Load keys khi khởi động
console.log(`📂 Đã load ${Object.keys(userKeys).length} keys từ file!`);

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('📚 Xem hướng dẫn'),
    new SlashCommandBuilder().setName('chars').setDescription('⭐ Danh sách nhân vật 7 sao'),
    new SlashCommandBuilder().setName('contact').setDescription('💖 Liên hệ admin'),
    
    // LẤY KEY
    new SlashCommandBuilder().setName('getkey').setDescription('🔑 Nhận key riêng của bạn (mỗi người 1 key, lưu vĩnh viễn)'),
    
    // XEM KEY
    new SlashCommandBuilder().setName('mykey').setDescription('🔑 Xem key của bạn'),
    
    // HACK
    new SlashCommandBuilder()
        .setName('hack')
        .setDescription('🎮 Hack nhân vật 7 sao')
        .addStringOption(o => o.setName('hostid').setDescription('Host ID').setRequired(true))
        .addStringOption(o => o.setName('platform').setDescription('Platform').setRequired(true)
            .addChoices({name:'AMO',value:'AMO'},{name:'ATV',value:'ATV'},{name:'LG',value:'LG'},{name:'SS',value:'SS'}))
        .addIntegerOption(o => o.setName('charid').setDescription('Char ID').setRequired(true)),
    
    // ADMIN: TẠO KEY
    new SlashCommandBuilder()
        .setName('adminkey')
        .setDescription('👑 Admin: Tạo key cho người khác')
        .addUserOption(o => o.setName('user').setDescription('Chọn người dùng').setRequired(true))
        .addStringOption(o => o.setName('thoihan').setDescription('Thời hạn').setRequired(true)
            .addChoices({name:'1h',value:'1h'},{name:'1d',value:'1d'},{name:'7d',value:'7d'},{name:'30d',value:'30d'},{name:'perm',value:'perm'})),
    
    // ADMIN: DANH SÁCH
    new SlashCommandBuilder().setName('listkey').setDescription('👑 Admin: Xem danh sách key + xuất file'),
    
    // ADMIN: XÓA
    new SlashCommandBuilder()
        .setName('delkey')
        .setDescription('👑 Admin: Xóa key của người dùng')
        .addUserOption(o => o.setName('user').setDescription('Chọn người dùng').setRequired(true)),
    
    // ADMIN: RELOAD
    new SlashCommandBuilder().setName('reloadkey').setDescription('👑 Admin: Reload keys từ file'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(CONFIG.token);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: [] });
        await rest.put(Routes.applicationCommands(CONFIG.clientId), { body: commands });
        console.log('✅ Commands đã đăng ký!');
    } catch(e) { console.error(e); }
})();

client.on('ready', () => {
    console.clear();
    console.log('╔══════════════════════════════════════╗');
    console.log('║     ⭐ CHAR HACK BOT ⭐7 SAO ⭐     ║');
    console.log('║    KEY RIÊNG - LƯU FILE JSON 🔑  ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`  🤖 Bot: ${client.user.tag}`);
    console.log(`  📂 Key File: ${KEY_FILE}`);
    console.log(`  👥 Keys đã lưu: ${Object.keys(userKeys).length}`);
    console.log(`  🚀 Sẵn sàng!\n`);
    client.user.setPresence({ activities: [{ name: '/getkey | Lưu vĩnh viễn', type: ActivityType.Playing }], status: 'online' });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // ===== /HELP =====
    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle('🤖 CHAR HACK BOT ⭐7 SAO')
            .setDescription('**KEY RIÊNG** - Mỗi người 1 key, lưu vĩnh viễn vào file!')
            .addFields(
                { name: '🔑 /getkey', value: 'Nhận key riêng (lưu vào file)', inline: false },
                { name: '🔍 /mykey', value: 'Xem key của bạn', inline: false },
                { name: '🎮 /hack', value: 'Hack không cần nhập key', inline: false },
                { name: '⭐ /chars', value: 'Xem danh sách nhân vật', inline: false }
            )
            .setFooter({ text: `Keys đã lưu: ${Object.keys(userKeys).length} | ${CONFIG.contact}` });
        await interaction.reply({ embeds: [embed] });
    }

    // ===== /CHARS =====
    if (commandName === 'chars') {
        const half = Math.ceil(CHAR_7S.length / 2);
        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('⭐ DANH SÁCH NHÂN VẬT 7 SAO ⭐')
            .addFields(
                { name: '▸ Nhân Vật', value: CHAR_7S.slice(0, half).map(c => `\`${c.id}\` ⭐ **${c.name}**`).join('\n'), inline: true },
                { name: '▸ Nhân Vật', value: CHAR_7S.slice(half).map(c => `\`${c.id}\` ⭐ **${c.name}**`).join('\n'), inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }

    // ===== /CONTACT =====
    if (commandName === 'contact') {
        const embed = new EmbedBuilder().setColor('#e91e63').setTitle('💖 LIÊN HỆ')
            .addFields({ name: '📧 Facebook', value: CONFIG.contact }, { name: '👤 Admin', value: `<@${CONFIG.adminId}>` });
        await interaction.reply({ embeds: [embed] });
    }

    // ===== /GETKEY =====
    if (commandName === 'getkey') {
        if (userKeys[userId]) {
            return interaction.reply({ content: '❌ Bạn đã có key rồi! Dùng `/mykey` để xem.', ephemeral: true });
        }
        
        await interaction.reply({ content: '🔄 Đang tạo key...', ephemeral: true });
        
        try {
            const res = await axios.post(`${CONFIG.apiUrl}/api/admin/create-key`, {
                token: 'admin', userId, username, duration: '30d'
            });
            
            if (res.data.success) {
                userKeys[userId] = { 
                    key: res.data.key, 
                    username: username,
                    createdAt: Date.now(),
                    duration: '30d'
                };
                saveKeys(userKeys); // LƯU VÀO FILE
                
                const embed = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('🔑 KEY CỦA BẠN')
                    .setDescription('✨ **ĐÃ LƯU VÀO FILE! KHÔNG CHIA SẺ!**')
                    .addFields(
                        { name: '👤 Chủ Key', value: `<@${userId}>`, inline: true },
                        { name: '⏰ Hạn', value: '30 Ngày', inline: true },
                        { name: '🔒 Key', value: `\`\`\`${res.data.key}\`\`\`` }
                    );
                
                await interaction.editReply({ content: '', embeds: [embed] });
            }
        } catch(e) {
            await interaction.editReply({ content: '❌ Lỗi tạo key!' });
        }
    }

    // ===== /MYKEY =====
    if (commandName === 'mykey') {
        const myKey = userKeys[userId];
        if (!myKey) {
            return interaction.reply({ content: '❌ Bạn chưa có key! Dùng `/getkey` để nhận.', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔑 KEY CỦA BẠN')
            .addFields(
                { name: '👤 Chủ Key', value: `<@${userId}>`, inline: true },
                { name: '📅 Ngày Tạo', value: `<t:${Math.floor(myKey.createdAt/1000)}:R>`, inline: true },
                { name: '🔒 Key', value: `\`\`\`${myKey.key}\`\`\`` }
            )
            .setFooter({ text: 'Đã lưu trong file userkeys.json' });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ===== /HACK =====
    if (commandName === 'hack') {
        const hostId = interaction.options.getString('hostid');
        const platform = interaction.options.getString('platform');
        const charId = interaction.options.getInteger('charid');
        
        const charData = CHAR_7S.find(c => c.id === charId);
        if (!charData) return interaction.reply({ content: '❌ Sai char ID!', ephemeral: true });
        
        const myKey = userKeys[userId];
        if (!myKey) return interaction.reply({ content: '❌ Chưa có key! Dùng `/getkey`.', ephemeral: true });
        
        const embed = new EmbedBuilder().setColor('#f39c12').setTitle('🔄 ĐANG HACK...')
            .addFields({name:'👤 Host',value:hostId,inline:true},{name:'🎮 Platform',value:platform,inline:true},{name:'⭐ Char',value:`**${charData.name}** ⭐7`,inline:true});
        await interaction.reply({ embeds: [embed] });
        
        try {
            const res = await axios.post(`${CONFIG.apiUrl}/api/hack`, {
                key: myKey.key, userId, hostId, platform, charId: String(charId)
            });
            
            if (res.data.success) {
                const ok = new EmbedBuilder().setColor('#2ecc71').setTitle('✅ THÀNH CÔNG!')
                    .setDescription(`### ✨ ${res.data.msg}`)
                    .addFields({name:'👤 Host',value:hostId,inline:true},{name:'⭐ Char',value:`**${charData.name}** ⭐7`,inline:true});
                await interaction.editReply({ embeds: [ok] });
            } else {
                await interaction.editReply({ content: `❌ ${res.data.msg}` });
            }
        } catch(e) {
            await interaction.editReply({ content: '❌ Lỗi server!' });
        }
    }

    // ===== /ADMINKEY =====
    if (commandName === 'adminkey') {
        if (userId !== CONFIG.adminId) return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });
        
        const user = interaction.options.getUser('user');
        const thoihan = interaction.options.getString('thoihan');
        const durationMap = { '1h':'1 Giờ','1d':'1 Ngày','7d':'7 Ngày','30d':'30 Ngày','perm':'Vĩnh Viễn' };
        
        await interaction.reply({ content: '🔄 Đang tạo...', ephemeral: true });
        
        try {
            const res = await axios.post(`${CONFIG.apiUrl}/api/admin/create-key`, {
                token: 'admin', userId: user.id, username: user.username, duration: thoihan
            });
            
            if (res.data.success) {
                userKeys[user.id] = { key: res.data.key, username: user.username, createdAt: Date.now(), duration: thoihan };
                saveKeys(userKeys); // LƯU FILE
                
                const embed = new EmbedBuilder().setColor('#2ecc71').setTitle('🔑 KEY ĐÃ TẠO')
                    .addFields({name:'👤 User',value:`<@${user.id}>`,inline:true},{name:'⏰ Hạn',value:durationMap[thoihan],inline:true},{name:'🔒 Key',value:`\`\`\`${res.data.key}\`\`\``});
                await interaction.editReply({ content: '', embeds: [embed] });
                
                try { await user.send({ embeds: [embed] }); } catch(e) {}
            }
        } catch(e) {
            await interaction.editReply({ content: '❌ Lỗi!' });
        }
    }

    // ===== /LISTKEY =====
    if (commandName === 'listkey') {
        if (userId !== CONFIG.adminId) return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });
        
        const entries = Object.entries(userKeys);
        if (entries.length === 0) return interaction.reply({ content: '❌ Chưa có key!', ephemeral: true });
        
        // Tạo nội dung file
        const fileContent = entries.map(([uid, data]) => 
            `User: ${data.username} | ID: ${uid} | Key: ${data.key} | Created: ${new Date(data.createdAt).toLocaleString('vi-VN')}`
        ).join('\n');
        
        // Lưu ra file txt
        const exportFile = './key_export.txt';
        fs.writeFileSync(exportFile, fileContent);
        
        const list = entries.map(([uid, data], i) => 
            `**${i+1}.** <@${uid}> - \`${data.key.substring(0, 12)}...\` - <t:${Math.floor(data.createdAt/1000)}:R>`
        ).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📋 DANH SÁCH KEY')
            .setDescription(`**${entries.length}** keys đã lưu\nFile: \`${KEY_FILE}\`\nExport: \`${exportFile}\``)
            .addFields({ name: 'Keys', value: list.substring(0, 1024) });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Gửi file export
        try {
            await interaction.followUp({ 
                content: '📁 File export keys:', 
                files: [exportFile], 
                ephemeral: true 
            });
        } catch(e) {}
    }

    // ===== /DELKEY =====
    if (commandName === 'delkey') {
        if (userId !== CONFIG.adminId) return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });
        
        const user = interaction.options.getUser('user');
        if (!userKeys[user.id]) return interaction.reply({ content: '❌ Không có key!', ephemeral: true });
        
        delete userKeys[user.id];
        saveKeys(userKeys); // LƯU FILE
        
        await interaction.reply({ content: `✅ Đã xóa key của <@${user.id}>!`, ephemeral: true });
    }

    // ===== /RELOADKEY =====
    if (commandName === 'reloadkey') {
        if (userId !== CONFIG.adminId) return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });
        
        userKeys = loadKeys();
        await interaction.reply({ 
            content: `✅ Đã reload! **${Object.keys(userKeys).length}** keys từ file.`, 
            ephemeral: true 
        });
    }
});

client.login(CONFIG.token).catch(err => console.error('❌ Lỗi:', err.message));
EOF
