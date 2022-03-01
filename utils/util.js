const crypto = require('crypto');
const { uuid } = require('uuidv4');

const generateUuid = () => {
    return uuid();
}

const generatHashId = (members) => {
    var hash = crypto.createHash('sha256');
    hash.update(payload.members.join(','));

    return hash.digest('base64');
}

module.exports = {
    generateUuid,
    generatHashId,
}