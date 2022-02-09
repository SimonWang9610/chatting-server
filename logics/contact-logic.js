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
                lastRead: new Date(new Date().toUTCString()),
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
        }, 
        {
            lastRead: 1,
        }
    );
}

const isValidName = async (username) => {
    const contactModel = await model();

    const contacts = await contactModel.find(
        {
            identity: username
        }
    );
    console.log('contacts: ' + JSON.stringify(contacts));

    if (contacts.length == 0) {
        return true
    } else {
        return false;
    }
}

module.exports = {
    upsert,
    getLastRead,
    isValidName,
}