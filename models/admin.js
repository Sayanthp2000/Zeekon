
const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [ true, 'email is required for admin to login']
    },
    password: {
        type: String,
        required: [ true, 'password is required for admin to login']
    }
})


const adminModel = new mongoose.model( 'admin', adminSchema );
module.exports = adminModel;