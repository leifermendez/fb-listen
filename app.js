const loginMessenger = require("facebook-chat-api");
const fs = require('fs')
const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')
const Excel = require('exceljs')
const { db } = require('./dbHandle')
const app = express();
const cron = require('node-cron');
const { useCookies, puppeterConfig, cookiesFilePath, username, password, layout, url } = require('./config/config')
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cors())

/**
 * Declarar variables
 */

var credentials, page, browser;



const messageGlobal = [
    ' te interesa los temas de programación Frontend y Backend? Node y esas cosas ?'
]

const pathFileCsv = './csv/codificandola.csv'


const init = async () => new Promise(async (resolve, reject) => {
    browser = await puppeteer.launch(puppeterConfig);

    const incognitoContext = await browser.createIncognitoBrowserContext();
    page = await incognitoContext.newPage();
    if (useCookies && fs.existsSync(cookiesFilePath)) {
        const cookiesString = fs.readFileSync(cookiesFilePath);
        const cookies = JSON.parse(cookiesString.toString());
        await page.setCookie(...cookies);
        resolve(true)
    } else {
        const cookies = await page.cookies();
        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
        resolve(true)
    }

})

const login = async () => {
    /**
       * Cookie banner
       */

    try {
        const cookiesString = fs.readFileSync(cookiesFilePath, 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())

        if (fs.existsSync(cookiesFilePath) && cookiesParse.length) {
            const cookieFix = cookiesParse.map(a => {
                const key = a.name;
                delete a.name;
                return { ...a, ...{ key } }
            });

            credentials = {
                appState: cookieFix
            };
            return true
        }
    } catch (e) {

    }



    try {
        await page.goto(url);
        await page.waitForXPath('//a[@data-cookiebanner="accept_button"]');
        const acceptCookiesButton = (await page.$x('//a[@data-cookiebanner="accept_button"]'))[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, acceptCookiesButton);
    } catch (e) {
        console.log('Error esperando banner cookie');
    }


    /**
     * Esperando por el boton de login
     */

    await page.waitForSelector(layout.login_form.parent);
    // Focusing to the email input
    await page.focus(layout.login_form.email);
    // Clicking on the email form input to be able to type on input
    await page.focus(layout.login_form.email);
    // Typing on the email input the email address
    await page.keyboard.type(username);
    // Focusing on the password input
    await page.focus(layout.login_form.password);
    // Typing the facebook password on password input
    await page.keyboard.type(password);
    // Clicking on the submit button
    await page.waitForXPath(`//button[@name="login"]`) // ✅
    const [loginButton] = await page.$x(`//button[@name="login"]`);
    await page.evaluate((el) => {
        el.click();
    }, loginButton);

    await page.waitForXPath(`//button[@value="OK"]`) // ✅
    const [touchLoginButton] = await page.$x(`//button[@value="OK"]`); // Si el FB esta en español "Aceptar"
    await page.evaluate((el) => {
        el.click();
    }, touchLoginButton);

    const cookies = await page.cookies();
    fs.writeFileSync(`./${cookiesFilePath}`, JSON.stringify(cookies, null, 2));



}

const readUid = async () => {

    const workbook = new Excel.Workbook();
    const worksheet = await workbook.csv.readFile(pathFileCsv);
    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        if (rowNumber === 1) {
            worksheet.spliceRows(0, 1);
            console.log(rowNumber);
            const uid = row.values[2];
            const name = row.values[4];
            singleSend({ fb_uid: uid, fb_message: `${name}${messageGlobal.join('')}` })
        }
    });

    return workbook.csv.writeFile(pathFileCsv);
}

const singleSend = (body) => {

    try {
        const dataIn = {
            fb_uid: body.fb_uid,
            fb_message: body.fb_message
        }

        if (db.getIndex('/users', body.fb_uid, 'fb_uid') < 0) {
            loginMessenger(credentials, (err, api) => {
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


const closeBrowser = () => browser.close()

const initAll = async () => {
    await init()
    await login()
    await closeBrowser()

}



cron.schedule('*/7 * * * *', () => {
    initAll()
    readUid()
});


// app.post('/send-message', sendMessage)

// app.listen('3000', () => {
//     console.log('Listo por el puerto 3000');
// })