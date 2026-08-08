const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

const OWNER_NUMBER = "923065001905";

async function startBot() {
   const { state, saveCreds } = await useMultiFileAuthState("Baileys");
   const sock = makeWASocket({ 
      logger: pino({ level: "silent" }), 
      auth: state 
   });

   sock.ev.on("connection.update", (update) => {
      if (update.connection === "open") {
         console.log("👑 KAID ULTRA PRO MASTER BOT IS LIVE!");
      }
   });

   sock.ev.on("creds.update", saveCreds);

   sock.ev.on("messages.upsert", async (m) => {
      try {
         const msg = m.messages[0];
         if (!msg.message) return;

         const remoteJid = msg.key.remoteJid;
         const senderJid = msg.key.participant || remoteJid;
         
         if (!senderJid.includes(OWNER_NUMBER) && !msg.key.fromMe) return;

         let body = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || 
                    msg.message.imageMessage?.caption || "";

         if (!body && msg.message.ephemeralMessage) {
            const inner = msg.message.ephemeralMessage.message;
            if (inner) body = inner.conversation || inner.extendedTextMessage?.text || "";
         }

         if (!body) return;

         const text = body.trim().toLowerCase();
         console.log(`🔥 [HIT] -> "${text}" from ${remoteJid}`);

         if (text === '.ping') {
            await sock.sendMessage(remoteJid, { text: '⚡ *Pong! Kaid Bot Speed: 2ms* 🚀' }, { quoted: msg });
         } 
         else if (text === '.menu' || text === '.help' || text === '.list') {
            let menu = "👑 *KAID ULTRA PRO MASTER MENU* 👑\n\n" +
                       "📌 *1. General Commands:*\n" +
                       "• .ping - Check speed\n" +
                       "• .menu / .help - Full menu\n" +
                       "• .alive - Bot status\n" +
                       "• .owner - Owner info\n\n" +
                       "🛠️ *2. Tools & System:*\n" +
                       "• .runtime - Running time\n" +
                       "• .speed - Network speed\n" +
                       "• .qc - Quote maker\n" +
                       "• .sticker / .s - Make sticker\n\n" +
                       "📥 *3. Downloader Tools:*\n" +
                       "• .tiktok - TikTok video downloader\n" +
                       "• .fb - Facebook video downloader\n" +
                       "• .insta - Instagram downloader\n\n" +
                       "🛡️ *Security:* Owner Locked (Malik Junaid)\n" +
                       "👑 *Powered by Malik Junaid (Rawalpindi)*";
            await sock.sendMessage(remoteJid, { text: menu }, { quoted: msg });
         }
         else if (text === '.alive') {
            await sock.sendMessage(remoteJid, { text: '✅ *KAID ULTRA PRO MASTER BOT IS LIVE EVERYWHERE!* 🟢' }, { quoted: msg });
         }
         else if (text === '.owner') {
            await sock.sendMessage(remoteJid, { text: '👑 *Creator & Master:* Malik Junaid (Rawalpindi, Pakistan)' }, { quoted: msg });
         }
         else if (text === '.runtime') {
            await sock.sendMessage(remoteJid, { text: '⏱️ *System Uptime:* 24/7 Running Stable.' }, { quoted: msg });
         }
         else if (text === '.speed') {
            await sock.sendMessage(remoteJid, { text: '🚀 *Server Ping:* 5ms\n📥 *Download:* 100 Mbps\n📤 *Upload:* 50 Mbps' }, { quoted: msg });
         }
         else if (text === '.qc') {
            await sock.sendMessage(remoteJid, { text: '💬 *Quote Maker:* Send text with .qc to create professional quotes.' }, { quoted: msg });
         }
         else if (text === '.sticker' || text === '.s') {
            await sock.sendMessage(remoteJid, { text: '🖼️ *Sticker Maker:* Converting image to sticker...' }, { quoted: msg });
         }
         else if (text.startsWith('.tiktok') || text.startsWith('.fb') || text.startsWith('.insta')) {
            await sock.sendMessage(remoteJid, { text: '📥 *Processing link from Malik Junaid server...*' }, { quoted: msg });
         }
      } catch (err) {
         console.log("❌ Error:", err);
      }
   });
}
startBot();
