require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465' || process.env.SMTP_PORT === '587' ? (process.env.SMTP_PORT === '465') : false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    debug: true, 
    logger: true 
});

async function testSMTP() {
    console.log('Testing SMTP connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully');
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self
            subject: 'SMTP Test from Doomboard',
            text: 'If you are reading this, your SMTP settings are correct!',
        };

        console.log('Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent:', info.messageId);
    } catch (err) {
        console.error('❌ SMTP Error:', err);
    }
}

testSMTP();
