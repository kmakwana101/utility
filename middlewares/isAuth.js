// const bcrypt = require('bcrypt')
// const USER = require('../model/user.model')
const SESSION = require('../models/session.model')
const fs = require('fs');
const jwt = require('jsonwebtoken')

const options = {
    expiresIn: process.env.JWT_EXPIRE_IN_SECONDS,
    algorithm: 'RS256'
};

let secretKey = fs.readFileSync(__dirname + "/./../jwtRS256.key", "utf8");

exports.isAuthenticated = async (req, res, next) => {
    try {
        // console.log(req.headers);
        const token = req.headers["authorization"] || req.headers["authentication"] || req.body.token || req.query.token || req.headers["token"];

        if (!token) {
            throw new Error('A token is required for authentication')
        }

        const tokenArray = token.split(" ");
        if (tokenArray.length !== 2) {
            return res.status(401).json({
                token: tokenArray,
                tokenLength: tokenArray?.length,
                message: "Invalid Token 1",
                header: req.headers
            });
        }

        const authentication = tokenArray[1]

        var FIND_SESSION = await SESSION.findOne({ jwtToken : authentication, isActive: true });

        if (!FIND_SESSION) {
            throw new Error("Your session is expired.")
        }

        const isUser = jwt.verify(authentication, secretKey, options)
        console.log(isUser);

        if (!isUser) throw new Error('invalid token')
        console.log(isUser);

        if (isUser.exp) {
            let tokeExpiresAt = new Date(isUser.exp * 1000);
            const currentDate = new Date();
            // console.log(tokeExpiresAt.getTime(), currentDate.getTime());
            if (tokeExpiresAt.getTime() > currentDate.getTime()) {
                req.userId = isUser.userId;
                req.role = isUser.role;
                req.token = FIND_SESSION.jwtToken
                console.log(req.role + '----------------')
                next();
            } else {
                throw new Error('Token expired')
            }

        } else {
            throw new Error('Invalid token')
        }

    } catch (error) {
        res.status(401).json({
            status: "fail",
            message: error.message
        });
    }
}

//smash