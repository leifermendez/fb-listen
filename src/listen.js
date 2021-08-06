require('dotenv').config()
const { init, login, listenMessage } = require('./controllers/messenger')
const { dbConnection } = require('./helpers/dbHandle')


const initAll = async () => {
    await init()
    await login()
    await listenMessage()
}

initAll();
dbConnection()