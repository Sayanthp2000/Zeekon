
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
       create_at: {
        type: Date,
        default: Date.now,
        required: true
    },
    quantity: {
        type: Number, 
        required: true
    },
    size: {
        type: String, 
    },
    images : {
        type : [String],
    },
    color: [{
        type: String, 
    }],
    description: {
        type: String, 
    },
    details: {
        type: String, 
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'category'
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    modified_at: {
        type: Date, 
        default: Date.now
    },
    deleted_at: {
        type: Date, 
    },
    discountPrice: {
        type: Number,
        default: getDiscountPrice,
    } },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
}); 

function getDiscountPrice() {
    return this.price;
}

const Offer = require('./offerModel');

productSchema.methods.calculateDiscountedPrice = async function() {
    const currentDate = new Date();
    const offers = await Offer.find({ $or: [ { product: this._id },{ category: this.category } ],startDate: { $lte: currentDate },endDate: { $gte: currentDate }});

    let discount = 0;
    offers.forEach(offer => {
        if (offer.offerType === 'percentage') discount = Math.max(discount, this.price * (offer.offerValue / 100));
        else if (offer.offerType === 'price') discount = Math.max(discount, offer.offerValue);
    });
    this.discountPrice = Math.round(this.price - discount);
};

productSchema.post('find', async function(docs, next) {
    for (const doc of docs) await doc.calculateDiscountedPrice();
    next()
});

const calculateDiscountPostHook = async function(doc, next) {
    if (doc) await doc.calculateDiscountedPrice();
    next();
};

productSchema.post('findOne', calculateDiscountPostHook);
productSchema.post('findById', calculateDiscountPostHook);

productSchema.virtual('actualPrice').get(function() {
    return this.price;
});



const productModel = new mongoose.model('Product', productSchema );

module.exports = productModel;