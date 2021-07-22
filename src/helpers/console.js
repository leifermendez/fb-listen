const chalk = require('chalk');
const prompt = require('prompt');
const accountCtrl = require('../controllers/accounts')

var tmpValues = [
]


const parseDataEmails = (dataRaw) => {
    const data = Object.values(dataRaw)
    tmpValues = data.map((account, index) => {
        return { email: account, password: null, index }
    })
    return
}

const parsePasswords = (dataRaw) => {
    const data = Object.values(dataRaw)
    data.forEach((password, index) => {
        tmpValues[index].password = password;
        accountCtrl.createAccount(tmpValues[index])
    })
    return
}


const consoleMessage = (text, color) => {
    console.log(chalk[color](`:::::::::::--------  ${text}  --------::::::::::`));
}

const accountFlowEmails = (numberAccounts) => {
    try {

        numberAccounts = [...Array.from(Array(numberAccounts).keys())]
        const optionsArray = numberAccounts.map((v, index) => {
            return {
                name: `email_${index}`,
                description: `(${index}) Email`,
                type: 'string',
                required: true
            }
        })

        prompt.get(optionsArray, (err, result) => {
            if (err) { return onErr(err); }
            consoleMessage('Insert passwords in sort', 'yellow')
            parseDataEmails(result)
            accountFlowPasswords(numberAccounts)


        });
    } catch (e) {
        console.log('Error', e)
    }

}

const accountFlowPasswords = (numberAccounts) => {
    try {

        numberAccounts = [...Array.from(Array(numberAccounts.length).keys())]
        const optionsArray = numberAccounts.map((v, index) => {
            return {
                name: `pass_${index}`,
                description: `(${index}) Password`,
                type: 'string',
                required: true,
                hidden: true
            }
        })

        prompt.get(optionsArray, (err, result) => {
            if (err) { return onErr(err); }
            parsePasswords(result)
            return
        });
    } catch (e) {
        console.log('Error', e)
    }

}

const handleOptions = ({ number_accounts }) => {
    try {
        number_accounts = parseInt(number_accounts) || 1;
        accountFlowEmails(number_accounts)

    } catch (e) {
        console.log('Error', e)
    }
}

const initFlow = () => {
    prompt.start();
    prompt.get(['number_accounts'], (err, result) => {
        if (err) { return onErr(err); }
        handleOptions(result)
    });

}

const startFlow = async () => await prompt.get(['mode']);

module.exports = { consoleMessage, initFlow, startFlow }