var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var token = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    accessToken: String,
    refreshToken: String,
    createdAt: String,
    updateAt: String,
    privateKey: String,
}, { timestamps: true, versionKey: false })

const TOKEN = mongoose.model("token", token)

module.exports = TOKEN