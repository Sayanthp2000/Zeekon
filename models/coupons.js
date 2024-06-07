const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    purchaseAmount : {
        type: Number,
        default: 0,
    },
    discountAmount : {
        type: Number,
        default: 0,
    },
    usedUsers : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    }]
});

couponSchema.pre('save', function(next) {
    const currentDate = new Date();
    const startDate = this.startDate;
    const endDate = this.endDate;
  
    if (currentDate >= startDate && currentDate <= endDate) {
      this.isActive = true;
    } else {
      this.isActive = false;
    }
  
    next();
  });



const couponModel = mongoose.model('Coupon', couponSchema);
module.exports = couponModel;