const mongoose = require('mongoose');
const clientOptions = {
    dbName: 'apinode'
};

exports.initClientDbConnection = async () => {
    try {
        await mongoose.connect(process.env.URL_MONGO, clientOptions)
        console.log('connected');
    } catch (error) {
        console.log(error);
        throw error;
    }
}