const mongoose = require('mongoose')

const dbConnection = () => {
    const DB_URI = process.env.DB_URI;
    mongoose.connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }, (err, res) => {
        if (err) {
            console.log('\n***** Error db conection *****')
        }
    })
}

module.exports = { dbConnection }