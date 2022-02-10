const models = require('../database/models');

const model = () => {
    return models.getModel('chats');
}

const upsert = async (data) => {

    const chatModel = await model();

    return chatModel.updateOne(
        {
            identity: data.chatId
        },
        {
            $set: {
                name: data.chatName,
            },
            $setOnInsert: {
                identity: data.chatId,
                members: data.members,
            }
        },
        {
            upsert: true,
        }
    );
}

const addMember = async (chatId, newMembers) => {
    const chatModel = await model();

    return chatModel.updateOne(
        {
            identity: chatId,
        },
        {
            $push: {
                members: {
                    $each: newMembers,
                }
            }
        }
    );
}

const removeMember = async (chatId, targetMember) => {
    const chatModel = await model();

    return chatModel.updateOne(
        {
            identity: chatId,
            members: {
                $size: {
                    $gt: 2,
                }
            }
        },
        {
            $pull: {
                members: targetMember,
            }
        }
    );
}

const getMembers = async (chatId) => {
    const chatModel = await model();

    return chatModel.findOne(
        {
            identity: chatId
        },
    );
}

const getAllChats = async (username) => {
    const chatModel = await model();

    return chatModel.find(
        {
            members: username
        },
        {
            chatId: 1,
        }
    );
}

const getChat = async (chatId) => {
    const chatModel = await model();

    return chatModel.findOne(
        {
            identity: chatId
        }
    );
}

module.exports = {
    addMember,
    removeMember,
    upsert,
    getMembers,
    getAllChats,
    getChat,
}
