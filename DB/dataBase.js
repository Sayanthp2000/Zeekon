const Mongoose = require("mongoose");

const connctDB = Mongoose.connect("mongodb+srv://psaya1852:YX9b5LjbbuT0Uhed@zeekon.ab4en1l.mongodb.net/?retryWrites=true&w=majority&appName=Zeekon");

connctDB
    .then(()=> console.log("Database connected"))
    .catch((err)=>console.log(err.message))