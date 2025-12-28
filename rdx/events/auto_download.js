const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'autoDownload',
        eventType: 'message',
        description: 'Auto detect and download videos from any social media'
    },

    async run({ api, event }) {
        const { threadID, body, messageID, senderID } = event;

        if (!body) return;

        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        // Regex to detect social media links (Facebook, Instagram, TikTok, Twitter, YouTube, etc.)
        const socialMediaRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|pinterest\.com|snapchat\.com|reddit\.com|vimeo\.com)[^\s]+/gi;
        const matches = body.match(socialMediaRegex);

        if (!matches || matches.length === 0) return;

        const videoUrl = matches[0];
        const API_ENDPOINT = "https://api.nekolabs.web.id/dwn/aio/v1";

        const frames = [
            "📥 Processing... 10%",
            "📥 Processing... 25%",
            "📥 Processing... 50%",
            "📥 Processing... 75%",
            "📥 Processing... 90%"
        ];

        let statusMsg;
        try {
            statusMsg = await api.sendMessage(`🎬 Video Link Detected!\n\n${frames[0]}`, threadID);
        } catch (e) {
            return;
        }

        const cacheDir = path.join(__dirname, "../commands/cache");

        try {
            await api.editMessage(`🔍 Fetching video info...\n\n${frames[1]}`, statusMsg.messageID, threadID);

            // Get video info from API
            const infoResponse = await axios.get(API_ENDPOINT, {
                params: { url: videoUrl },
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!infoResponse.data || !infoResponse.data.success || !infoResponse.data.result) {
                throw new Error("Could not fetch video info");
            }

            const videoData = infoResponse.data.result;
            const videos = videoData.medias || [];

            if (videos.length === 0) {
                throw new Error("No video found");
            }

            // Sort by quality (HD first)
            videos.sort((a, b) => {
                const qualityOrder = { 'HD': 1, 'SD': 2, 'unknown': 3 };
                return (qualityOrder[a.quality] || 3) - (qualityOrder[b.quality] || 3);
            });

            const selectedVideo = videos[0];

            await api.editMessage(`📥 Downloading ${selectedVideo.quality} video...\n\n${frames[2]}`, statusMsg.messageID, threadID);

            // Download video file
            const fileResponse = await axios.get(selectedVideo.url, {
                timeout: 120000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://facebook.com/',
                    'Origin': 'https://facebook.com'
                }
            });

            if (!fileResponse.data || fileResponse.data.length < 1000) {
                throw new Error("Downloaded file is too small or empty");
            }

            await fs.ensureDir(cacheDir);

            const fileName = `video_${Date.now()}.${selectedVideo.extension || 'mp4'}`;
            const filePath = path.join(cacheDir, fileName);

            fs.writeFileSync(filePath, Buffer.from(fileResponse.data));

            const stats = fs.statSync(filePath);
            if (stats.size < 1000) {
                fs.unlinkSync(filePath);
                throw new Error("File too small after download");
            }

            await api.editMessage(`✅ Download Complete!\n\n${frames[4]}`, statusMsg.messageID, threadID);

            // Prepare message with video info
            let infoMsg = `✅ Video Downloaded!\n`;
            infoMsg += `📱 Source: ${videoData.source || 'Unknown'}\n`;
            if (videoData.author) infoMsg += `👤 Author: ${videoData.author}\n`;
            if (videoData.title) infoMsg += `📝 ${videoData.title}\n`;
            infoMsg += `📊 Quality: ${selectedVideo.quality}`;

            // Send video to group
            await api.sendMessage(
                {
                    body: infoMsg,
                    attachment: fs.createReadStream(filePath)
                },
                threadID
            );

            // Auto cleanup
            setTimeout(async () => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    api.unsendMessage(statusMsg.messageID);
                } catch (err) {
                    console.log("Cleanup error:", err.message);
                }
            }, 20000);

        } catch (error) {
            console.log("Auto download error:", error.message);
            try {
                await api.editMessage(`❌ Failed to download video\nError: ${error.message}`, statusMsg.messageID, threadID);
                setTimeout(() => {
                    try { api.unsendMessage(statusMsg.messageID); } catch(e) {}
                }, 5000);
            } catch(e) {}
        }
    }
};