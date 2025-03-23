const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const initiateCall = async (toPhoneNumber) => {
    try {
        const call = await client.calls.create({
            to: toPhoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: `${process.env.BASE_URL}/api/call/voice`,
            statusCallback: `${process.env.BASE_URL}/api/call/status`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            method: 'POST',
            machineDetection: 'Enable',
            ifMachine: 'Continue',
        });

        console.log(process.env.BASE_URL);

        return call;
    } catch (error) {
        console.error('Error initiating call:', error.message);
        throw error;
    }
};

const sendSMS = async (toPhoneNumber, message) => {
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber
        });
        console.log(`📩 SMS sent to ${toPhoneNumber}`);
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
    }
};

module.exports = {
    initiateCall,
    sendSMS,
};
