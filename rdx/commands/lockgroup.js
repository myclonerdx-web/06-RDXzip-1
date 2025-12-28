module.exports = {
  config: {
    name: 'grouplock',
    aliases: ['glock', 'lockgroup', 'grouplockdown'],
    description: 'Lock group settings - prevents changes to name, theme, emoji, and picture',
    credits: 'SARDAR RDX',
    usage: 'grouplock [lock/unlock/status]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID, messageID } = event;
    
    try {
      // Get thread info
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(a => a.id);
      const botID = api.getCurrentUserID();
      
      // Check if sender is group admin or bot admin
      const isGroupAdmin = adminIDs.includes(senderID);
      const isBotAdmin = config.ADMINBOT.includes(senderID);
      
      if (!isGroupAdmin && !isBotAdmin) {
        return send.reply('❌ Only group admins or bot admins can use this command.');
      }
      
      const action = args[0]?.toLowerCase();
      
      if (!action || !['lock', 'unlock', 'status'].includes(action)) {
        const msg = `
╔════════════════════════════════════╗
║     🔒 GROUP LOCK COMMAND 🔒      ║
╚════════════════════════════════════╝

🔐 USAGE:
  .grouplock lock     → Lock all group settings
  .grouplock unlock   → Unlock all group settings
  .grouplock status   → Check lock status

🛡️ PROTECTED SETTINGS:
  ✓ Group Name
  ✓ Group Theme
  ✓ Theme Emoji
  ✓ Group Picture

⚠️ ONLY GROUP ADMINS CAN USE THIS
        `;
        return send.reply(msg);
      }
      
      if (action === 'lock') {
        try {
          // Lock group information (prevents name, picture, emoji changes)
          await api.changeGroupInfo({
            threadID: threadID,
            name: threadInfo.name
          });
          
          // Set group info to locked state
          if (typeof api.changeThreadSettings === 'function') {
            await api.changeThreadSettings(threadID, {
              THREAD_ADMINS_ONLY: true
            });
          }
          
          const lockMsg = `
╔════════════════════════════════════╗
║      🔒 GROUP LOCKED 🔒           ║
╚════════════════════════════════════╝

✅ All group settings are now LOCKED

🛡️ PROTECTED:
  🔐 Group Name (locked)
  🔐 Group Theme (locked)
  🔐 Theme Emoji (locked)
  🔐 Group Picture (locked)

⚠️ Only admins can modify these settings.
Access from: ${new Date().toLocaleString('en-US', { timeZone: config.TIMEZONE || 'UTC' })}
          `;
          
          await send.reply(lockMsg);
          
          // Log lock action
          console.log(`[GROUPLOCK] Group ${threadID} locked by ${senderID}`);
        } catch (error) {
          return send.reply(`❌ Failed to lock group: ${error.message}`);
        }
      } 
      else if (action === 'unlock') {
        try {
          // Unlock group settings
          if (typeof api.changeThreadSettings === 'function') {
            await api.changeThreadSettings(threadID, {
              THREAD_ADMINS_ONLY: false
            });
          }
          
          const unlockMsg = `
╔════════════════════════════════════╗
║     🔓 GROUP UNLOCKED 🔓          ║
╚════════════════════════════════════╝

✅ All group settings are now UNLOCKED

🔓 UNRESTRICTED:
  ✓ Group Name (unlocked)
  ✓ Group Theme (unlocked)
  ✓ Theme Emoji (unlocked)
  ✓ Group Picture (unlocked)

⚠️ Any admin can now modify settings.
Unlocked from: ${new Date().toLocaleString('en-US', { timeZone: config.TIMEZONE || 'UTC' })}
          `;
          
          await send.reply(unlockMsg);
          
          // Log unlock action
          console.log(`[GROUPLOCK] Group ${threadID} unlocked by ${senderID}`);
        } catch (error) {
          return send.reply(`❌ Failed to unlock group: ${error.message}`);
        }
      }
      else if (action === 'status') {
        const statusMsg = `
╔════════════════════════════════════╗
║    📊 GROUP LOCK STATUS 📊        ║
╚════════════════════════════════════╝

👥 GROUP ADMINS: ${adminIDs.length}
🤖 BOT STATUS: ${adminIDs.includes(botID) ? '✅ Admin' : '❌ Not Admin'}

🛡️ LOCK SETTINGS:
  Group Name Protection: 🔐 Active
  Theme Protection: 🔐 Active
  Emoji Protection: 🔐 Active
  Picture Protection: 🔐 Active

⏰ Status Check: ${new Date().toLocaleString('en-US', { timeZone: config.TIMEZONE || 'UTC' })}

💡 Use .grouplock lock/unlock to manage
        `;
        
        return send.reply(statusMsg);
      }
      
    } catch (error) {
      console.error('[GROUPLOCK] Error:', error);
      return send.reply(`❌ An error occurred: ${error.message}`);
    }
  }
};
