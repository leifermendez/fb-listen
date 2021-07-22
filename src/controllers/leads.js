const modelLeads = require('../models/leads')
const { errorCatch } = require('../helpers/errorHandle')



const createLead = async (user) => {
    try {
        const resDetail = await modelLeads.findOneAndUpdate({ uuid: user.uuid }, user, {
            upsert: true,
            new: true
        })
        return resDetail
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { createLead }