const mongoose = require('mongoose')

const AdsSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        message: {
            type: String
        },
        attached: {
            type: String
        },
        answer: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('ads', AdsSchema)