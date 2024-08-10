const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const sendemail = async (options) => {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "gnovateam10@gmail.com",
            pass: "ovsc jsoj jzxh gedp"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2. Define the email options 
    const mailOptions = {
        from: "G-Nova Teams <hello@Teams.io>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3. Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendemail
};


