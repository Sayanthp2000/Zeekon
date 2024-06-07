

const express = require('express');
const adminController = require('../controllers/adminController');
const admProductController = require('../controllers/admProductController');
const admUserController = require('../controllers/admUserController');
const admCategoryController = require('../controllers/admCategoryController');
const adminModel = require('../models/admin');
const adminAuth = require('../middlewares/authAdmin');
const userModel = require('../models/user');
const categoryModel = require('../models/category');
const productModel = require('../models/products');





exports.productListEditPatch =  async ( req, res ) => {
    console.log('inside add category');
    const { productId, action } = req.body;
    console.log('category  : ' + productId, 'action : ' + action );
    console.log('after req.body');
    try{
        if(!action){
            const result = await productModel.findOneAndUpdate({ _id: productId }, { status: false }, { new: true });
            console.log('result : ' + result );
        }else {
            const result = await productModel.findOneAndUpdate({ _id: productId }, { status: true }, { new: true });
            console.log('result : ' + result );
        }
        res.json({ message: 'created' });
    }
    catch(err){
        console.log('error : ' + err );
    }
}




exports.getProducts = async ( req, res ) => {
    const products = await productModel.find({}).sort({ create_at: -1, modified_at: -1 }).populate('category');
    const categories = await categoryModel.find({});
    // console.log(products)
    res.render('admin-products', { products, categories });
}




exports.addProductGet = async ( req, res ) => {
    try{
        const categorys = await categoryModel.find({});
        // console.log(categorys);
        res.render('add-product.ejs', { categorys });
    }catch(err){
        console.log(err);
    }
}





exports.addProductPost =  async ( req, res ) => {
    try{
        const images = [];
        const { name, price, quantity , size, color, description, category, details } = req.body;
        console.log(name, price, quantity , size, color, description, category, details );
        console.log('req.files : ' + req.files );
        const files = req.files.filename;
        console.log('after requiest files filename');
        console.log('files : ' + files );
        //  console.log('req img : ' + req.images );
        if (!files || files.length === 0) {
           console.log('No files uploaded');
        } else {
            for (const file of files) {
                images.push(files.filename);
            }
        }
        const body = { name, price, quantity , size, color, description, details, images: images };
        console.log('body : ' + body);
        const productResult = await productModel.create(body);
        if(!productResult){
            res.status(400).json({ error: `can't upload into database`});
        }
        console.log('productResult : ' + productResult );
        res.status(201).json({ message: 'product Created successfully'})
    }
    catch(err){
     console.log('error : ' + err );
    }
 }




exports.productDelete = async ( req, res ) => {
    console.log('Inside delete category');
    const productId = req.params.id;
    const result = await productModel.findOneAndDelete({ _id: productId });
    console.log('successfully deleted');
    return res.json({ message: 'deleted'});
}





exports.productsAdd = async (req, res) => {
    try {
      console.log('inside admin/products/add');
      const { name, price, quantity, size, color, description, category, details } = req.body;
      const colorsArray = color.split(',').map(c => c.trim());
      console.log(name, price);
  
      const images = [];
  
      if (!name || !price || !quantity) {
        return res.status(400).json({ error: 'name price and quantity are required' });
      }
  
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          images.push(file.filename);
        }
      } else {
        // If no new images are uploaded, return an error or handle it as per your requirement
        return res.status(400).json({ error: 'At least one image is required' });
      }
  
      const product = {
        name,
        price,
        quantity,
        size,
        images,
        color: colorsArray,
        description,
        details,
        category
      };
  
      const result = await productModel.create(product);
      console.log(result);
  
      if (result) {
        return res.status(201).json({ success: true, message: 'product created successfully' });
      }
    } catch (error) {
      console.log(`product port error : ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };




 exports.productEditGet = async ( req, res ) => {
    try{
        console.log('inside /admin/products/edit/65e19ce446a158b1c9dfacbe');
        const productId = req.params.productId;
        // req.session.productId = productId;
        const categorys = await categoryModel.find({});
        // console.log(categorys);
        // console.log('id: ' + productId );
        const product = await productModel.findOne({ _id: productId }).populate('category');
        res.render('edit-product', { product, categorys });
    }
    catch(err){
        console.log(err);
    }
}





exports.productEditPost = async (req, res) => {
    try {
      const productId = req.params.productId;
      const dbProduct = await productModel.findById(productId);
      const { name, price, quantity, size, color, description, category, details } = req.body;
      const colorsArray = color.split(',').map(c => c.trim());
  
      let imagesArray = dbProduct.images;
  
      if (!name || !price || !quantity) {
        return res.status(400).json({ error: 'name price and quantity are required' });
      }
  
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          imagesArray.push(file.filename);
        }
      }
  
      const product = {
        name,
        price,
        quantity,
        size,
        images: imagesArray,
        color: colorsArray,
        description,
        category,
        details
      };
  
      const result = await productModel.findByIdAndUpdate(productId, product);
      console.log('result :', result);
  
      if (result) {
        return res.status(201).json({ success: true, message: 'product updated successfully' });
      }
    } catch (error) {
      console.log(`product port error : ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.productImageDelete = async ( req, res ) => {
    const imageUrl = req.query.imageUrl;
    const productId = req.query.productId;
    console.log(imageUrl);
    console.log(productId);
    try{
        if(!imageUrl || !productId) return res.status(400).json({ success: false, error: 'product image or product not found in db'});
        const result = await productModel.findByIdAndUpdate(productId, { $pull: { images: imageUrl }});
        if(result) return res.status(200).json({ success: true, message: 'Image removed from product details.'});
    }catch(err){
        console.log(err);
    }
}





