
const nodemailer = require('nodemailer');
const date = require('date-and-time')

exports.OTPGenerator = () => {
    let otpCode = Math.floor(900000 * Math.random() + 100000);
    return otpCode
}

exports.SendEmail = async (to, subject, text, html) => {
    try {
        // console.log(to);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Your SMTP server hostname
            port: 587, // Your SMTP port
            secure: false, // true for 465, false for other ports
            auth: {
                user: "testkmsof@gmail.com", // generated ethereal user
                pass: "qrmffffplanotsmd", // generated ethereal password
            },
        });


        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'testkmsof@gmail.com', // sender address
            to, // list of receivers
            subject, // Subject line
            text: text, // plain text body
            html: html // html body
        });

        console.log('Message sent: %s', info.messageId);
        return true; // Email sent successfully
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        return false; // Failed to send email
    }
}

exports.addDays = function addDays(currentDate, daysToAdd) {
    return date.addDays(currentDate, daysToAdd);
} 


// exports.handleEarningPointsAndBadges = async (userId, type = 'default') => {

//     const typeCheckArray = ['Video', 'image', 'reel', 'invite', 'sayYes', 'default']

//     if (!typeCheckArray.includes(type)) return

//     let pointsEarned;

//     switch (type) {
//         case 'image':
//             pointsEarned = 50;
//             break;
//         case 'Video':
//             pointsEarned = 100;
//             break;
//         case 'reel':
//             pointsEarned = 150;
//             break;
//         case 'invite':
//             pointsEarned = 250;
//             break;
//         case 'sayYes':
//             pointsEarned = 1000;
//             break;
//         case 'default':
//             pointsEarned = 0;
//     }

//     try {

//         const existingUser = await USER.findOne({ where: { userId } });
//         console.log(`old Points for ${existingUser.userId}`, existingUser.badge_points, existingUser.userId)

//         existingUser.badge_points = existingUser?.badge_points !== null ? parseInt(existingUser?.badge_points) + parseInt(pointsEarned) : pointsEarned;

//         await existingUser.save();

//         const updatedPoints = existingUser?.badge_points;

//         console.log(`updated Points for ${existingUser.userId}`, updatedPoints, existingUser.userId)

//         let newLevel;

//         if (updatedPoints >= 5000) {
//             newLevel = 'platinum';
//         } else if (updatedPoints >= 3000) {
//             newLevel = 'gold';
//         } else if (updatedPoints >= 1500) {
//             newLevel = 'bronze';
//         } else {
//             newLevel = 'silver';
//         }

//         if (newLevel && newLevel !== existingUser?.level) {
//             await existingUser.update({ level: newLevel });
//         }
//         return existingUser;

//     } catch (error) {
//         throw Error('points and level change error.')
//     }

// };

