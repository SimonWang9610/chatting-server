const models = require('../database/models');

const model = () => {
    return models.getModel('chats');
}

const upsert = async (data) => {

    const chatModel = await model();

    return chatModel.updateOne(
        {
            id: data.chatId
        },
        {
            $set: {
                name: data.chatName,
            },
            $setOnInsert: {
                id: data.chatId,
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
            id: chatId,
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
            id: chatId,
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
            id: chatId
        },
    ).projection(
        {
            members: 1
        }
    );
}

const getAllChats = async (username) => {
    const chatModel = await model();

    return chatModel.find(
        {
            members: username
        }
    ).projection(
        {
            id: 1,
            name: 1,
        }
    );
}

module.exports = {
    addMember,
    removeMember,
    upsert,
    getMembers,
    getAllChats,
}
