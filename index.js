const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const MAIN_OWNER = "923339178272"; 
let subOwners = [MAIN_OWNER];
let premiumUsers = [];

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        browser: ["Chrome (Linux)", "", ""]
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('📱 اپنا واٹس ایپ نمبر لکھیں (مثلاً 923xxxxxxxx): ');
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.trim());
                console.log(`\n========================================`);
                console.log(`⚡ آپ کا واٹس ایپ پیئرنگ کوڈ یہ ہے: ${code}`);
                console.log(`========================================\n`);
            } catch (err) {
                console.log('❌ پیئرنگ کوڈ حاصل کرنے میں خرابی ہوئی۔');
            }
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('🔥 بوٹ کامیابی سے آن لائن ہو گیا ہے!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const messageType = Object.keys(m.message)[0];
        const body = messageType === 'conversation' ? m.message.conversation :
                     messageType === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                     messageType === 'ephemeralMessage' ? m.message.ephemeralMessage.message.conversation : '';

        if (!body || !body.startsWith('.')) return;

        const sender = m.key.remoteJid;
        const args = body.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'help' || command === 'menu') {
            let menuText = `⚡ *ماسٹر بوٹ مینیو* ⚡\n\n` +
                           `📌 .ping - بوٹ سپیڈ چیک\n` +
                           `📌 .owner - اونر کی معلومات\n` +
                           `📌 .runtime - آن لائن ٹائم چیک`;
            await sock.sendMessage(sender, { text: menuText }, { quoted: m });
        }
        else if (command === 'ping') {
            await sock.sendMessage(sender, { text: '⚡ بوٹ بالکل فسٹ کلاس کام کر رہا ہے!' }, { quoted: m });
        }
        else if (command === 'owner') {
            await sock.sendMessage(sender, { text: `👑 مین اونر نمبر: wa.me/${MAIN_OWNER}` }, { quoted: m });
        }
        else if (command === 'runtime') {
            let uptime = process.uptime();
            let hours = Math.floor(uptime / 3600);
            let minutes = Math.floor((uptime % 3600) / 60);
            await sock.sendMessage(sender, { text: `⏱️ آن لائن وقت: ${hours} گھنٹے, ${minutes} منٹ` }, { quoted: m });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startBot();
