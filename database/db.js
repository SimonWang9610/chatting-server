const mongoose = require('mongoose');
const config = require('config');


const initializeDB = async () => {
    await mongoose.connect(config.mongodb.url, {
        user: config.mongodb.user,
        pass: config.mongodb.pass,
        dbName: config.mongodb.dbName,
        autoIndex: config.mongodb.autoIndex,
        autoCreate: config.mongodb.autoCreate,
    });

    return mongoose.connection;
}

module.exports.getConnection = initializeDB;