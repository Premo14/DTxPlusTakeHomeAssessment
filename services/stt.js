const axios = require('axios');
const fs = require('fs');
const path = require('path');

const transcribeFromUrl = async (twilioMp3Url) => {
    try {
        const callSid = twilioMp3Url.split('/Recordings/')[1].split('.')[0];

        console.log(`🎯 Starting transcription for: ${twilioMp3Url}`);
        console.log(`📦 Extracted CallSid: ${callSid}`);

        const twilioResponse = await axios.get(twilioMp3Url, {
            responseType: 'arraybuffer',
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN
            }
        });

        const folderPath = path.join(__dirname, '..', 'recordings', callSid);
        fs.mkdirSync(folderPath, { recursive: true });

        const mp3Path = path.join(folderPath, `${callSid}.mp3`);
        fs.writeFileSync(mp3Path, twilioResponse.data);
        console.log(`🎧 Saved Twilio recording locally as: ${mp3Path}`);

        console.log('📤 Sending to Deepgram...');
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
        console.log('🧠 Deepgram raw response:', JSON.stringify(deepgramResponse.data, null, 2));

        const transcribedText = deepgramResponse.data.results.channels[0].alternatives[0].transcript || '';

        const txtPath = path.join(folderPath, `${callSid}.txt`);
        fs.writeFileSync(txtPath, transcribedText);
        console.log(`📝 Saved transcript to: ${txtPath}`);

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
