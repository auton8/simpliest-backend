const mongoose = require('mongoose');

const connect = () => {
    const mongoDBUri = process.env.MONGODB_URI;

    // Connect to MongoDB using Mongoose
    mongoose.connect(mongoDBUri, {
        enableUtf8Validation: false,
        // keepAlive: true,
        connectTimeoutMS: 999999,
        heartbeatFrequencyMS: 5000,
        socketTimeoutMS: 999999,
        waitQueueTimeoutMS: 999999,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 1000
    }).then(() => {
        console.log('DATABASE CONNECTED..');
    }).catch((err) => {
        console.error('ERROR CONNECTING DATABASE:', err);
    });

    const db = mongoose.connection;

    process.on('SIGINT', () => {
        db.close(() => {
            console.log('DATABASE DISCONNECTED DUE TO APPLICATION TERMINATION..');
            process.exit(0);
        });
    });
};

module.exports = { connect };
