const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports.config = {
  name: "pair2",
  version: "1.0.0", 
  hasPermssion: 0,
  credits: "SARDAR RDX",
  description: "Random pair from a random group",
  commandCategory: "Love", 
  usages: "pair2 to [ibb gif link optional]", 
  cooldowns: 0
};

const cacheDir = path.join(__dirname, "cache");

const maleNames = ["ali", "ahmed", "muhammad", "hassan", "hussain", "sardar", "rdx", "usman", "bilal", "hamza", "asad", "zain", "fahad", "faisal", "imran", "kamran", "adnan", "arslan", "waqas", "waseem", "irfan", "junaid", "khalid", "nadeem", "naveed", "omer", "qasim", "rizwan", "sajid", "salman", "shahid", "tariq", "umar", "yasir", "zahid"];
const femaleNames = ["fatima", "ayesha", "maria", "sana", "hira", "zara", "maryam", "khadija", "sara", "amina", "bushra", "farah", "iqra", "javeria", "kinza", "laiba", "maham", "nadia", "rabia", "saima", "tahira", "uzma", "zainab", "anam", "asma", "dua", "esha", "fiza", "huma", "iram"];

function detectGender(name) {
  if (!name) return "unknown";
  const lowerName = name.toLowerCase();
  if (femaleNames.some(n => lowerName.includes(n))) return "female";
  if (maleNames.some(n => lowerName.includes(n))) return "male";
  return "unknown";
}

async function getThreadMembers(api, threadID) {
  return new Promise((resolve) => {
    api.getThreadInfo(threadID, (err, info) => {
      if (err) return resolve([]);
      resolve(info.participantIDs || []);
    });
  });
}

async function getUserInfo(api, uid) {
  return new Promise((resolve) => {
    api.getUserInfo(uid, (err, info) => {
      if (err) return resolve({});
      resolve(info[uid] || {});
    });
  });
}

async function getThreadList(api) {
  return new Promise((resolve) => {
    api.getThreadList(100, null, [], (err, list) => {
      if (err) return resolve([]);
      resolve(list || []);
    });
  });
}

function isValidName(name) {
  if (!name || name.trim() === '') return false;
  const lower = name.toLowerCase();
  if (lower === 'facebook' || lower === 'facebook user' || lower.includes('facebook user')) return false;
  if (lower === 'unknown' || lower === 'user') return false;
  return true;
}

async function getProperName(api, uid, Users) {
  try {
    if (Users && Users.getNameUser) {
      const name = await Users.getNameUser(uid);
      if (isValidName(name)) return name;
    }
    const info = await getUserInfo(api, uid);
    if (isValidName(info.name)) return info.name;
    if (isValidName(info.firstName)) return info.firstName;
    if (isValidName(info.alternateName)) return info.alternateName;
    return 'Jaan';
  } catch (e) {
    return 'Jaan';
  }
}

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { 
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) {
    return false;
  }
}

function cleanupFiles(...files) {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (e) {}
  }
}

