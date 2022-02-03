const models = require('../database/models');

const model = () => {
    return models.getModel('messages');
}

const cacheMessage = async (message) => {

    const messageModel = await model();

    return messageModel.updateOne(
        {
            chatId: message.identity,
        },
        {
            $setOnInsert: {
                chatId: message.identity,
                chatName: message.data.chatName,
                sender: message.data.sender,
                text: message.data.text,
                creation: message.data.creation,
                unread: message.unread,
            }
        },
        {
            upsert: true,
        }
    );
};

const decrementUnread = async (chatId) => {
    const messageModel = await model();

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

const updateUnread = async (chatId, unread) => {
    const messageModel = await model();

    return messageModel.updateOne(
        {
            id: chatId
        },
        {
            $set: {
                unread: unread,
            }
        }
    );
}

const clear = async () => {
    const messageModel = await model();

    return messageModel.deleteMany(
        {
            unread: {
                $eq: 0,
            }
        }
    );

}

const history = async (username, lastRead) => {
    const messageModel = await model();

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
    updateUnread,
    clear,
    history,
}