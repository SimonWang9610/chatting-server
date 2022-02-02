const { contactModel } = require('../database/models');

const upsert = (username, online = false) => {
    return contactModel.updateOne(
        {
            identity: username
        },
        {
            $set: {
                lastRead: Date.now(),
                online: online,
            },
            $setOnInsert: {
                identity: username,
            }
        },
        {
            upsert: true
        }
    );
}

const getLastRead = (username) => {
    return contactModel.findOne(
        {
            identity: username,
        }
    ).projection(
        {
            lastRead: 1,
        }
    );
}

module.exports = {
    upsert,
    update,
    getLastRead,
}