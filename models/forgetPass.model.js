const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FORGET = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        verificationCode: {
            type: Number,
            required: true
        },
        // expiresAt: String,
        // resetMethod: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    },
    { timestamps: true, versionKey: false }
);

const RESET = mongoose.model("forgetPassword", FORGET);

module.exports = RESET;
