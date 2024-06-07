const productModel = require('../models/products');
const categoryModel = require('../models/category');
const offerModel = require('../models/offerModel');
const { castObject } = require('../models/user');


exports.offerModuleGet = async ( req, res ) => {
    const products = await productModel.find({ status: true });
    const categories = await categoryModel.find({ isActive: true });
    const offerProducts = await offerModel.find({ product: { $exists: true }}).populate('product');
    const offerCategory = await offerModel.find({ category: { $exists: true }}).populate('category');
    res.render('adm-offer-module.ejs', { products, categories, offerProducts, offerCategory });
}


exports.offerModulePost = async ( req, res ) => {
    try{
        const { offerValue, startDate, endDate, description, offerType, product, category } = req.body;
        if(!category && !product) return res.json({ error: 'Select the offer Item'});
        if( !startDate || !endDate || !offerValue || !offerType || !description ) return res.json({ error: "All fields are required"});
        const offer = new offerModel(req.body);
        const offerSave = await offer.save();
        res.json({ success: true, message: 'Offer created successfully'});
    }catch(err){
        console.error(`Error inside productOfferPost : ${err}`);
    }
}



exports.deleteOffer = async ( req, res ) => {
    const offerId = req.params.offerId;
    try{
        if(!offerId) return res.json({ error: "Order Id is not available, Error in server" });
        const result = await offerModel.findByIdAndDelete(offerId);
        if(result) {
            return res.json({ success: true, message:'Offer deleted successfully' });
        }else return res.json({ error: "Error in server, can't delete the offer "});
    }catch(err) {
        console.error(err);
    }
}