const modelAccount = require('../models/accounts')
const { errorCatch } = require('../helpers/errorHandle')

const createAccount = async (data) => {
    try {
        const { email, } = data
        const resDetail = await modelAccount.findOneAndUpdate({ email },
            {
                ...data, ...{
                    status: 'enabled',
                    lastInteractionAt: Date.now()
                }
            }, {
            upsert: true,
            new: true
        })
        return resDetail
    } catch (e) {
        errorCatch(e)
    }
}

const getAccount = async () => {
    try {

        const init = process.env.EMAIL_AC || null

        let query = {
            status: 'enabled'
        }

        if (init) {
            query = { ...query, ...{ email: init } }
        }

        const lastUser = await modelAccount.findOneAndUpdate(
            query,
            {
                lastInteractionAt: Date.now()
            }, {
            sort: { lastInteractionAt: 1 },
            upsert: true,
            new: true
        })
        return lastUser;
    } catch (e) {
        errorCatch(e)
    }
}

const getAllAccount = async () => {
    try {
        let query = {
            status: 'enabled'
        }

        const lastUser = await modelAccount.find(
            query,
        )
        return lastUser;
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { createAccount, getAccount, getAllAccount }