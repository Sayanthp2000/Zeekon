const userModel = require('../models/user')
const productModel = require('../models/products')
const orderModel = require('../models/order.js');
const couponModel = require('../models/coupons.js');





exports.checkoutGet = async (req, res) => {
    try {
        const addressId = req.session.addressId;        
        const user = await userModel.findById(req.session.user._id).populate('cart.product');
        console.log(user.cart);
        let totalPrice = user.cart.reduce(( prev, curr ) => ( curr.product.quantity > 0 ) ? prev + curr.product.discountPrice * curr.count : prev + 0, 0 );
        let deliveryCharge = 0;
        if( totalPrice < 500 )  deliveryCharge = (process.env.DELIVERY_CHARGE)*1;
        console.log(totalPrice, deliveryCharge );;
        const coupons = await couponModel.find({});
        // if( addressId === 'new' )
        let address = user.address.find(item => item._id == addressId);
        if(!address) address = "";

        if (!user) return res.status(400).json({ error: 'User session expired, login again' });

        const productDetails = await getProductDetails(user.cart);

        res.render('checkout.ejs', { userIn: req.session.userIn, products: productDetails, user, address, coupons, totalPrice, deliveryCharge });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}



exports.checkoutPost = async (req, res) => {
    try {
      const user = await userModel.findById(req.session.user._id);
      if(!user) return res.status(400).json({ error: 'User not found, Login again'});
    //   if(typeof Number(req.body.pincode) !== 'number' ) return res.status(400).json({ error: 'pincode must be number'});

      console.log(req.body)

      const address = { name, email, phone, pincode, state, country, altphone, city, landmark } = req.body;

      const validationResult = validateAddress( name, email, phone, pincode, state, country, altphone, city, landmark);
      if(!validationResult.success) {
        return res.status(400).json({ success: false, error: validationResult.message, hai: 'hai' });
      }
  
      const productDetails = await getProductDetails(user.cart);
  
      let totalPrice = 0;
      productDetails.forEach((item, index) => {
        const itemPrice = item.product ? (item.product.price || 1) : 0;
        const itemdiscountPrice = item.product ? (item.product.discountPrice || 1) : 0;
        totalPrice += itemPrice * item.count;
        discountPrice = itemdiscountPrice * item.count;
      });
      let originalPrice = totalPrice;
      if(req.body.discountPrice) totalPrice -= req.body.discountPrice;
      console.log('.discountPrice : ' + req.body.discountPrice, 'totalPrice : ' + totalPrice );

      if(totalPrice > 1000 && req.body.paymentMethod === 'COD' ) return res.status(400).json({ success: false, error: 'Cash On Delivery is not available for products more than 1000Rs'});
      if(totalPrice < 500 ) totalPrice += parseInt(process.env.DELIVERY_CHARGE);
  
      const products = [];
      for (const item of productDetails) {
        const dbProduct = await productModel.findById(item.product._id);
        if (dbProduct.quantity < item.count) {
            continue;
        }
        dbProduct.quantity -= item.count;
        await dbProduct.save();
        let deliveryCharge = 0;
           console.log(totalPrice);
        if( totalPrice <= 500 )  deliveryCharge = (process.env.DELIVERY_CHARGE)*1;

        products.push({
          productId: item.product._id,
          quantity: item.count,
          productTotalPrice: (item.product.discountPrice * item.count) + parseInt(deliveryCharge)
          
        });
      }
  
      if (!user) return res.status(400).json({ error: 'login again, session expired' });
      if(req.body.paymentMethod === "wallet"){
        if( user.wallet.amount < totalPrice ) return res.status(400).json({ error: `balance in wallet : ${user.wallet.amount}` });
        user.wallet.amount -= totalPrice;
      }
  
      const order = await new orderModel({
        userId: req.session.user._id,
        products,
        address,
        orderNotes: req.body.ordernotes,
        originalPrice,
        totalPrice,
        paymentMethod: req.body.paymentMethod || 'COD',
        couponUsed: req.body.couponCode || '',
        status: "Processing",
        orderValid: true,
        rzr_orderId: req.body.orderId
      });
  
      const savedOrder = await order.save();
      if (savedOrder) {
        user.cart = [];
        await user.save();
        if (req.body.couponCode) await couponModel.updateOne({ couponCode: req.body.couponCode }, { $push: { usedUsers: user._id } });
        return res.json({ success: true, message: 'Order created successfully' });
      }
    } catch (err) {
      console.error(err);
    }
  };



  exports.checkoutErrorPost = async ( req, res ) => {
    console.log('Inisde checkErrorPost');
    try {
        const user = await userModel.findById(req.session.user._id);
        if(!user) return res.status(400).json({ error: 'User not found, Login again'});
       
  
        console.log(req.body)
  
        const address = { name, email, phone, pincode, state, country, altphone, city, landmark } = req.body;
        console.log( name, email, phone, pincode, state, country, altphone, city, landmark )
  
        const validationResult = validateAddress( name, email, phone, pincode, state, country, altphone, city, landmark);
        if(!validationResult.success) {
          return res.status(400).json({ success: false, error: validationResult.message });
        }
    
        const productDetails = await getProductDetails(user.cart);
    
        let totalPrice = 0;
        productDetails.forEach((item, index) => {
          const itemPrice = item.product ? (item.product.discountPrice || 1) : 0;
          totalPrice += itemPrice * item.count;
        });
        let originalPrice = totalPrice;
        if(req.body.discountPrice) totalPrice -= req.body.discountPrice;
        console.log('.discountPrice : ' + req.body.discountPrice, 'totalPrice : ' + totalPrice );
      
        const products = [];
        for (const item of productDetails) {
          const dbProduct = await productModel.findById(item.product._id);
          if (dbProduct.quantity < item.count) {
              continue;
          }
          dbProduct.quantity -= item.count;
          await dbProduct.save();
          products.push({
            productId: item.product._id,
            quantity: item.count,
            productTotalPrice: item.product.discountPrice * item.count,
          });
        }
    
        if (!user) return res.status(400).json({ error: 'login again, session expired' });
        if(req.body.paymentMethod === "wallet"){
          if( user.wallet.amount < totalPrice ) return res.status(400).json({ error: `balance in wallet : ${user.wallet.amount}` });
          user.wallet.amount -= totalPrice;
        }
    
        const order = await new orderModel({
          userId: req.session.user._id,
          products,
          address,
          orderNotes: req.body.ordernotes,
          originalPrice,
          totalPrice,
          paymentMethod: "Pending",
          couponUsed: req.body.couponCode || '',
          pending: true,
          status: "Pending",
          orderValid: true,
          rzr_orderId: req.body.orderId
        });
    
        const savedOrder = await order.save();
      //   console.log(savedOrder);
        if (savedOrder) {
          user.cart = [];
          await user.save();
          if (req.body.couponCode) await couponModel.updateOne({ couponCode: req.body.couponCode }, { $push: { usedUsers: user._id } });
          return res.json({ success: true, message: 'Order created successfully' });
        }
      } catch (err) {
        console.error(err);
      }
}


exports.validateCheckoutAddress = async ( req, res ) => {
    const address = { name, email, phone, pincode, state, country, altphone, city, landmark } = req.query;
    console.log(address);
  
    const validationResult = validateAddress( name, email, phone, pincode, state, country, altphone, city, landmark);
    if(!validationResult.success) {
      return res.status(400).json({ success: false, error: validationResult.message });
    }
    res.status(200).json({ success: true, message:'checkout Address validated.' });
}

exports.couponCheck = async ( req, res ) => {
    const couponCode = req.params.couponCode;
    const productTotal = req.params.productTotal;
    console.log(couponCode);
    try{
        if(!couponCode) return res.status(300).json({ status: false, error: 'No coupon'});
        const coupon = await couponModel.findOne({ couponCode });
        if(!coupon) return res.status(300).json({ status: false, error: 'No coupon found' });
        if( productTotal >= coupon.purchaseAmount ) {
            let discountPrice = productTotal - coupon.discountAmount;
            const couponresult = await couponModel.updateOne({ couponCode: req.params.couponCode }, { $push: { usedUsers: req.session.user._id }});
        
            return res.status(200).json({ status: true, discountPrice, couponOffer: coupon.discountAmount, couponCode : coupon.couponCode });
        } else return res.status(403).json({ error: `You need to order above ${coupon.purchaseAmount}, to use this coupon` });

    }catch(error){
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}



exports.removeCoupon = async ( req, res ) => {
    const couponCode = req.params.couponCode;
    console.log(couponCode)
    try{
        if(!req.session.user) return res.status(400).json({ error: "user not found, login again" });
        const coupon = await couponModel.updateOne({ couponCode: couponCode }, { $pull: { usedUsers: req.session.user._id }});
        console.log(coupon);
        if(!coupon) return res.status(400).json({ error: "coupon not found"});
        res.status(200).json({ message: "Coupon removed successfully" });
    }catch(err){
        console.log(`Error at removeCoupon \n${err}`);
    }
}


exports.failedPayment = async ( req, res ) => {
    const orderId = req.query.orderId;
    console.log(orderId);
    try{
        const order = await orderModel.findById(orderId);
        console.log(order);
        res.status(200).json({ order});
    }catch(err){
        console.log(err);
    }
}

async function getProductDetails(cart) {
    const productDetails = [];
    for (const item of cart) {
        const product = await productModel.findById(item.product);
        if(product.quantity <= 0) continue;
        if (product) {
            productDetails.push({
                product: product,
                count: item.count,
                _id: item._id,
                added_at: item.added_at
            });
        }
    }
    return productDetails;
}


function validateAddress(name, email, phone, pincode, state, country, altphone, city, landmark) {
    if(!name || !email || !phone || !pincode || !state || !country || !altphone || !city || !landmark ) return { success: false, message: 'Fields with * mark are required'};
    if(email){
         const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g
        let isValidEmail = emailRegex.test(email)
        if(!isValidEmail) return { success: false, message: 'Email is not in the correct format'};
    } 
    const numericRegex = /^[0-9]+$/;

    if (!numericRegex.test(phone) || phone.length !== 10) {
      return { success: false, message: 'Phone number should be 10 digits' };
    }
    
    if (!numericRegex.test(altphone) || altphone.length !== 10) {
      return { success: false, message: 'Alternate phone number should be 10 digits' };
    }
    
    if (!numericRegex.test(pincode) || pincode.length !== 6) {
      return { success: false, message: 'Pincode should be 6 digits' };
    }
    return { success: true };
}