const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const http = require('http');

const { uuid } = require('uuidv4');
const crypto = require('crypto');

// logics
const contactLogic = require('./logics/contact-logic');
const chatLogic = require('./logics/chat-logic');

// handlers
const updater = require('./handlers/database-updater');
const historyMessaging = require('./handlers/history');
const publishing = require('./handlers/publisher');
const subscription = require('./handlers/subscriber');

// redis pubsub
const clients = require('./cache/client');

// app & webSocket
const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({server: httpServer});

publishing();
subscription();

app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.text());

app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Override'));
app.use(methodOverride('X-Method-Override'));


app.post(('/login'), async (req, res, next) => {
    const username = req.body.name;

    const isValid = await contactLogic.isValidName(username);

    if (isValid) {
        return res.status(200).json(
            {
                success: true,
                username: username,
            }
        );
    } else {
        return res.status(200).json({
           success: false, 
        });
    }
});

app.post('/chat', async(req, res, next) => {
    const payload = req.body;

    var hash = crypto.createHash('sha256');
    hash.update(payload.members);

    const chatId = hash.digest().toString();

    const chat = await chatLogic.getChat(chatId);

    if (chat) {
        return res.status(200).json({
            success: true,
            chatId: chat.id,
            chatName: chat.name
        });
    } else {
        return res.status(200).json({
            success: true,
            chatId: chatId,
            chatName: payload.name
        });
    }

});


wss.on('connection', (ws, req) => {
    const username = req.url;

    clients.set(username, ws);

    console.log('socket request: ' + req.url + ', response: ' + JSON.stringify(res));

    updater({
        topic: 'Topic.contact',
        identity: username,
        data: {
            name: username,
            online: true,
        }
    });

    historyMessaging(username, ws);

    ws.on('message', (data) => {
        let msg = JSON.parse(data);

        updater(msg);
    });


    ws.on('close', () => {

        const msg = {
            topic: 'Topic.contact',
            identity: username,
            data: {
                name: username,
                online: false,
            }
        }
        
        updater(msg);
    });

});

app.listen(8080, (err) => {
    console.log('Server is listening on 8080');
});
