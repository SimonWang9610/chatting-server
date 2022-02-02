const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const http = require('http');

const updater = require('./handlers/updater');
const dispatchers = require('./handlers/dispatcher');

const redis = require('./cache/redis').create();
const collections = require('./database/db');

// database logics
const contactLogic = require('./logics/contact-logic');
const messageLogic = require('./logics/message-logic');

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({server: httpServer});

// watch collection changes
// const contactStream = collections.contacts.watch();
// const chatStream = collections.chats.watch();
// const messageStream = collections.messages.watch();

app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.text());

app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Override'));
app.use(methodOverride('X-Method-Override'));


app.post('/contacts', async (req, res, next) => { 
    const username = req.body.username;

    let client = await redis.hget('clients', username);
    client = JSON.parse(client);

    const contactCursor = collections.contacts.find();
    
    contactCursor.forEach((doc) => {
        let contact = {
            topic: doc.topic,
            identity: doc.username,
            data: {
                contact: doc.username,
                lastLogin: doc.lastLogin,
                online: doc.online
            }
        };

        client.send(JSON.stringify(contact));
    });
});

app.post('/logout', async (req, res, next) => {
    const username = req.body.username;

    collections.contacts.findOneAndUpdate(
        {
            identity: username
        },
        {
            $set: {
                online: 0, lastLogin: Date.now()
            }
        }
    );
});


wss.on('connection', (ws, req) => {
    const username = req.url;

    let res =  {
        topic: 'Topic.login',
        data: {
            success: true,
        }
    };

    dispatchers.login(res, ws);
    
    console.log('socket request: ' + req.url + ', response: ' + JSON.stringify(res));

    // consume all messages cached on the server database
    // dispatchers.consume(username, ws);

    // ws.on('message', (data) => {
        
    //     const msg = JSON.parse(data);

    //     dispatchers.messaging(msg);
    // });

    ws.on('close', () => {

        // TODO: update lastRead
        const msg = {
            topic: 'Topic.logout',
            identity: username,
            lastRead: Date.now(),
        }
        
        dispatchers.logout(msg);
    });
});

// contactStream.on('change', next => { 

//     const msg = {
//         topic: next.fullDocument.topic,
//         identity: next.fullDocument.identity,
//         data: {
//             contact: next.fullDocument.identity,
//             lastRead: next.fullDocument.lastRead,
//             online: next.fullDocument.online
//         }
//     }

//     dispatchers.broadcast(msg);
// });

// chatStream.on('change', next => {
    
//     if (next.operationType !== 'delete') {
//         const msg = {
//             topic: next.fullDocument.topic,
//             chatId: next.fullDocument.id,
//             chatName: next.fullDocument.name,
//             members: next.fullDocument.members,
//             // always broadcast the last message
//             msg: next.fullDocument.lastMessage,
//             creation: next.fullDocument.messageCreation,
//             sender: next.fullDocument.lastSender,
//         }
//         dispatchers.messaging(msg);
//     }
// });


// app.on('upgrade', async (req, socket, head) => { 
    
//     console.log('receive request: ' + JSON.stringify(req));

//     wss.handleUpgrade(req, socket, head, (ws) => { 
//         console.log('handling upgrade...');
//         wss.emit('connection', ws, req);
//     });
// });