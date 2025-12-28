module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "SARDAR RDX",
    description: "Send message when bot joins group"
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        const botnick = global.config.BOTNICK || `{ ${global.config.PREFIX} } × ${global.config.BOTNAME || "bot"}`;
        
        try {
            await api.changeNickname(botnick, threadID, api.getCurrentUserID());
        } catch (e) {
            console.log("Nickname error:", e.message);
        }
        
        return api.sendMessage("Hello Everyone🙋‍♂️ 𝐁𝐨𝐭 𝐢𝐬 𝐍𝐨𝐰 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝⛓️", threadID);
    }
}
