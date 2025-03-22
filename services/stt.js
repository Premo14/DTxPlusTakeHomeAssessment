const axios = require('axios');

const transcribeFromUrl = async (audioUrl) => {
    const response = await axios({
        method: 'POST',
        url: 'https://api.deepgram.com/v1/listen',
        headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            url: audioUrl,
        },
    });

    const transcript = response.data.results?.channels[0]?.alternatives[0]?.transcript || 'No speech detected';
    return { transcribedText: transcript };
};

module.exports = {
    transcribeFromUrl,
};
