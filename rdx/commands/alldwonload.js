const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "alldownload",
    version: "1.0.0",
    permission: 0,
    prefix: true,
    premium: false,
    category: "media",
    credits: "Video Downloader",
    description: "Download videos from any social media",
    commandCategory: "media",
    usages: ".alldownload [link]",
    cooldowns: 5
};

const API_ENDPOINT = "https://api.nekolabs.web.id/dwn/aio/v1";

async function downloadVideo(videoUrl) {
    try {
        const response = await axios.get(API_ENDPOINT, {
            params: { url: videoUrl },
            timeout: 60000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.success && response.data.result) {
            return response.data.result;
        }
        return null;
    } catch (err) {
        console.log("Video download API error:", err.message);
        return null;
    }
}

async function downloadFile(fileUrl) {
    try {
        const response = await axios.get(fileUrl, {
            timeout: 120000,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://facebook.com/',
                'Origin': 'https://facebook.com'
            }
        });
        return response.data;
    } catch (err) {
        console.log("File download error:", err.message);
        return null;
    }
}

module.exports.run = async function ({ api, event, args }) {
    const videoUrl = args.join(" ");

    if (!videoUrl) {
        return api.sendMessage("❌ Please provide a video link\nUsage: .alldownload [link]", event.threadID, event.messageID);
    }

    // Validate URL
    if (!videoUrl.match(/^https?:\/\/.+/i)) {
        return api.sendMessage("❌ Invalid URL format", event.threadID, event.messageID);
    }

    const loadingFrames = [
        "⏳ Processing... 10%",
        "⏳ Processing... 25%",
        "⏳ Processing... 50%",
        "⏳ Processing... 75%",
        "⏳ Processing... 90%"
    ];

    let processingMsg = null;

    try {
        processingMsg = await api.sendMessage(loadingFrames[0], event.threadID);

        for (let i = 1; i < loadingFrames.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            await api.editMessage(loadingFrames[i], processingMsg.messageID, event.threadID);
        }

        await api.editMessage("🔍 Getting video info...", processingMsg.messageID, event.threadID);

        const videoData = await downloadVideo(videoUrl);

        if (!videoData) {
            api.unsendMessage(processingMsg.messageID);
            return api.sendMessage("❌ Could not fetch video info. The link might be invalid or the video is not accessible.", event.threadID, event.messageID);
        }

        await api.editMessage("📥 Downloading video...", processingMsg.messageID, event.threadID);

        // Get best quality video
        const videos = videoData.medias || [];
        if (videos.length === 0) {
            api.unsendMessage(processingMsg.messageID);
            return api.sendMessage("❌ No video found in this link", event.threadID, event.messageID);
        }

        // Sort by quality (HD first)
        videos.sort((a, b) => {
            const qualityOrder = { 'HD': 1, 'SD': 2, 'unknown': 3 };
            return (qualityOrder[a.quality] || 3) - (qualityOrder[b.quality] || 3);
        });

        const selectedVideo = videos[0];
        const fileBuffer = await downloadFile(selectedVideo.url);

        if (!fileBuffer) {
            api.unsendMessage(processingMsg.messageID);
            return api.sendMessage("❌ Failed to download video file", event.threadID, event.messageID);
        }

        // Create temp file
        const fileName = `video_${Date.now()}.${selectedVideo.extension || 'mp4'}`;
        const filePath = path.join(__dirname, '../cache/', fileName);

        // Ensure cache directory exists
        await fs.ensureDir(path.join(__dirname, '../cache/'));
        await fs.writeFile(filePath, fileBuffer);

        // Prepare message with info
        let infoMsg = `✅ Video Downloaded!\n`;
        infoMsg += `📱 Source: ${videoData.source || 'Unknown'}\n`;
        if (videoData.author) infoMsg += `👤 Author: ${videoData.author}\n`;
        if (videoData.title) infoMsg += `📝 Title: ${videoData.title}\n`;
        if (videoData.duration) infoMsg += `⏱️ Duration: ${Math.round(videoData.duration / 1000)}s\n`;
        infoMsg += `📊 Quality: ${selectedVideo.quality}`;

        api.unsendMessage(processingMsg.messageID);

        return api.sendMessage({
            body: infoMsg,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
            // Clean up temp file after sending
            setTimeout(() => {
                fs.remove(filePath).catch(err => console.log("Cleanup error:", err));
            }, 5000);
        });

    } catch (error) {
        console.error("Error in alldownload command:", error);
        if (processingMsg) {
            api.unsendMessage(processingMsg.messageID);
        }
        return api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
};