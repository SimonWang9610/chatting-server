const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const sendHistoryMessages = async (username, ws) => {
    
    const contact = await contactLogic.getLastRead(username);

    console.log('message last read: ' + contact.lastRead);

    const chats = await chatLogic.getAllChats(username).then((docs) => {
        let arr = [];

        for (let doc of docs) {
            arr.push(doc.chatId);
        }
        return arr;
     });

    const docs = await messageLogic.history(chats, contact.lastRead);
    console.log('History message: ' + docs.length);
    if (docs.length > 0) {
        docs.forEach(doc => { 
            const msg = {
                topic: 'Topic.message',
                identity: doc.chatId,
                data: {
                    chatName: doc.chatName,
                    sender: doc.sender,
                    text: doc.text,
                    creation: doc.creation
                }
            };

            ws.send(JSON.stringify(msg), (err) => {
                if (err) {
                    console.error(`Error on consume: ${err}`);
                    return;
                }
                messageLogic.decrementUnread(doc.chatId);

            });
        });
    }

    messageLogic.clear();

    return true;
 };

module.exports = sendHistoryMessages;