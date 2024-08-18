const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const sendemail = async (options) => {

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

   
    const mailOptions = {
        from: "G-Nova Teams <hello@Teams.io>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };

   
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


