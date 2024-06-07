
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [ true, 'category name is required'],
        unique: true
    }, 
    offer: {
        type: {
            type: String,
        },
        amount: {
            type: Number,
        },
        endDate: {
            type: Date,
        },
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const categoryModel = new mongoose.model('category', categorySchema );
module.exports = categoryModel;