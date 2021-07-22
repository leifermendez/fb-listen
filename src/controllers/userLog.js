const mongoose = require('mongoose')
const modelUserLog = require('../models/userLog')
const modelLead = require('../models/leads')
const { errorCatch } = require('../helpers/errorHandle')

const registerLog = async (data) => {
    try {
        await modelUserLog.create(data)
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

const findLog = async (idUser) => {
    try {
        const userFind = await modelUserLog.aggregate(
            [

                {
                    $sort: { createdAt: 1 }
                },
                {
                    $match: {
                        uuid: idUser
                    }
                },
                {
                    $lookup:
                    {
                        from: 'ads',
                        localField: 'adsId',
                        foreignField: '_id',
                        as: 'ads'
                    }
                },
                {
                    $unwind: '$ads'
                }

            ]
        )
        // const userLatest = await modelUserLog.findOne({ uuid: idUser })
        return userFind.pop()
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

module.exports = { registerLog, checkLog, nextUser, findLog }