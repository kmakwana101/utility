// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const SessionModelSchema = new Schema({
    notificationToken: {
        type: String,
        required: true
    },
    jwtToken: {
        type: String,
        required: true,
        unique: true
    },
    userAgent: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    generatedAt: {
        type: Number
    },
    isActive: Boolean
},
    {
        collection: 'sessions',
        timestamps: true,
        versionKey: false
    });

module.exports = mongoose.model("sessions", SessionModelSchema);