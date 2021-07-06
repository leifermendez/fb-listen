const login = require("facebook-chat-api");
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const Excel = require('exceljs')
const { db } = require('./dbHandle')
const app = express();
const cron = require('node-cron');

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use(cors())

const credentials = {
    appState: JSON.parse(fs.readFileSync('./cookie.json', 'utf-8'))
}

const messageGlobal = [
    ' te interesa los cursos de Angular y Node ?'
]

const pathFileCsv = './csv/post_info.csv'

const readUid = async () => {

    const workbook = new Excel.Workbook();
    const worksheet = await workbook.csv.readFile(pathFileCsv);
    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        if (rowNumber === 1) {
            worksheet.spliceRows(0, 1);
            console.log(rowNumber);
            const uid = row.values[2];

            console.log(uid);
            singleSend({ fb_uid: uid, fb_message: `Hola ${messageGlobal.join('')}` })
        }
    });


    return workbook.csv.writeFile(pathFileCsv);
}


// const saveLog = (dataIn) => {
//     if (!db.getData('/users', 'uid', dataIn.uid)) {
//         sendMessage(dataIn)
//         db.push("/users[]", dataIn);
//     }

// }

const singleSend = (body) => {

    try {
        const dataIn = {
            fb_uid: body.fb_uid,
            fb_message: body.fb_message
        }

        if (db.getIndex('/users', body.fb_uid, 'fb_uid') < 0) {
            login(credentials, (err, api) => {
                if (err) return console.error(err);
                console.log(body.fb_message, body.fb_uid);
                api.sendMessage(body.fb_message, body.fb_uid);
                db.push("/users[]", dataIn);
            });
            console.log(dataIn);
            return
        } else {
            console.log('Ya se envio mensaje')
        }
    } catch (e) {
        return e
    }
}

const sendMessage = async (req, res) => {

    try {
        const { body } = req
        singleSend(body)
        res.send({ status: 'success' })
    } catch (e) {
        res.status(500)
        res.send({
            error: 'Error',
            e
        })
    }
}








// app.post('/send-message', sendMessage)

// app.listen('3000', () => {
//     console.log('Listo por el puerto 3000');
// })


cron.schedule('*/2 * * * *', () => {
    readUid()
});
