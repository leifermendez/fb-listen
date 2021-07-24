require('dotenv').config()
const { dbConnection } = require('./helpers/dbHandle')
const { createAds } = require('./controllers/ads')

const laodAds = async () => {
    createAds(
        {
            name: 'leifer',
            message: '%NAME% te interesa los temas de programación Frontend y Backend? Node y esas cosas ?',
            attached: null,
            answer: '😉 Entiendo. Mi primo esta comenzando en Youtube hablando de temas de programación y estamos buscando opiniones acerca del contenido \n\n Seria de gran 👌 ayuda tú opinion para mejorar. GRACIAS \n https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw?sub_confirmation=1'
        }
    )
}

dbConnection();
laodAds()