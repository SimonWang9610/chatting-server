const mongoose = require('mongoose');

const url = 'mongodb://127.0.0.1:27017';

mongoose.connect(url, {
    user: 'simonwang',
    pass: '961002',
    dbName: 'flutter_chat',
    autoIndex: true,
    autoCreate: true,
});

const db = mongoose.connection;

module.exports = {
    contacts: db.collection('contacts'),
    chats: db.collection('chats'),
    members: db.collection('members'),
    messages: db.collection('messages'),
};