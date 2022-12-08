import nodemailer from "nodemailer";
import { logger } from "../@Commons/loggers/LoggerService";
import ENV from "../@Config/env";

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(emailTo: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // logger.info("Test Account:", testAccount);

    // create reusable transporter object using the default SMTP transport
    
    // let transporter = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: 'nmkqwjqezu5cn3o2@ethereal.email', // generated ethereal user
    //         pass: 's3qZBZ89Hey5Qd1FUA', // generated ethereal password
    //     },
    //     tls: {
    //         rejectUnauthorized: false, // avoid NodeJs self signed certificate error
    //     },
    // });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        auth: {
            user: ENV.GOOGLE_USER_EMAIL,
            pass: ENV.GOOGLE_USER_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: ENV.GOOGLE_USER_EMAIL, // sender address
        to: emailTo, // list of receivers
        subject: "Change Password ✔", // Subject line
        // text: "Hello world?", // plain text body
        html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
