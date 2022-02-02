const mongoose = require('mongoose');
const schemas = require('./schemas');

const contactModel = mongoose.model(schemas.contactSchema);

const chatModel = mongoose.model(schemas.chatSchema);

const messageModel = mongoose.model(schemas.messageSchema);

module.exports.contactModel = contactModel;
module.exports.chatModel = chatModel;
module.exports.messageModel = messageModel;
