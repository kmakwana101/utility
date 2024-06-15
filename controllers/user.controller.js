const USER = require('../models/user.model')
const RESET = require('../models/forgetPass.model')
const TOKEN = require('../models/token.model')
const SESSION = require('../models/session.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const fs = require('fs');
const { OTPGenerator, SendEmail, addDays } = require('../utils/handler');
const crypto = require('crypto')

const options = {
    expiresIn: process.env.JWT_EXPIRE_IN_SECONDS,
    algorithm: 'RS256',
    // audience: "https://kmsoft.in/"
};

let secretKey = fs.readFileSync(__dirname + "/./../jwtRS256.key", "utf8");

exports.SignUp = async (req, res) => {
    try {

        let { userName, name, email, password, confirmPassword, role } = req.body

        if (!email) {
            throw new Error('email is required')
        } else if (!password) {
            throw new Error('password is required')
        } else if (!confirmPassword) {
            throw new Error('confirmPassword is required')
        } else if (!role) {
            throw new Error('role is required')
        } else if (!name) {
            throw new Error('name is required')
        } else if (!userName) {
            throw new Error('userName is required')
        }

        if (password !== confirmPassword) {
            throw new Error("Password and confirmPassword not matched.");
        }

        if (!["user", "admin"].includes(role)) {
            throw new Error("Please provide a valid role (either 'user' or 'admin')");
        }

        if (req.body?.password) {
            req.body.password = await bcrypt.hash(req.body.password, 9)
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error(
                "Invalid email format."
            );
        }

        const isMail = await USER.findOne({ email }, { email: 1, _id: 0 })

        // const isMail = await USER.findOne({ email } , {email : 1 , _id : 0}) // specific fields get 
        // const isMail2 = await USER.findOne({ email })

        console.log(isMail)
        if (isMail) throw new Error('Email already exists.')

        req.body.isActive = true
        req.body.role = 'user'
        req.body.isDeleted = false
        req.body.createdAt = Date.now()

        const newUser = await USER.create(req.body)

        const emailSubject = `WELCOME TO KMSOFT!`;
        const emailText = `Hi ${name},

        Congratulations on signing up! 🎉
        
        Your account details:

        Username : ${userName}
        Email : ${email}
        
        Get started:
        
        Complete your profile.

        Explore our features.

        Connect with others.

        Stay updated.

        Questions? Reach out anytime!
        
        Welcome aboard!

        ${name}
        thank you ${role}
        `
        SendEmail(newUser?.email, emailSubject, emailText).catch(err => console.log(err))

        res.status(200).json({
            status: 200,
            message: "User create successfully.",
            data: newUser
        });

    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

exports.Login = async (req, res) => {
    try {
        const { userName, email, password, notificationToken, ipAddress, deviceName, platform } = req.body;
        // console.log(req.body);

        if (!email) {
            throw new Error('email is required')
        } else if (!password) {
            throw new Error('password is required')
        } else if (!notificationToken) {
            throw new Error('notificationToken is required')
        } else if (!deviceName) {
            throw new Error('deviceName is required')
        } else if (!platform) {
            throw new Error('platform is required')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error(
                "Invalid email format."
            );
        }

        const User = await USER.findOne({ email })

        if (!User) {
            throw new Error('User Not Found');
        }

        const passwordMatch = await bcrypt.compare(password, User?.password)

        if (!passwordMatch) {
            throw new Error('password invalid');
        }

        const objectToCreateToken = {
            userName: User?.userName,
            email: User?.email,
            password: User?.password,
            userId: User?._id,
            role: User?.role,
            createdAt: new Date()
        };

        const accessToken = jwt.sign(objectToCreateToken, secretKey, options);

        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const refreshToken = jwt.sign({ userId: User._id }, privateKey, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN_SECONDS,
            algorithm: 'RS256',
        });

        await TOKEN.create({
            accessToken: accessToken,
            refreshToken: refreshToken,
            userId: User._id,
            privateKey,
            createdAt: new Date()
        })

        await SESSION.create({
            notificationToken,
            jwtToken: accessToken,
            userAgent: req.get("User-Agent"),
            ipAddress: req.ip || ipAddress,
            deviceName: deviceName,
            platform: platform,
            userId: User._id,
            isActive: true,
            createdAt: new Date()
        });

        res.status(202).json({
            status: 202,
            message: "User Login Successfully.",
            userRole: objectToCreateToken.role,
            token: accessToken,
            refreshToken,
            userId: User._id
        });

    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body

        if (!email) {
            throw new Error('email is required')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error(
                "Invalid email format."
            );
        }

        const User = await USER.findOne({ email })

        if (!User) {
            throw new Error('User Not Found');
        }

        await RESET.deleteMany({ email: User.email });
        // console.log(User);
        const otp = OTPGenerator()

        await RESET.create({
            verificationCode: otp,
            email: User?.email,
            createdAt: new Date()
        })

        await SendEmail(User?.email, `KMSOFT TESTING`, `OTP : ${otp}`).catch(err => console.log(err));

        res.status(200).json({
            status: 'success',
            message: 'Verification code sent successfully'
        });

    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

exports.compareCode = async (req, res) => {
    try {
        const { email, verificationCode } = req.body

        if (!email) {
            throw new Error('email is required')
        }
        if (!verificationCode) {
            throw new Error('verificationCode is required')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error(
                "Invalid email format."
            );
        }

        const User = await USER.findOne({ email })

        if (!User) {
            throw new Error('User Not Found');
        }

        const reset = await RESET.findOne({
            verificationCode: verificationCode,
            email: email,
        });

        if (!reset) {
            throw new Error("Invalid verification code.");
        }

        res.status(200).json({
            status: "Success",
            message: "Your verification code is accepted.",
        });
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

exports.resetPassword = async function (req, res, next) {
    try {
        // let password = req.body.password;
        let { userName, email, password, confirmPassword } = req.body

        if (!email) {
            throw new Error('email is required')
        } else if (!password) {
            throw new Error('password is required')
        } else if (!confirmPassword) {
            throw new Error('confirmPassword is required')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error(
                "Invalid email format."
            );
        }

        if (password !== confirmPassword) {
            throw new Error("Password is not matched with confirmation password.");
        }

        const User = await USER.findOne({ email });

        const oldAndnewPasswordIsSame = await bcrypt.compare(password, User.password)

        if (oldAndnewPasswordIsSame) {
            throw new Error('New Password Matches Old Password. Please choose a different password for security purposes.')
        }

        password = await bcrypt.hash(password, 10);

        req.body.confirmPassword = undefined;

        // console.log(mail);
        User.password = password;
        User.createdAt = new Date()
        User.save();
        // message = "password changed successfully";

        res.status(200).json({
            status: "Success",
            message: "Your password has been reset.",
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
};

exports.logOut = async function (req, res, next) {
    try {
        // console.log('object',req.headers.authentication);
        // const token = req.headers["authorization"] || req.headers["authentication"] || req.body.token || req.query.token || req.headers["token"];

        // const tokenArray = token.split(" ");

        // if (!(tokenArray.length > 1)) {
        //     res.status(401).json({
        //         token: tokenArray,
        //         tokenLength: tokenArray.length,
        //         message : "Invalid Token 1",
        //         header: req.headers
        //     });
        // }

        // const authentication = tokenArray[1]
        const authentication = req.token

        if (!authentication) {
            throw new Error("Authorization token is missing.");
        }
        // console.log(token);

        const session = { jwtToken: authentication };

        await SESSION.updateOne(session, {
            isActive: false,
        });
        // console.log(SESSION_UPDATE);

        // await SESSION.deleteOne({ jwtToken: authentication });
        // console.log(sessiondelete);

        res.status(200).json({
            status: 200,
            message: "User Logout Successfully.",
            // accessToken: authentication,
        });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            message: error.message,
        });
    }
};

exports.token = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            throw new Error('Please provide a refresh token.');
        }

        const token = await TOKEN.findOne({ refreshToken });

        if (!token) {
            throw new Error('Invalid refresh token.');
        }
        // Verify the refresh token
        const decodedToken = jwt.verify(refreshToken, token?.privateKey, options);
        // console.log(decodedToken);
        // Check if decoded token is valid
        if (!decodedToken) {
            throw new Error('Invalid token.');
        }

        const tokenExpiration = new Date(decodedToken.exp * 1000);
        const currentTime = new Date();

        if (tokenExpiration <= currentTime) {
            throw new Error('Refresh token has expired.');
        }

        const session = await SESSION.findOne({ userId: token.userId, isActive: true });

        if (!session) {
            throw new Error('User session not found.');
        }

        // Find user
        const user = await USER.findOne({ _id: session.userId });

        if (!user) {
            throw new Error('User not found.');
        }

        const accessToken = jwt.sign({
            email: user.email,
            userId: user._id,
            createdAt: Date.now()
        }, secretKey, options);

        await SESSION.findByIdAndUpdate(session._id, { $set: { jwtToken: accessToken } }, { new: true });

        res.status(200).json({
            status: 'Success',
            message: 'Token updated successfully.',
            accessToken: accessToken
        });
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        });
    }
};
