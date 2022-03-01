const contactLogic = require('../logics/contact-logic');
const messageLogic = require('../logics/message-logic');
const chatLogic = require('../logics/chat-logic');

const sendHistoryMessages = async (username, ws) => {
    
    const contact = await contactLogic.getLastRead(username);
    console.log('get contact:' + JSON.stringify(contact));
    console.log('message last read: ' + contact.lastRead);

    if (!contact) return;

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

    //messageLogic.clear();

    return true;
 };

 const sendAllContacts = async (username, ws) => {
    const contacts = await contactLogic.getAllContacts(username);

    if (contacts && contacts.length > 0) {
        for (let contact of contacts) {
            const msg = {
                topic: 'Topic.contact',
                identity: contact.identity,
                data: {
                    name: contact.identity,
                    online: contact.online,
                }
            }
            ws.send(JSON.stringify(msg), (err) => {
                if (err) {
                    console.log('failed to send Tpoic.contact: ' + JSON.stringify(msg));
                }
            });
        }
    }
 }


module.exports = (username, ws) => {
    sendAllContacts(username, ws);
    sendHistoryMessages(username, ws);
}