const models = require('../database/models');

const model = () => {
    return models.getModel('contacts');
}

const upsert = async (username, online = false) => {

    const contactModel = await model();

    return contactModel.updateOne(
        {
            identity: username
        },
        {
            $set: {
                lastRead: new Date().getUTCDate(),
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

const getLastRead = async (username) => {

    const contactModel = await model();

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
    getLastRead,
}