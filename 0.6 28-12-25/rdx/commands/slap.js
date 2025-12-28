const request = require("request");
const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: 'slap',
    aliases: ['hit', 'punch', 'beat', 'thapar', 'chmat', 'lgu', 'moh tor', 'chpat', 'mara', 'maro', 'aik lga'],
    description: 'Slap the tagged person with a GIF',
    credits: 'SARDAR RDX',
    usage: '.slap @mention',
    category: 'Fun',
    adminOnly: false,
    prefix: true
  },

  async run({ api, event, send, Users }) {
    const slapGifs = [
      // PUT HERE LINKS - Replace with your slap GIF/video links
      "https://i.ibb.co/k6QxCP7w/8527c64e686a.gif",
      "https://i.ibb.co/Jj4GhPps/4f14c0f398b3.gif",
      "https://i.ibb.co/JR8fqsFR/0a59a3880c88.gif",
      "https://i.ibb.co/8Dtrdf14/de975c771b07.gif",
      "https://i.ibb.co/DgPT6D5m/fb9ecb7d44a0.gif",
      // PUT HERE MORE LINKS
    ];

    const mentions = Object.keys(event.mentions);
    
    if (!mentions || mentions.length === 0) {
      return send.reply('🚫 برائے کرم کسی کو ٹیگ کریں!\n\n(Please tag someone to slap!)');
    }

    const slapperName = await Users.getNameUser(event.senderID);
    const victimID = mentions[0];
    const victimName = event.mentions[victimID].replace("@", "");

    const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];
    
    try {
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const gifPath = cacheDir + "/slap_" + Date.now() + ".gif";

      return request(encodeURI(randomGif))
        .pipe(fs.createWriteStream(gifPath))
        .on("close", () => {
          api.sendMessage({
            body: `💥 *SLAP ATTACK*\n\n   ${victimName} SORRY MEKO LGA MACHAR HY 😤👋)`,
            mentions: [{ tag: victimName, id: victimID }],
            attachment: fs.createReadStream(gifPath)
          }, event.threadID, () => {
            try { fs.unlinkSync(gifPath); } catch (e) {}
          });
        })
        .on("error", () => {
          send.reply('❌ GIF نہیں بھیج سکا - لنک غلط ہو سکتا ہے!\n(Could not send GIF - check the link!)');
        });

    } catch (error) {
      return send.reply('❌ خرابی: ' + error.message);
    }
  }
};
