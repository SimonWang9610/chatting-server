const subscriber = require('../cache/redis').create();
const broadcaster = require('./broadcaster');

module.exports = () => {
    subscriber.psubscribe('Topic.*');

    subscriber.on('pmessage', (pattern, channel, message) => {
        console.log('Got subscribed message: ' + message);
        broadcaster(channel, message);
    });
}
