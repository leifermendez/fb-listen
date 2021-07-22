require('dotenv').config()
const Excel = require('exceljs')
const { dbConnection } = require('./helpers/dbHandle')
const { createLead } = require('./controllers/leads')

const pathFileCsv = './csv/codificandola.csv'

const importUser = async () => {
    const FB_UID = 2;
    const FB_NAME = 5;
    const FB_LASTNAME = 6;
    const FB_AVATAR = 3;
    const FB_EMAIL = -1;
    const source = 'TEST'

    const workbook = new Excel.Workbook();
    const worksheet = await workbook.csv.readFile(pathFileCsv);
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const uuid = row.values[FB_UID] || null;
        const name = row.values[FB_NAME] || null;
        const avatar = row.values[FB_AVATAR] || null;
        const lastName = row.values[FB_LASTNAME] || null;
        const email = row.values[FB_EMAIL] || null;
        createLead({ name, lastName, avatar, email, source, uuid })
        console.log(`(${rowNumber}) Importando... \n`)
    })
}

dbConnection();
importUser()