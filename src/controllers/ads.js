const modelAds = require('../models/ads')
const { errorCatch } = require('../helpers/errorHandle')
const { consoleMessage } = require('../helpers/console')
const { checkLog, registerLog, nextUser } = require('../controllers/userLog')
const { singleSend } = require('../controllers/messenger')

const checkAds = (data) => {
    if (!data) {
        consoleMessage('Not ads found', 'red')
    } else {
        consoleMessage(`Ads ${data.name} found`, 'green')
    }

}

const playAds = async (name, testMode = false) => {
    try {
        const resAds = await modelAds.findOne({ name })
        checkAds(resAds)
        const user = await nextUser()
        const check = await checkLog({ userId: user._id, adsId: resAds._id })

        if (testMode) {
            const testMessage = process.env.FB_MESSAGE || 'test message'
            const testUUID = process.env.FB_UID_TEST
            singleSend({ fb_uid: testUUID, fb_message: testMessage }, null, null)
            return
        }

        if (!check) {
            const msg = resAds.message.replace('%NAME%', user.name)
            singleSend({ fb_uid: user.uuid, fb_message: msg }, user._id, resAds._id)
        } else {
            playAds()
        }


    } catch (e) {
        errorCatch(e)
    }
}

const createAds = async (data) => {
    try {

        const resAds = await modelAds.findOneAndUpdate({ name: data.name }, data, {
            upsert: true,
            new: true
        })
        return resAds
    } catch (e) {
        errorCatch(e)
    }
}

module.exports = { playAds, createAds }