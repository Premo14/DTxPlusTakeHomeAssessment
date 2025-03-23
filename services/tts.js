const axios = require('axios');
const fs = require('fs');
const path = require('path');

const generateSpeech = async (text, callSid) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    const filename = `${callSid}.mp3`;
    const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        },
        {
            responseType: 'arraybuffer',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            }
        }
    );

    const dirPath = path.join(__dirname, '..', 'public', 'tts');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const outputPath = path.join(dirPath, filename);
    fs.writeFileSync(outputPath, response.data);
    console.log(`🗣️ Saved ElevenLabs speech to ${outputPath}`);

    return `/tts/${filename}`;
};

module.exports = { generateSpeech };
