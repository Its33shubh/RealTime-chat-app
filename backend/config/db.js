const mongoose = require('mongoose')

const connection =async ()=>{
    try {

        await mongoose.connect(process.env.MONGO_URL)

        console.log("mongodb connected successfully");
        
    } catch (error) {
        console.log('db connection error',error.message);
        process.exit(1)
    }
}

module.exports = connection