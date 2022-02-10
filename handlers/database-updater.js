
const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const updateContact = (contact) => {
    contactLogic.upsert(contact.data.name, contact.data.online);
 }

const updateMessage = async (message) => {
    const chat = await chatLogic.getMembers(message.identity);
    console.log('update message -> chat: ' + JSON.stringify(chat));
    message.unread = chat.members.length;
    // message.creation = new Date(parseInt(message.creation));

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