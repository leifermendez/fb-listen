require('dotenv').config()
const { fork } = require('child_process');
const { getAllAccount } = require('./controllers/accounts')
const { dbConnection } = require('./helpers/dbHandle')


const init = async () => {
    const accounts = await getAllAccount() || []
    console.log('--->', accounts)
    accounts.forEach(account => {
        fork('./src/listen', [], { env: { EMAIL_AC: account.email } })
    })
}

init()
dbConnection()