const clients = require('../cache/client');

const chatLogic = require('../logics/chat-logic');
const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');

const contactBroadcast = (contact) => { 

    for (let client of clients.values()) {
        if (client !== clients[contact.identity]) {
            client.send(JSON.stringify(contact));
        }
    }
}

const chatBroadcast = async (chat) => {

    const members = await chatLogic.getMembers(chat.identity);

    for (let member of members) {
        if (clients.has(member) && member !== chat.data.username) {
            clients[member].send(JSON.stringify(chat));
        }
    }
 }

const messageBroadcast = async (message) => {
    
    const members = await chatLogic.getMembers(message.identity);

    let unread = members.length;

    for (let member of members) {
        if (clients.has(member)) {
            clients[member].send(JSON.stringify(message));
        } else {
            unread -= 1;
        }
    }

    messageLogic.updateUnread(message.identity, unread);
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