async function createCompositeImage(avatar1Path, gifPath, avatar2Path, outputPath) {
  try {
    const [img1, gif, img2] = await Promise.all([
      Jimp.read(avatar1Path),
      Jimp.read(gifPath),
      Jimp.read(avatar2Path)
    ]);

    const size = 200;
    img1.resize(size, size);
    gif.resize(size, size);
    img2.resize(size, size);

    const width = size * 3 + 40;
    const height = size + 100;

    const composite = new Jimp(width, height, 0x000000ff);

    composite.blit(img1, 10, 50);
    composite.blit(gif, size + 20, 50);
    composite.blit(img2, size * 2 + 30, 50);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    composite.print(font, width / 2 - 100, 10, "PAIR SUCCESSFULLY");

    await composite.write(outputPath);
    return true;
  } catch (e) {
    console.error("Error creating composite image:", e);
    return false;
  }
}

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  const timestamp = Date.now();
  const avtPath = path.join(cacheDir, `avt_pair2_${timestamp}_1.png`);
  const gifPath = path.join(cacheDir, `gif_pair2_${timestamp}.gif`);
  const avt2Path = path.join(cacheDir, `avt_pair2_${timestamp}_2.png`);
  const compositePath = path.join(cacheDir, `composite_pair2_${timestamp}.png`);

  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const threadList = await getThreadList(api);
    const botID = api.getCurrentUserID();
    
    const groupThreads = threadList.filter(t => t.isGroup && t.threadID !== threadID);
    
    if (groupThreads.length === 0) {
      return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐍𝐨 𝐠𝐫𝐨𝐮𝐩𝐬 𝐟𝐨𝐮𝐧𝐝!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
    }

    const randomGroup = groupThreads[Math.floor(Math.random() * groupThreads.length)];
    const members = await getThreadMembers(api, randomGroup.threadID);
    const filteredMembers = members.filter(m => m !== botID);

    if (filteredMembers.length < 2) {
      return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐆𝐫𝐨𝐮𝐩 𝐡𝐚𝐬 𝐥𝐞𝐬𝐬 𝐭𝐡𝐚𝐧 𝟐 𝐦𝐞𝐦𝐛𝐞𝐫𝐬!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
    }

    const user1 = filteredMembers[Math.floor(Math.random() * filteredMembers.length)];
    let user2 = filteredMembers[Math.floor(Math.random() * filteredMembers.length)];
    
    while (user2 === user1 && filteredMembers.length > 1) {
      user2 = filteredMembers[Math.floor(Math.random() * filteredMembers.length)];
    }

    const name1 = await getProperName(api, user1, Users);
    const name2 = await getProperName(api, user2, Users);

    const avatar1Url = `https://graph.facebook.com/${user1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2Url = `https://graph.facebook.com/${user2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const gifUrl = `https://i.ibb.co/wC2JJBb/trai-tim-lap-lanh.gif`;

    await Promise.all([
      downloadImage(avatar1Url, avtPath),
      downloadImage(gifUrl, gifPath),
      downloadImage(avatar2Url, avt2Path)
    ]);

    const imageCreated = await createCompositeImage(avtPath, gifPath, avt2Path, compositePath);

    if (!imageCreated) {
      return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐄𝐫𝐫𝐨𝐫 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
    }

    var arraytag = [];
    arraytag.push({id: user1, tag: name1});
    arraytag.push({id: user2, tag: name2});

    const msg = {
      body: `┏━•❃°•°❀°•°❃•━┓

𝐎𝐰𝐧𝐞𝐫 ·˚ ༘₊·꒰➳: ̗̀➛ 🍓 𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗

┗━•❃°•°❀°•°❃•━┛ 

✦ ━━━━ ༺♡༻ ━━━━ ✦

[❝ 𝑇𝑢𝑗ℎ𝑘𝑜 𝑑𝑒𝑘ℎ 𝑘𝑒 𝑏𝑎𝑠 𝑒𝑘 𝑘ℎ𝑦𝑎𝑎𝑙 𝑎𝑎𝑡𝑎 ℎ𝑎𝑖,
𝐷𝑖𝑙 𝑘𝑎ℎ𝑡𝑎 ℎ𝑎𝑖 𝑘𝑎𝑠ℎ 𝑡𝑢 𝑠𝑎𝑎𝑡ℎ ℎ𝑜... ❞]

✦ ━━━━ ༺♡༻ ━━━━ ✦

[❝ 𝐸𝑘 𝑊𝑎𝑞𝑡 𝑎𝑎𝑦𝑒 𝑍𝑖𝑛𝑑𝑎𝑔𝑖 𝑚𝑒𝑖𝑛...

𝐽𝑎ℎ𝑎𝑎𝑛 𝑡𝑢 𝑣𝑖 𝑚𝑒𝑟𝑒 𝑝𝑦𝑎𝑟 𝑚𝑒𝑖𝑛 ℎ𝑜 ❞]

✦ ━━━━ ༺♡༻ ━━━━ ✦

┌──═━┈━═──┐

➻ 𝐍𝗔ɱɘ ✦ ${name1}

➻ 𝐍𝗔ɱɘ ✦ ${name2}

└──═━┈━═──┘

✦ ━━━━ ༺♡༻ ━━━━ ✦

📍 𝐆𝐫𝐨𝐮𝐩: ${randomGroup.name}

${name1} 🌺 ${name2}`,
      mentions: arraytag,
      attachment: fs.createReadStream(compositePath)
    };

    return api.sendMessage(msg, threadID, () => {
      setTimeout(() => {
        cleanupFiles(avtPath, gifPath, avt2Path, compositePath);
      }, 3000);
    }, messageID);

  } catch (error) {
    console.error("Pair2 command error:", error);
    cleanupFiles(avtPath, gifPath, avt2Path, compositePath);
    return api.sendMessage("┏━•❃°•°❀°•°❃•━┓\n\n❌ 𝐄𝐫𝐫𝐨𝐫 𝐞𝐱𝐞𝐜𝐮𝐭𝐢𝐧𝐠 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!\n\n┗━•❃°•°❀°•°❃•━┛", threadID, messageID);
  }
};
