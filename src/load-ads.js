require('dotenv').config()
const { dbConnection } = require('./helpers/dbHandle')
const { createAds } = require('./controllers/ads')

const laodAds = async () => {
    createAds(
        {
            name: 'leifer',
            message: '%NAME% te interesa los temas de programación Frontend y Backend? Node y esas cosas ?',
            attached: null
        }
    )
}

dbConnection();
laodAds()