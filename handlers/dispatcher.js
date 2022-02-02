const redis = require('../cache/redis').create();

const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const broadcast = require('./broadcast');s

const login = async (message, ws) => {

    const username = message.identity;

    const msg = {
        topic: 'Topic.contact',
        identity: username,
        data: {
            name: username,
            online: 1,
        }
    };

    await consumeHistoryMessages(message.identity, ws).then(() => {
        // register message listener after sending history messages
        // avoid receiving messages out of order
        ws.on('message', (data) => {
            let obj = JSON.parse(data);
            messaging(obj);
        });

        // broadcast the client to other online clients
        // after enabling message listener
        const result = await redis.hset('clients', { username: JSON.stringify(ws) });

        if (result > 0) {
            broadcast.broadcastToClients(msg);
        }
    });

    // send the login response to client
    ws.send(JSON.stringify(message));

    // broadcast.getAllChats(username, ws);
}

const logout = async (username) => {
    const deleted = await redis.hdel('client', username);

    const msg = {
        topic: 'Topic.contact',
        identity: username,
        data: {
            name: username,
            online: 0,
        }
    }

    if (deleted) {
        broadcast.broadcastToClients(msg);
    }
}

// messaging chatMessages to other online clients
// then save messages to database if unread > 0
const messaging = async (message) => {

    if (message.genesis) {
        broadcast.genesisMessaging(message);
    } else {
        const members = await chatLogic.getMembers(message.identity);

        let unread = members.length;

        for (let member of members) {
            const ws = await redis.hget('clients', member);
    
            if (ws) {
                let wsObj = JSON.parse(ws);
                wsObj.send(JSON.stringify(message), (err) => {
                    if (err) {
                        console.error(`Error on messaging: ${err}`);
                        return;
                    }

                    unread -= 1;
                });
            }
        }
    
        if (unread !== 0) {
            const msg = {
                chatId: message.identity,
                sender: message.data.sender,
                text: message.data.text,
                creation: message.data.creation,
                unread: unread,
            }
            messageLogic.cacheMessage(msg);
        }
    }
}


const consumeHistoryMessages = async (username, ws) => {
    
    const lastRead = await contactLogic.getLastRead(username);

    const docs = await messageLogic.history(username, lastRead);

    if (docs.length > 0) {
        docs.forEach(doc => { 
            const msg = {
                topic: 'Topic.chat',
                identity: doc.chatId,
                data: {
                    chatName: doc.chatName,
                    sender: doc.sender,
                    msg: doc.text,
                    creation: doc.creation
                }
            };

            ws.send(JSON.stringify(msg), (err) => {
                if (err) {
                    console.error(`Error on consume: ${err}`);
                    return;
                }
                messageLogic.decrementUnread(doc.chatId);

            });
        });
    }

    messageLogic.clear();

    return true;
 };

module.exports = {
    login,
    logout,
}