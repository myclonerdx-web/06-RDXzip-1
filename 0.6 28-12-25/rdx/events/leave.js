const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');

// ============================================
// PASTE YOUR GIF LINKS HERE (ONE FOR EACH MEMBER)
// ============================================
const GIF_URLS = [
  'https://i.ibb.co/d4G08M8d/342059a07400.gif',
  'https://i.ibb.co/cSNz3rdk/aa6428702cc9.gif'
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

// Function to get random video from leavegif folder
function getRandomLeaveVideo() {
  try {
    const leaveGifPath = path.join(__dirname, 'leavegif');

    if (!fs.existsSync(leaveGifPath)) {
      console.log('leavegif folder not found');
      return null;
    }

    const files = fs.readdirSync(leaveGifPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
    });

    if (files.length === 0) {
      console.log('No video files found in leavegif folder');
      return null;
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(leaveGifPath, randomFile);
  } catch (error) {
    console.error('Error getting leave video:', error.message);
    return null;
  }
}

module.exports = {
  config: {
    name: 'leave',
    eventType: 'log:unsubscribe',
    description: 'Goodbye messages with GIF and video for members leaving'
  },

  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const leftParticipantFbId = logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();

    if (leftParticipantFbId === botID) return;

    const settings = Threads.getSettings(threadID);

    let name = null;
    try {
      const info = await api.getUserInfo(leftParticipantFbId);
      if (info && info[leftParticipantFbId]) {
        const fullName = info[leftParticipantFbId].name;
        const firstName = info[leftParticipantFbId].firstName;
        const alternateName = info[leftParticipantFbId].alternateName;

        if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
          name = fullName;
        } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
          name = firstName;
        } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
          name = alternateName;
        }
      }
    } catch {}

    if (!name) {
      name = await Users.getNameUser(leftParticipantFbId);
    }

    if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
      name = 'Member';
    }

    if (settings.antiout) {
      try {
        await api.addUserToGroup(leftParticipantFbId, threadID);
        send.send(`🔒 ${name}, you can't leave! Anti-out is enabled.`, threadID);
        return;
      } catch {}
    }

    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { threadName: 'this amazing group', participantIDs: [] };
    }

    const groupName = threadInfo.threadName || 'this amazing group';
    const memberCount = threadInfo.participantIDs?.length || 0;
    const leaveDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const leaveTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    try {
      // Step 1: Build goodbye message
      let goodbyeMsg = `╭──〔❨👋❩〕──╮
  ✨ 𝐌𝐄𝐌𝐁𝐄𝐑 𝐋𝐄𝐅𝐓 ✨  
╰──〔❨👋❩〕──╯\n\n`;

      goodbyeMsg += `💔 Someone Left 💔\n ${groupName} \n`;
      goodbyeMsg += `${'꘏'.repeat(18)}\n\n`;

      goodbyeMsg += `👋 Member Left Alert 👋\n`;
      goodbyeMsg += `${'⫘⫘'.repeat(5)}\n`;
      goodbyeMsg += `🚶 ${name} has left the group!\n`;

      // Statistics section
      goodbyeMsg += `\n${'꘏'.repeat(18)}\n`;
      goodbyeMsg += `📊 Group Statistics 📊\n`;
      goodbyeMsg += `${'⫘⫘'.repeat(5)}\n`;
      goodbyeMsg += `👥 Remaining: ${memberCount} souls\n`;
      goodbyeMsg += `📅 Date: ${leaveDate}\n`;
      goodbyeMsg += `🕐 Time: ${leaveTime}\n`;

      // Footer
      goodbyeMsg += `\n${'𓎡'.repeat(14)}\n`;
      goodbyeMsg += `😢 We'll miss you! Come back soon! 😢\n`;
      goodbyeMsg += `${'═'.repeat(19)}`;

      // Step 2: Download and send GIF with message
      try {
        const gifIndex = Math.floor(Math.random() * GIF_URLS.length);
        const gifUrl = GIF_URLS[gifIndex];

        const gifData = await downloadFile(gifUrl);
        if (gifData && gifData.length > 1000) {
          const tmpDir = path.join(__dirname, '../cache');
          fs.ensureDirSync(tmpDir);
          const gifPath = path.join(tmpDir, `leave_${Date.now()}.png`);
          fs.writeFileSync(gifPath, gifData);

          const gifStream = fs.createReadStream(gifPath);
          // Send message with GIF attachment
          await api.sendMessage({
            body: goodbyeMsg,
            attachment: gifStream
          }, threadID);

          setTimeout(() => {
            try { fs.unlinkSync(gifPath); } catch (e) {}
          }, 5000);

          console.log('Goodbye message with GIF sent successfully');
        } else {
          console.log('Failed to download GIF, sending message only');
          await api.sendMessage(goodbyeMsg, threadID);
        }
      } catch (gifError) {
        console.error('GIF send error:', gifError.message);
        // Send just the message if GIF fails
        await api.sendMessage(goodbyeMsg, threadID);
      }

    } catch (error) {
      console.error('Leave event error:', error);
      // Fallback - send basic goodbye message
      let basicMsg = `👋 ${name} has left ${groupName}!\n👥 Remaining: ${memberCount} members`;
      await api.sendMessage(basicMsg, threadID);
    }
  }
};
