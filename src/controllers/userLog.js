const mongoose = require('mongoose')
const modelUserLog = require('../models/userLog')
const modelLead = require('../models/leads')
const { errorCatch } = require('../helpers/errorHandle')

const registerLog = async (data) => {
    try {
        await modelUserLog.create({ userId: data.userId, adsId: data.adsId })
    } catch (e) {
        errorCatch(e)
    }
}


const checkLog = async (data) => {
    try {
        console.log(data)
        const check = await modelUserLog.findOne(
            {
                userId: mongoose.Types.ObjectId(data.userId),
                adsId: mongoose.Types.ObjectId(data.adsId)
            }
        )
        return (check)
    } catch (e) {
        errorCatch(e)
    }
}

const nextUser = async () => {
    try {
        const userLatest = await modelLead.findOneAndUpdate({}, { updatedAt: Date.now() }, {
            upsert: true,
            new: true,
            sort: { updatedAt: 1 }
        })
        return userLatest
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { registerLog, checkLog, nextUser }