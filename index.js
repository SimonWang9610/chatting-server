const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const http = require('http');

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
