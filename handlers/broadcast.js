const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const redis = require('../cache/redis').create();


// broadcast Topic.contact to others
async function broadcastToClients(message) {

    const updated = await contactLogic.upsert(message.identity, message.data.online);

    if (updated.acknowledged) {
        const clients = await redis.hvals('clients');

        for (let clientStr of clients) {
            let client = JSON.parse(clientStr);
            client.send(JSON.stringify(message));
        }
    }

}

async function genesisMessaging(message) {
    
    const updated = await chatLogic.upsert(message);

    // if (updated, acknowledged) {

    //     const msg = {
    //         topic: 'Topic.chat',
    //         chatName: message.chatName,

    //     };
    //     for (let member of message.members) {
    //         let clientStr = await redis.hget('clients', member);
    //         let client = JSON.parse(clientStr);
    //         client.send
    //     }
    // }
}

async function getAllChats(username, ws) {
    const chats = await chatLogic.getAllChats(username);

    for (let chat of chats) {
        let msg = {
            topic: 'Topic.chat',
            identity: chat.id,
            data: {
                chatName: chat.name,
            }
        }

        ws.send(JSON.stringify(msg));
    }
}

module.exports = {
    broadcastToClients,
    genesisMessaging,
    getAllChats,
}