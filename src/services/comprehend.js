var Aws = require('aws-sdk')
Aws.config.loadFromPath(`${__dirname}/../../aws-secret.json`)


var comprehend = new Aws.Comprehend({
    apiVersions: '2017-11-27'
})



//0.83

const checkSentiment = (text = '') => new Promise((resolve, reject) => {

    const params = {
        LanguageCode: 'es',
        Text: text
    }

    comprehend.detectSentiment(params, (err, data) => {
        if (err) {
            console.log('ERROR', err)
            reject(null)
        } else {
            //Sentiment: NEGATIVE ,NEUTRAL, POSITIVE
            resolve(data)
        }
    })
})

module.exports = { checkSentiment }