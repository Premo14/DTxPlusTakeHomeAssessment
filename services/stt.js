const axios = require('axios');
const fs = require('fs');
const path = require('path');

const transcribeFromUrl = async (twilioMp3Url) => {
    try {

        const twilioResponse = await axios.get(twilioMp3Url, {
            responseType: 'arraybuffer',
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN
            }
        });

        const recordingsDir = path.join(__dirname, '..', 'recordings');
        if (!fs.existsSync(recordingsDir)) {
            fs.mkdirSync(recordingsDir);
            console.log('📁 Created /recordings directory');
        }

        const recordingPath = path.join(recordingsDir, 'recording.mp3');
        fs.writeFileSync(recordingPath, twilioResponse.data);
        console.log('🎧 Saved Twilio recording locally at:', recordingPath);

        const deepgramResponse = await axios.post(
            'https://api.deepgram.com/v1/listen',
            twilioResponse.data,
            {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
                },
                timeout: 10000
            }
        );

        console.log('✅ Deepgram response received');

        const transcribedText = deepgramResponse.data.results.channels[0].alternatives[0].transcript;

        return { transcribedText };

    } catch (error) {
        console.error('❌ Error in transcribeFromUrl:', error.message);
        if (error.response) {
            console.error('📦 Error response from Deepgram:', error.response.data);
        }
        throw error;
    }
};

module.exports = { transcribeFromUrl };
