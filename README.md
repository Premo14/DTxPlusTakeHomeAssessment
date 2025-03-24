# DTxPlus Take Home Assessment

---

# Voice-Based Medication Reminder System

This project is a voice-first medication reminder system that uses Twilio to initiate calls, ElevenLabs to generate lifelike voice prompts, and Deepgram to transcribe user responses. It records patient confirmations or messages and logs call activity for follow-up.

---

## 🚀 Features

- ✅ Outbound voice calls using Twilio
- ✅ Smart voicemail playback using ElevenLabs TTS
- ✅ User voice recordings
- ✅ Transcription using Deepgram
- ✅ Fallback SMS when call fails or goes unanswered (Twilio restrictions apply)
- ✅ Organized call logs and recordings
- ✅ Inbound call support (same voice prompt + recording)

---

## 🛠 Tech Stack

- Node.js, Express.js
- Twilio Voice API
- Deepgram STT API
- ElevenLabs TTS API
- Ngrok (for testing webhooks)

---

## 📁 Project Structure

```
project-root/
├── public/tts/               # TTS audio from ElevenLabs
├── recordings/{CallSid}/     # One folder per call: .mp3 + .txt transcript
├── routes/calls.js           # All call-related routes + webhooks
├── services/
│   ├── stt.js                # Transcription logic (Deepgram)
│   ├── tts.js                # Text-to-Speech logic (ElevenLabs)
│   └── twilio.js             # Call + SMS helpers
├── call_logs.json            # All past call + transcription metadata
├── index.js                  # Entry point
└── .env                      # Environment variables
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
BASE_URL=https://your-ngrok-url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

---

## ▶️ Getting Started

1. **Clone the repo**
```bash
git clone git@github.com:Premo14/DTxPlusTakeHomeAssessment.git
cd DTxPlusTakeHomeAssessment
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env`** with the above keys

4. **Run the server**
```bash
npm run dev
```

5. **Expose your server using ngrok**
```bash
ngrok http 3000
```
Use the https URL from ngrok as your `BASE_URL`

6. **Configure Twilio**
   Set webhook URLs for:
- Voice: `https://your-ngrok/api/call/voice`
- Status Callback: `https://your-ngrok/api/call/status`
- Recording Callback: `https://your-ngrok/api/call/recording-complete`

---

## 📡 API Endpoints

### POST `/api/call`
Trigger an outbound call.
```json
{
  "phoneNumber": "+15185551234"
}
```

### GET `/api/call/logs`
Returns all previous call logs + transcription info.

---

## ⚠️ Known Limitations

- Twilio Trial numbers prepend a message before playback
- SMS delivery requires A2P 10DLC registration for full functionality
- Voicemail detection is not 100% reliable without a paid Twilio plan

---
