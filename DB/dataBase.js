const Mongoose = require("mongoose");

const connctDB = Mongoose.connect("mongodb://127.0.0.1:27017/Zeekon");

connctDB
    .then(()=> console.log("Database connected"))
    .catch((err)=>console.log(err.message))