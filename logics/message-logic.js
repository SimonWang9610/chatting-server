const { messageModel } = require('../database/models');


const cacheMessage = (message) => {
    return messageModel.updateOne(
        {
            chatId: message.chatId,
        },
        {
            $setOnInsert: {
                chatId: message.chatId,
                chatName: message.chatName,
                sender: message.sender,
                text: message.text,
                creation: message.creation,
                unread: message.unread,
            }
        },
        {
            upsert: true,
        }
    );
};

const decrementUnread = (chatId) => {
   return  messageModel.updateOne(
        {
            chatId: chatId,
        },
        {
            $inc: {
                unread: -1,
            }
        }
    );
};

const clear = () => {
    return messageModel.deleteMany(
        {
            unread: {
                $eq: 0,
            }
        }
    );

}

const history = (username, lastRead) => {
    // retrieve all messages created since the last login/read of users
    return messageModel.find(
        {
            members: username,
            unread: {
                $gt: 0,
            },
            creation: {
                $gt: lastRead
            }
        }
    ).sort({
        creation: 1,
    });
}

module.exports = {
    cacheMessage,
    decrementUnread,
    clear,
    history,
}