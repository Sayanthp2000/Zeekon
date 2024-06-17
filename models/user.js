
var mongoose = require('mongoose');



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
        },
        walletHistory: [{
            amount: { type: Number, required: true },
            balance: { type: Number, required: true },
            transactionType: { type: String, enum: ['credit', 'debit'], default: 'credit' },
            createdAt: { type: Date, default: Date.now }
          }]
        },
    created_at: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
   

}); 

   userSchema.pre('save', async function (next) {
    const user = this;
    console.log(user.isNew);
    if (user.isNew) return next();
    
    try {
      const prevUser = await userModel.findById(user._id).select('wallet.amount');
      console.log(prevUser);
      console.log(user.isModified('wallet.amount'));
      if (user.isModified('wallet.amount')) {
        const previousAmount = prevUser.wallet.amount || 0;
        const newAmount = user.wallet.amount;
        const transactionType = newAmount > previousAmount ? 'credit' : 'debit';
        const amount = Math.abs(newAmount - previousAmount);
        const balance = newAmount;
  
        const walletHistory = { amount, balance, transactionType, createdAt: new Date() };
        user.wallet.walletHistory.push(walletHistory);
        user.wallet.modifiedAt = new Date();
      }
      next();
    } catch (error) {
      next(error);
    }
  });


const userModel = mongoose.model('Users', userSchema );
module.exports = userModel;