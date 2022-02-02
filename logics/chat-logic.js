const { chatModel } = require('../database/models');

const upsert = (data) => {

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

const addMember = (chatId, newMembers) => {
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

const removeMember = (chatId, targetMember) => {
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

const getMembers = (chatId) => {
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

const getAllChats = (username) => {
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
