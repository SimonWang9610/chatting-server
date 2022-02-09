const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema(
    {
        // _id: Schema.Types.ObjectId,
        topic: {
            type: String,
            default: 'Topic.contact'
        },
        identity: {
            type: String,
            required: true,
        },
        online: {
            type: Boolean,
            default: false,
        },
        lastRead: {
            type: Date,
            default: new Date(new Date().toUTCString()),
        }
    },
    {
        collection: 'contacts',
    }
);

const chatSchema = new Schema(
    {
        topic: {
            type: String,
            default: 'Topic.chat',
        },
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        members: {
            type: [],
            minlength: 2,
            required: true,
        },
        creation: {
            type: Date,
            default: new Date(new Date().toUTCString()),
        },
    },
    {
        collection: 'chats',
    }
);

const messageSchema = new Schema(
    {
        chatId: {
            type: String,
            required: true,
        },
        chatName: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        text: {
            type: String,
        },
        creation: {
            type: Date,
            default: new Date(new Date().toUTCString()),
        },
        unread: {
            type: Number,
            min: 0,
            required: true,
        }
    },
    {
        collection: 'messages',
    }
);

module.exports = {
    contactSchema,
    chatSchema,
    messageSchema,
};