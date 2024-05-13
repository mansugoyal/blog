let mongoose = require('mongoose');
let connectDB = async () => {

    try {
        mongoose.set('strictQuery', false);
        let connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected: ${connect.connection.host}`);
    } catch (error) {
        console.log("Error-----" + error)
    }

}

module.exports = connectDB;