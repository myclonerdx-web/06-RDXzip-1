const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');

// ============================================
// PASTE YOUR GIF LINKS HERE (ONE FOR EACH MEMBER)
// ============================================
const GIF_URLS = [
  'https://i.ibb.co/WWRt2Vsy/2b3439f71d76.gif',
  'https://i.ibb.co/nNK2TX75/dc82e95aba67.gif',
  'https://i.ibb.co/tMK00Qct/a008ff0dca24.gif'
];

// ============================================

// Function to download file with retry
async function downloadFile(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxRedirects: 10,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.log(`Download attempt ${attempt + 1} failed:`, error.message);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  return null;
}

// Function to get random video from joingif folder
function getRandomJoinVideo() {
  try {
    const joinGifPath = path.join(__dirname, 'joingif');

    if (!fs.existsSync(joinGifPath)) {
      console.log('joingif folder not found');
      return null;
    }

    const files = fs.readdirSync(joinGifPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
    });

    if (files.length === 0) {
      console.log('No video files found in joingif folder');
      return null;
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(joinGifPath, randomFile);
  } catch (error) {
    console.error('Error getting join video:', error.message);
    return null;
  }
}

module.exports = {
  config: {
    name: 'welcome',
    eventType: 'log:subscribe',
    description: 'Welcome new members with individual GIF and video'
  },

  async run({ api, event, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData.addedParticipants || [];
    const botID = api.getCurrentUserID();

    const settings = Threads.getSettings(threadID);

    if (settings.antijoin) {
      for (const participant of addedParticipants) {
        if (participant.userFbId === botID) continue;

        try {
          await api.removeUserFromGroup(participant.userFbId, threadID);
        } catch {}
      }
      return;
    }

    const newMembers = addedParticipants.filter(p => p.userFbId !== botID);

    if (newMembers.length === 0) return;

    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { threadName: 'this amazing group' };
    }

    const groupName = threadInfo.threadName || 'this amazing group';
    const memberCount = threadInfo.participantIDs?.length || 0;
    const joinDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const joinTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    try {
      // Step 1: Build welcome message
      let welcomeMsg = `╭──〔❨✧✧❩〕──╮
  ✨ 𝐀𝐃𝐃 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 ✨  
╰──〔❨✧✧❩〕──╯\n\n`;

      welcomeMsg += `🌟 You've joined🌟 \n ${groupName} \n`;
      welcomeMsg += `${'꘏'.repeat(18)}\n\n`;

      welcomeMsg += `🎊 New Member${newMembers.length > 1 ? 's' : ''} Alert 🎊\n`;
      welcomeMsg += `${'⫘⫘'.repeat(5)}\n`;

      for (let i = 0; i < newMembers.length; i++) {
        const member = newMembers[i];
        let name = member.fullName;

        if (!name || name.toLowerCase().includes('facebook') || name.toLowerCase() === 'user') {
          try {
            const info = await api.getUserInfo(member.userFbId);
            if (info && info[member.userFbId]) {
              const fullName = info[member.userFbId].name;
              const firstName = info[member.userFbId].firstName;
              const alternateName = info[member.userFbId].alternateName;

              if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
                name = fullName;
              } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
                name = firstName;
              } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
                name = alternateName;
              } else {
                name = await Users.getNameUser(member.userFbId);
              }
            }
          } catch {
            name = await Users.getNameUser(member.userFbId);
          }
        }

        if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
          name = 'Amazing New Member';
        }

        const memberEmoji = i === 0 ? '👑' : '⭐';
        welcomeMsg += `${memberEmoji} ${i + 1}. ${name}\n`;
        Users.create(member.userFbId, name);
      }

      // Statistics section
      welcomeMsg += `\n${'꘏'.repeat(18)}\n`;
      welcomeMsg += `📊 Group Statistics 📊\n`;
      welcomeMsg += `${'⫘⫘'.repeat(5)}\n`;
      welcomeMsg += `👥 Members: ${memberCount} souls\n`;
      welcomeMsg += `📅 Date: ${joinDate}\n`;
      welcomeMsg += `🕐 Time: ${joinTime}\n`;

      // Footer with helpful info
      welcomeMsg += `\n${'𓎡'.repeat(14)}\n`;
      welcomeMsg += `💡 Get started with: ${config.PREFIX}help\n`;
      welcomeMsg += `🎉 Enjoy your stay here! 🎉\n`;
      welcomeMsg += `${'═'.repeat(19)}`;

      // Step 2: Download and send GIF with message
      try {
        const gifIndex = 0 % GIF_URLS.length;
        const gifUrl = GIF_URLS[gifIndex];

        const gifData = await downloadFile(gifUrl);
        if (gifData && gifData.length > 1000) {
          const tmpDir = path.join(__dirname, '../cache');
          fs.ensureDirSync(tmpDir);
          const gifPath = path.join(tmpDir, `welcome_${Date.now()}.png`);
          fs.writeFileSync(gifPath, gifData);

          const gifStream = fs.createReadStream(gifPath);
          // Send message with GIF attachment
          await api.sendMessage({
            body: welcomeMsg,
            attachment: gifStream
          }, threadID);

          setTimeout(() => {
            try { fs.unlinkSync(gifPath); } catch (e) {}
          }, 5000);

          console.log('Welcome message with GIF sent successfully');
        } else {
          console.log('Failed to download GIF, sending message only');
          await api.sendMessage(welcomeMsg, threadID);
        }
      } catch (gifError) {
        console.error('GIF send error:', gifError.message);
        // Send just the message if GIF fails
        await api.sendMessage(welcomeMsg, threadID);
      }

    } catch (error) {
      console.error('Welcome event error:', error);
      // Fallback - send basic welcome message
      let basicMsg = `Welcome to ${groupName}! 🎉\n\n`;
      for (let i = 0; i < newMembers.length; i++) {
        basicMsg += `${i + 1}. ${newMembers[i].fullName || 'New Member'}\n`;
        Users.create(newMembers[i].userFbId, newMembers[i].fullName || 'New Member');
      }
      await api.sendMessage(basicMsg, threadID);
    }
  }
};