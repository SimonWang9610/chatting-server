const publisher = require('../cache/redis').create();
const models = require('../database/models');
const publishing = async () => {
    const contactModel = await models.getModel('contacts');
    const chatModel = await models.getModel('chats');
    const messageModel = await models.getModel('messages');
    
    contactModel.watch(
        {
            fullDocument: 'updateLookup'
        }
    ).on('change', next => {
    
        if (next.operationType === 'insert' || next.operationType === 'update') {
            const msg = {
                topic: next.fullDocument.topic,
                identity: next.fullDocument.identity,
                data: {
                    name: next.fullDocument.identity,
                    lastRead: next.fullDocument.lastRead,
                    online: next.fullDocument.online
                }
            }
        
            publisher.publish(msg.topic, JSON.stringify(msg));
        }
    });
    
    chatModel.watch(
        {
            fullDocument: 'updateLookup'
        }
    ).on('change', next => {
    
        if (next.operationType === 'update') {
            const msg = {
                topic: next.fullDocument.topic,
                identity: next.fullDocument.identity,
                data: {
                    // return the last added member
                    username: next.fullDocument.members[-1],
                    operation: 'update'
                }
            }
            
            publisher.publish(msg.topic, JSON.stringify(msg));
        } else if (next.operationType === 'insert') {
            const msg = {
                topic: next.fullDocument.topic,
                identity: next.fullDocument.identity,
                data: {
                    id: next.fullDocument.identity,
                    name: next.fullDocument.name,
                    operation: 'create'
                }
            };

            publisher.publish(msg.topic, JSON.stringify(msg));
        }
    });
    
    messageModel.watch().on('change', next => {
        if (next.operationType === 'insert') {
            const msg = {
                topic: 'Topic.message',
                identity: next.fullDocument.chatId,
                msgId: next.fullDocument._id,
                data: {
                    chatName: next.fullDocument.chatName,
                    sender: next.fullDocument.sender,
                    text: next.fullDocument.text,
                    creation: new Date(next.fullDocument.creation).getTime(),
                }
            };
    
            publisher.publish(msg.topic, JSON.stringify(msg));
        }
    });
    
};

module.exports = publishing;