const clients = require('../cache/client');

const chatLogic = require('../logics/chat-logic');
const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');

const contactBroadcast = (contact) => { 

    for (let client of clients.values()) {
        // if (client !== clients.get(contact.identity)) {
        //     client.send(JSON.stringify(contact));
        // }
        client.send(JSON.stringify(contact));
    }
}

const chatBroadcast = async (chat) => {

    const doc = await chatLogic.getMembers(chat.identity);

    for (let member of doc.members) {
        if (clients.has(member) && member !== chat.data.username) {
            clients[member].send(JSON.stringify(chat));
        }
    }
 }

const messageBroadcast = async (message) => {
    
    const doc = await chatLogic.getMembers(message.identity);

    const msgId = message.msgId;
    console.log('message ID: ' + msgId);
    delete message.msgId;

    let read = 0;

    for (let member of doc.members) {
        if (clients.has(member)) {
            clients.get(member).send(JSON.stringify(message));
            read -= 1;
        }
    }

    await messageLogic.updateUnread(msgId, read);
}

module.exports = (channel, message) => {

    const msg = JSON.parse(message);

    switch (channel) {
        case 'Topic.contact':
            contactBroadcast(msg);
            break;
        case 'Topic.chat':
            chatBroadcast(msg);
            break;
        case 'Topic.message':
            messageBroadcast(msg);
            break;
    }
 };