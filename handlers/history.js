const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');

const sendHistoryMessages = async (username, ws) => {
    
    const lastRead = await contactLogic.getLastRead(username);

    const docs = await messageLogic.history(username, lastRead);

    if (docs.length > 0) {
        docs.forEach(doc => { 
            const msg = {
                topic: 'Topic.chat',
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

    await messageLogic.clear();

    return true;
 };

module.exports = sendHistoryMessages;