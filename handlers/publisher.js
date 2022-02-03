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
                identity: next.fullDocument.id,
                data: {
                    // return the last added member
                    username: next.fullDocument.members[-1]
                }
            }
            
            publisher.publish(msg.topic, JSON.stringify(msg));
        }
    });
    
    messageModel.watch().on('change', next => {
        if (next.operationType === 'insert') {
            const msg = {
                topic: 'Topic.message',
                identity: next.fullDocument.chatId,
                data: {
                    chatName: next.fullDocument.chatName,
                    sender: next.fullDocument.sender,
                    text: next.fullDocument.text,
                    creation: next.fullDocument.creation,
                }
            };
    
            publisher.publish(msg.topic, JSON.stringify(msg));
        }
    });
    
};

module.exports = publishing;