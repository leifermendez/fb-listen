const login = require("facebook-chat-api");
const fs = require('fs')
const express = require('express')
const { dbReplay } = require('./dbHandle')
const cors = require('cors')
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use(cors())

const messageGlobal = [
    `😉 Entiendo. Mi primo esta comenzando en Youtube hablando de temas de programación y estamos buscando opiniones acerca del contenido \n `,
    `\nSeria de gran 👌 ayuda tú opinion para mejorar. GRACIAS \n\n`,
    `https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw?sub_confirmation=1`
]

const fileGlobal = fs.createReadStream('./media/gallery-1.png')

var credentials;


const singleSend = (m) => {
    console.log(m);
    try {
        console.log(dbReplay.getIndex('/usersreplay', m.threadID, 'fb_uid'));
        if (dbReplay.getIndex('/usersreplay', m.threadID, 'fb_uid') < 0) {
            login(credentials, (err, api) => {
                if (err) return console.error(err);

                var msg = {
                    attachment: fileGlobal
                }

                const msgSingle = messageGlobal.join('');
                api.sendMessage(msg, m.threadID);
                api.sendMessage(msgSingle, m.threadID);
                dbReplay.push("/usersreplay[]", { fb_uid: m.threadID, msgSingle });

            });

        } else {
            console.log('Ya se envio mensaje')
        }
    } catch (e) {
        console.log(e);
        return e
    }
}

const litenMessages = () => {
    try {
        const cookiesString = fs.readFileSync('./cookies.json', 'utf-8');
        const cookiesParse = JSON.parse(cookiesString.toString())
        const cookieFix = cookiesParse.map(a => {
            const key = a.name;
            delete a.name;
            return { ...a, ...{ key } }
        });

        credentials = {
            appState: cookieFix
        };
        login(credentials, (err, api) => {
            if (err) return console.error(err);
            api.listenMqtt((err, message) => {
                if (err) return console.error(err);

                // Marks messages as delivered immediately after they're received
                if (message.body !== undefined) {
                    // api.markAllAsRead();
                    console.log(message.body);

                    setTimeout(() => {
                        api.markAsRead(message.threadID);
                        api.sendTypingIndicator(message.threadID)
                        setTimeout(() => {
                            singleSend(message)

                        }, 1500)
                    }, 4500)
                }
                // 
            });
        });
    } catch (e) {
        console.log(e);
        new Error('algo')
    }
}

litenMessages()