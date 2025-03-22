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
            method: 'POST'
        });

        console.log(process.env.BASE_URL);

        return call;
    } catch (error) {
        console.error('Error initiating call:', error.message);
        throw error;
    }
};

module.exports = {
    initiateCall,
};
