const express = require('express')
const dotenv = require('dotenv')
const axios = require('axios')

const app = express()
const http = require('http');

const port = process.env.PORT || 3000
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

var bodyParser = require('body-parser');

var cors = require('cors')

dotenv.config()


app.get('/', (req, res) => {
    const body = `Welcome to Concierge Client<br/>
        Client address:${req.protocol}://${req.headers.host}/index.html<br/>
        Webhook to be registered: ${req.protocol}://${req.headers.host}/webook<br/>
    `
    res.send(body)
})

app.use(express.static('public'))


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('new person', (msg) => {
        io.emit('new person', msg);
    });
});
//app.use(express.json())
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));

const loginUrl = `${process.env.WELCOME_API_URL}/executive/log-in`
const body = {
    "email": process.env.WELCOME_USERNAME,
    "password": process.env.WELCOME_PASSWORD
}
const loginHeaders = {
    'Content-Type': 'application/json',
    'api-version': '1.0',
    'x-api-key': process.env.WELCOME_API_KEY
}
let adminToken = undefined;

axios.post(loginUrl, body, { "headers": loginHeaders })
    .then(loginData => {
        adminToken = loginData.data.token
    })
    .catch(err => {
        console.error(err.response)
    })

// Payload example
// {
//     "track_id": "45",
//     "identity": "64106939ebb33e25be4e765e",
//     "frame": "<base64_encoded_image>",
//     "customer_info": {
//       "customerId": "64106939ebb33e25be4e765e",
//       "interviews": [{
//         "interviewId":"2456939ebb33e25be4e765e",
//         "selfieBase64":"<base64_encoded_image>"
//         "externalId":"5606939ebb33e25be4e765e"
//       }]
//     }
// }    
app.post('/webhook', (req, res) => {
    //console.log(req.body)
    if (req.body.customer_info.interviews.length > 0) {
        let interviewId = req.body.customer_info.interviews[0].interviewId
        const url = `${process.env.WELCOME_API_URL}/omni/get/ocr-data?id=${interviewId}`
        const headers = {
            'Content-Type': 'application/json',
            'api-version': '1.0',
            'x-api-key': process.env.WELCOME_API_KEY,
            'X-Incode-Hardware-Id': adminToken
        }
        axios.get(url, { headers }).then(data => {
            io.emit('new person', {
                name: data.data.name.fullName,
                image: req.body.frame
            });
        }).catch(err => console.err(err))

    }

    //io.emit('new person', req.body);
    res.send({})
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})