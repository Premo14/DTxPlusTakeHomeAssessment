const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { initiateCall, sendSMS } = require('../services/twilio');
const twilio = require('twilio');

// Trigger an outgoing call
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

// TwiML for both outbound and inbound calls
router.all('/voice', (req, res) => {
    const direction = req.body.Direction || 'unknown';
    console.log(`📲 Incoming /voice request. Direction: ${direction}`);

    const twiml = new twilio.twiml.VoiceResponse();

    twiml.pause({ length: 2 });

    twiml.say(
        { voice: 'alice' },
        'Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please leave a message after the beep confirming if you have taken your Aspirin, Cardivol, and Metformin today.'
    );

    twiml.record({
        transcribe: false,
        maxLength: 10,
        timeout: 5,
        playBeep: true,
        trim: 'do-not-trim',
        action: `${process.env.BASE_URL}/api/call/handle-recording`,
        recordingStatusCallback: `${process.env.BASE_URL}/api/call/recording-complete`,
        recordingStatusCallbackMethod: 'POST',
    });

    twiml.say('We did not receive a response. Goodbye.');

    res.type('text/xml');
    res.send(twiml.toString());
});

// Response after recording is complete
router.post('/handle-recording', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thanks! Your response has been recorded. Goodbye.');
    res.type('text/xml');
    res.send(twiml.toString());
});

// Handle transcription and logging after recording
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
        console.log('📥 Starting transcription for:', `${recordingUrl}.mp3`);
        const { transcribedText } = await require('../services/stt').transcribeFromUrl(`${recordingUrl}.mp3`);
        console.log(`📝 Transcription for Call SID ${callSid}:`, transcribedText);

        // Save to call_logs.json
        const logsPath = path.join(__dirname, '..', 'call_logs.json');
        const callData = {
            callSid,
            recordingUrl: `${recordingUrl}.mp3`,
            transcript: transcribedText,
            timestamp: new Date().toISOString()
        };

        let logs = [];
        if (fs.existsSync(logsPath)) {
            logs = JSON.parse(fs.readFileSync(logsPath));
        }
        logs.push(callData);
        fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
        console.log(`🗃️ Call log saved for SID ${callSid}`);

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Error transcribing audio:', error.message);
        res.sendStatus(500);
    }
});

router.post('/status', async (req, res) => {
    console.log('📡 Full Call Status Webhook Body:', req.body);

    const { CallSid, CallStatus, Timestamp, To } = req.body;
    const AnsweredBy = req.body.AnsweredBy || 'unknown';

    console.log(`📞 Call status update - SID: ${CallSid}, Status: ${CallStatus}, Time: ${Timestamp || 'N/A'}`);

    if (
        ['no-answer', 'failed', 'busy', 'canceled'].includes(CallStatus) ||
        (CallStatus === 'completed' && AnsweredBy.startsWith('machine'))
    ) {
        if (To) {
            await sendSMS(To, 'We called to check on your medication but couldn’t reach you. Please call us back or take your medications if you haven’t done so.');
        } else {
            console.warn('⚠️ No "To" field in webhook. Cannot send SMS.');
        }
    }

    res.sendStatus(200);
});

router.get('/logs', (req, res) => {
    const logsPath = path.join(__dirname, '..', 'call_logs.json');

    if (!fs.existsSync(logsPath)) {
        return res.status(200).json([]);
    }

    const logs = JSON.parse(fs.readFileSync(logsPath));
    res.status(200).json(logs);
});

module.exports = router;
