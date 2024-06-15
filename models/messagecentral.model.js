const mongoose = require('mongoose')
const { Schema } = mongoose;

const messagecentralSchema = new Schema({

    verificationId : {
        type : Number,
        required : true
    },
    Number : {
        type : Number
    },
    isDelete : {
        type : 'boolean',
        default : false
    },
},{timestamps : true});

// messagecentralSchema.index({ createdAt: 1, lastUpdatedAt: 1 }, { expireAfterSeconds: 30 });

module.exports = mongoose.model('messagecentral',messagecentralSchema)