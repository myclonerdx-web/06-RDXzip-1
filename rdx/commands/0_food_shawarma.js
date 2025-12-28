const request = require("request");
const fs = require("fs");

module.exports = {
  config: {
    name: 'shawarma',
    aliases: ['shawa', 'shawrma', 'kebab', 'shawar', 'meat wrap'],
    description: 'Send a shawarma image',
    credits: 'SARDAR RDX',
    usage: '.shawarma',
    category: 'Fun',
    adminOnly: false,
    prefix: true
  },

  async run({ api, event, send }) {
    const images = [
      "https://i.ibb.co/hxH7KJqF/97092ace6c79.jpg",
      "https://i.ibb.co/fYWcygGS/106ae2c521e1.jpg",
      "https://i.ibb.co/7NjB7xsR/0e338d3e8576.jpg",
      "https://i.ibb.co/Lz0k037q/0168b3a5ac4a.jpg",
      "https://i.ibb.co/hxLdZ7ZK/178b6f1c306c.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    
    try {
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const imgPath = cacheDir + "/shawarma_" + Date.now() + ".jpg";

      return request(encodeURI(randomImg))
        .pipe(fs.createWriteStream(imgPath))
        .on("close", () => {
          api.sendMessage({
            body: `Ye lo shawarma apka ly! 🤤`,
            attachment: fs.createReadStream(imgPath)
          }, event.threadID, () => {
            try { fs.unlinkSync(imgPath); } catch (e) {}
          });
        })
        .on("error", () => {
          send.reply('❌ Image نہیں بھیج سکا');
        });
    } catch (error) {
      return send.reply('❌ خرابی: ' + error.message);
    }
  }
};
