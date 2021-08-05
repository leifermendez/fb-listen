const mongoose = require('mongoose')

const UserLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            require: true
        },
        adsId: {
            type: mongoose.Types.ObjectId,
            require: true
        },
        replay: {
            type: Boolean,
            default: false
        },
        uuid: {
            type: String,
            require: true
        },
        userFb: {
            type: String
        },
        messageFromUser: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('userlog', UserLogSchema)