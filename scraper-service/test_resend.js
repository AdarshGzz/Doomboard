require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('Testing Resend API connection...');
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Error: RESEND_API_KEY is missing from .env');
        return;
    }

    try {
        console.log('Sending test email via Resend...');
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.SMTP_USER || 'itsadarshofficial1@gmail.com', // Sending to yourself
            subject: 'Resend Test from Doomboard',
            html: '<strong>Resend is working!</strong> You can now push your changes to Render.',
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
        } else {
            console.log('✅ Test email sent successfully:', data.id);
            console.log('Check your inbox (and spam folder)!');
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testResend();
