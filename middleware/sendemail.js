const config = require('./env');
const nodemailer = require('nodemailer');

const defaultEmailData = {from: 'bruno.aleluia@gmail.com'};
const SMTP_URL = config().smtp_url;

const sendEmail = async (emailData, smtpUrl=SMTP_URL) => {
    const completeEmailData = Object.assign(defaultEmailData, emailData);
    const transporter = nodemailer.createTransport(smtpUrl);
    return transporter.sendMail(completeEmailData);
}

module.exports = {sendEmail};