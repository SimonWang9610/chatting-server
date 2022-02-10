const { connect } = require('mongoose');
const db = require('./db');

const schemas = require('./schemas');

const chatModel = async () => {
    const connection = await db.getConnection();
    const model = connection.model('Chat', schemas.chatSchema, 'chats');
    return model;
}

const contactModel = async () => {
    const connection = await db.getConnection();
    const model = connection.model('Contact', schemas.contactSchema, 'contacts');
    return model;
}

const messageModel = async () => {
    const connection = await db.getConnection();
    
    const model = connection.model('Message', schemas.messageSchema, 'messages');
    return model;
}

const getModel = async (collection) => {
    const connection = await db.getConnection();
    
    switch (collection) {
        case 'messages':
            return connection.model('Message', schemas.messageSchema, 'messages');
        case 'chats':
            return connection.model('Chat', schemas.chatSchema, 'chats');
        case 'contacts':
            return connection.model('Contact', schemas.contactSchema, 'contacts');
    }
}

module.exports.getModel = getModel;

module.exports.chatModel = chatModel();
module.exports.contactModel = contactModel();
module.exports.messageModel = messageModel();
