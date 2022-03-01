const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const http = require('http');

const Util = require('./utils/util');
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

app.use((req, res, next) => {
    console.log(req.headers);
    console.log(req.body);
    next();
});

app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.text());

// app.use(methodOverride('X-HTTP-Method'));
// app.use(methodOverride('X-HTTP-Override'));
// app.use(methodOverride('X-Method-Override'));

const httpServer = http.createServer(app);

const wss = new WebSocket.Server({server: httpServer});

publishing();
subscription();

app.post(('/login'), async (req, res, next) => {
    const username = req.body.name;

    const isValid = await contactLogic.isValidName(username);
    
    return res.status(200).json(
        {
            success: true,
            username: username,
        }
    );
});

app.post('/chat', async(req, res, next) => {
    const payload = req.body;

    const chat = await chatLogic.getIfExist(payload.members);

    if (chat) {
        console.log('chat in database: ' + JSON.stringify(chat));
        return res.status(200).json({
            success: true,
            id: chat.identity,
            name: chat.name,
            members: chat.members,
        });
    } else {
        console.log('insert a new chat');
        const chatId = Util.generateUuid();

        const affected = await chatLogic.upsert({
            chatId: chatId,
            chatName: payload.name,
            members: payload.members,
        });

        if (affected.acknowledged) {
            return res.status(200).json({
                success: true,
                id: chatId,
                name: payload.name,
                members: payload.members,
            });
        } else {
            return res.status(500).json({
                success: false,
            });
        }
    }

});


wss.on('connection', (ws, req) => {
    const username = req.url.substring(1);

    clients.set(username, ws);

    console.log('socket request: ' + req.url.substring(1));
    console.log('Alive clients: ' + clients.size);

    updater({
        topic: 'Topic.contact',
        identity: username,
        data: {
            name: username,
            online: true,
        }
    });

    // TODO: get all contacts
    historyMessaging(username, ws);

    ws.on('message', (data) => {

        let dataStr = data.toString('utf-8');

        console.log('Client message: ' + dataStr);

        try {
            let msg = JSON.parse(dataStr);
            updater(msg);
        } catch (e) {
            console.log('Client message: ' + dataStr);
        }
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

httpServer.listen(8080, (err) => {
    console.log('Server is listening on 8080');
});
