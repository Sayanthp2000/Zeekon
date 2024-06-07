
var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { resetPassword } = require('../controllers/userController');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    
    username: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    password: {
        type: String, 
        required: true
    },
    resetPasswordOTP: String,
    resetPasswordExpiry: Date,
    
    address: [{
        name: {
            type: String
        },
        email: {
            type: String,
        },
        phone: {
            type: String, 
        },
        pincode: {
            type: Number,
        },
        state: {
            type: String, 
        },
        country: {
            type: String,
        },
        alt_phone: {
            type: String,
        },
        city: {
            type: String, 
        },
        landmark: {
            type: String, 
    }}],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        count: {
            type: Number,
            default: 1
        },
        added_at: {
            type: String,
            default: Date.now
    }}],    
    wishlist: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'

        },
        added_at: {
            type: Date,
            default: Date.now
    }}],
    wallet: {
        amount: {
            type: Number,
            default: 0
        },
        created_at: {
            type: Date
        },
        modified_at: {
            type: Date,
            default: Date.now
        },
        status: {
            type: Boolean,
            default: true,
        }},
    created_at: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
   

}); 

// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//       this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
//   });
  
//   // Compare the provided password with the hashed password
//   userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
//   };

const userModel = mongoose.model('Users', userSchema );
module.exports = userModel;