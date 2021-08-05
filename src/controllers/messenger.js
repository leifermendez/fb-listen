const puppeteer = require('puppeteer')
const loginMessenger = require("facebook-chat-api");
const { puppeterConfig, layout, url } = require('../../config')
const fs = require('fs')
const { getAccount } = require('../controllers/accounts')
const { registerLog, findLog, checkLog } = require('../controllers/userLog')
const { consoleMessage } = require('../helpers/console')
const { sendNoty } = require('../helpers/notification')

const pathCookieAccount = `${__dirname}/../../tmp`

var credentials, page, browser, userFb;


// Check ✔
const init = async () => new Promise(async (resolve, reject) => {
    userFb = await getAccount()
    consoleMessage('Starting puppeter', 'blueBright')

    const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
    /** Check if existe cookies file */
    browser = await puppeteer.launch(puppeterConfig);
    const incognitoContext = await browser.createIncognitoBrowserContext();
    page = await incognitoContext.newPage();
    if (fs.existsSync(cookiFileAccount)) {
        const cookiesString = fs.readFileSync(cookiFileAccount);
        const cookies = JSON.parse(cookiesString.toString());
        await page.setCookie(...cookies);
        consoleMessage('Cookie  found ✔', 'green')
        resolve(true)
    } else {
        const cookies = await page.cookies();
        fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
        consoleMessage(`Cookie ${userFb.email} file created ✔`, 'yellow')
        resolve(true)
    }

})

// Check ✔
const login = async () => {
    /**
       * Cookie banner
       */
    const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
    try {


        consoleMessage(`Chek Login ${userFb.email}`, 'yellow')

        const cookiesString = fs.readFileSync(cookiFileAccount, 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())

        if (fs.existsSync(cookiFileAccount) && cookiesParse.length) {
            const cookieFix = cookiesParse.map(a => {
                const key = a.name;
                delete a.name;
                return { ...a, ...{ key } }
            });

            credentials = {
                appState: cookieFix
            };
            consoleMessage('Cookie valid', 'yellow')
            return true
        }
    } catch (e) {
        new Error('ERROR_UNDEFINED')
    }


    try {
        consoleMessage('Starting new login', 'yellow')
        await page.goto(url);
        await page.waitForXPath('//a[@data-cookiebanner="accept_button"]');
        const acceptCookiesButton = (await page.$x('//a[@data-cookiebanner="accept_button"]'))[0];
        await page.evaluate((el) => {
            el.focus();
            el.click();
        }, acceptCookiesButton);

    } catch (e) {
        new Error('ERROR_WAIT_BANNER_COOKIE')
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
    await page.keyboard.type(userFb.email);
    // Focusing on the password input
    await page.focus(layout.login_form.password);
    // Typing the facebook password on password input
    await page.keyboard.type(userFb.password);
    // Clicking on the submit button
    await page.waitForXPath(`//button[@name="login"]`)
    const [loginButton] = await page.$x(`//button[@name="login"]`);
    await page.evaluate((el) => {
        el.click();
    }, loginButton);
    const languageAccount = userFb.language || 'en'
    const layoutLanguage = languageAccount === 'en' ? '//button[@value="OK"]' : '//button[@value="Aceptar"]'
    await page.waitForXPath(layoutLanguage) // ✅
    const [touchLoginButton] = await page.$x(layoutLanguage); // Si el FB esta en español "Aceptar"
    await page.evaluate((el) => {
        el.click();
    }, touchLoginButton);

    const cookies = await page.cookies();
    fs.writeFileSync(cookiFileAccount, JSON.stringify(cookies, null, 2));
    consoleMessage('New cookie valid', 'yellow')


}

// Check ✔
const closeBrowser = () => browser.close()


const generateCredentials = () => {

    try {
        const cookiFileAccount = `${pathCookieAccount}/${userFb._id}.json`
        const cookiesString = fs.readFileSync(cookiFileAccount, 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())

        if (fs.existsSync(cookiFileAccount) && cookiesParse.length) {
            const cookieFix = cookiesParse.map(a => {
                const key = a.name;
                delete a.name;
                return { ...a, ...{ key } }
            });

            credentials = {
                appState: cookieFix
            };
        }

    } catch (e) {
        console.log(e);
    }

}

const singleSend = (body, userId, adsId, media, replay = false, messageFromUser = '') => {
    try {
        var msg;
        if (media) {
            msg = {
                attachment: fs.createReadStream(`${__dirname}/../media/gallery-1.png`)
            }
        }

        generateCredentials()
        loginMessenger(credentials, (err, api) => {
            if (err) return console.error(err);
            if (media) api.sendMessage(msg, body.fb_uid);
            api.sendMessage(body.fb_message, body.fb_uid, async (e, messageInfo) => {
                if (e) {
                    consoleMessage('Error en FB Messenger :(', 'red')
                    sendNoty({ title: 'Error', message: 'Error en FB Messenger', type: 'error' })
                } else {
                    if (adsId) await registerLog({ userId, adsId, uuid: body.fb_uid, replay, userFb: userFb.email, messageFromUser })
                    consoleMessage(`Mensaje enviado! ${body.fb_uid}`, 'green')
                    sendNoty({ title: 'Mensaje enviado 😁', message: `Mensaje enviado! ${body.fb_uid}`, type: 'success' })
                }

            });
        });
    } catch (e) {
        console.log(e);
        return e
    }
}

const listenMessage = () => {
    try {
        const testMode = process.env.TEST_MODE;
        generateCredentials()
        loginMessenger(credentials, (err, api) => {
            if (err) return console.error(err);
            api.listenMqtt((err, message) => {
                if (err) return console.error(err);
                if (message.body !== undefined) {
                    if (testMode === 'true') {
                        const testUUID = process.env.FB_UID_TEST
                        const testAnswer = process.env.FB_ANSWER || 'answer'
                        singleSend({ fb_message: testAnswer, fb_uid: testUUID }, null, null, 'gallery-1.png', true)
                        return
                    }

                    setTimeout(async () => {
                        const userTh = message.threadID
                        const userLog = await findLog(userTh) || { ads: null }
                        console.log('_____USERLOG___', userTh, userLog)
                        api.markAsRead(userTh);
                        api.sendTypingIndicator(userTh)
                        const { answer, _id } = userLog.ads || { answer: null, _id: null }
                        if (answer && !userLog.replay) {
                            setTimeout(() => {
                                singleSend(
                                    { fb_message: answer, fb_uid: userTh },
                                    userLog.userId, _id,
                                    'gallery-1.png',
                                    true,
                                    message.body
                                )
                            }, 1500)
                        }


                    }, 4500)
                }
            });
        });
    } catch (e) {
        console.log(e);
        new Error('algo')
    }

}

module.exports = { init, login, closeBrowser, singleSend, listenMessage }