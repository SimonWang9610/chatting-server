
const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const updateContact = (contact) => {
    contactLogic.upsert(contact.data.name, contact.data.online);
 }

const updateMessage = async (message) => {
    const members = await chatLogic.getMembers(message.identity);
    
    message['unread'] = members.length;

    messageLogic.cacheMessage(message);
}

const updateChat = (chat) => {
    chatLogic.addMember(chat.identity, [chat.data.username]);
}

module.exports = (message) => {
    switch (message.topic) {
        case 'Topic.message':
            updateMessage(message);
            break;
        case 'Topic.chat':
            updateChat(message);
            break;
        case 'Topic.contact':
            updateContact(message);
            break;
    }
};