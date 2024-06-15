const mongoose = require('mongoose');
const { constants } = require('../config')

exports.mongodbConnection = async () => {
    try {
        mongoose.connect(constants.MONGO_URL)
            .then(() => console.log('mongoDB Connected!'))
            .catch(() => console.log('mongoDB connection Error'))
            
    } catch (error) {
        console.log('mongodbConnection Error')
    }
}