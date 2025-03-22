const express = require('express');
const router = express.Router();
const { initiateCall } = require('../services/twilio');
const twilio = require('twilio');

router.post('/', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Missing phone number' });
    }

    try {
        const call = await initiateCall(phoneNumber);
        console.log(`Call initiated. SID: ${call.sid}`);
        res.status(200).json({ message: 'Call triggered', sid: call.sid });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate call' });
    }
});

router.all('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say(
        { voice: 'alice' },
        'Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.'
    );

    twiml.record({
        transcribe: false,
        maxLength: 10,
        action: '/api/call/handle-recording',
        recordingStatusCallback: '/api/call/recording-complete',
    });

    res.type('text/xml');
    res.send(twiml.toString());
});


router.post('/recording-complete', async (req, res) => {
    const recordingUrl = req.body.RecordingUrl;
    const callSid = req.body.CallSid;
    const recordingSid = req.body.RecordingSid;

    if (!recordingUrl) {
        console.error('No recording URL received');
        return res.sendStatus(400);
    }

    console.log(`🎤 Recording available at: ${recordingUrl}.mp3`);

    try {
        const { transcribedText } = await require('../services/stt').transcribeFromUrl(`${recordingUrl}.mp3`);
        console.log(`📝 Transcription for Call SID ${callSid}:`, transcribedText);

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Error transcribing audio:', error.message);
        res.sendStatus(500);
    }
});


module.exports = router;
