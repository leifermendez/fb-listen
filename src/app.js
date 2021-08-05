require('dotenv').config()
const { consoleMessage } = require('./helpers/console')
const { dbConnection } = require('./helpers/dbHandle')
const { initFlow } = require('./helpers/console')
const { init, login, closeBrowser } = require('./controllers/messenger')
const { playAds } = require('./controllers/ads')
const { checkSentiment } = require('./services/comprehend')

const cron = require('node-cron');


const initAll = async () => {
    consoleMessage('🐱‍🏍 Welcome remember change ENV.MODE for auto or manual', 'greenBright')
    const ADS = process.env.ADS_NAME || 'test'
    await init()
    await login()
    await closeBrowser()
    await playAds(ADS)
    return
}

const cronStart = async () => {
    const MODE = process.env.MODE || 'manual'
    if (MODE === 'manual') {
        initFlow()
        return
    }

    if (MODE === 'force') {
        initAll()
        return
    }

    const MINUTE = process.env.MINUTES || 10;
    consoleMessage(`📆 Cron every ${MINUTE} minutes...`, 'greenBright')
    cron.schedule(`*/${MINUTE} * * * *`, () => {
        initAll()
    });
}


cronStart();
dbConnection();