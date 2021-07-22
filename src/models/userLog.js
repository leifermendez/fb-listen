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
        }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('userlog', UserLogSchema)