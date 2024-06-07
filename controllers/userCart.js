
const userModel = require('../models/user')
const productModel = require('../models/products')









exports.cartGet = async ( req, res ) => {
    let cartProducts = await userModel.findOne({ email: req.session.user.email }, { cart: 1 }).populate('cart.product');
    
    const user = await userModel.findById(req.session.user._id).populate('cart.product');
    let totalPrice = user.cart.reduce(( prev, curr ) => ( curr.product.quantity > 0 ) ? prev + curr.product.discountPrice * curr.count : prev + 0, 0 );
    let deliveryCharge = 0;
    if( totalPrice < 500 )  deliveryCharge = parseInt(process.env.DELIVERY_CHARGE);
  
    if (!cartProducts || !user ) return res.status(404).send('User session expired, login again');
    res.render('cart.ejs', { userIn: req.session.userIn, user, cartProducts, totalPrice, deliveryCharge });
  }
     
  
  exports.cartPatch = async ( req, res ) => {
      try{
          const productId = req.params.productId;
          const quantity = req.params.quantity;
          if (!req.session.user) {
              return res.status(404).json({ error: 'User not found please login', redirect: '/login' });
          }
          const userId = req.session.user._id;
  
          const user = await userModel.findById(userId);
          const productIndex = user.cart.findIndex(item => item._id.toString() === productId);
  
          const isProduct = user.cart.find( doc => { return doc.product == productId  });
  
          if(isProduct){
              return res.status(400).json({ error: 'Product is already existed in the cart' });
          }
  
          if(quantity > 10 || quantity <= 0 ){
              return res.status(404).json({ error: 'maximum cart items 10' });
          }
          if (productIndex === -1) {
              user.cart.push({ product: productId, count: quantity });
          } else {
              user.cart[productIndex].count = parseInt(quantity);
          }
  
          await user.save();
  
          console.log('User updated successfully:', user);
  
          return res.status(200).json({ message: 'Cart updated successfully', user, success: true });
      }catch(err){
          console.error(err);
      }
  }
  
  
  
  exports.cartCountPatch = async (req, res) => {
      const productId = req.params.productId;
      const nums = req.params.nums;
      const userId = req.params.userId;
      console.log(productId, nums, userId );
  
      try {
          const user = await userModel.findById(userId);
  
          if (!user) {
              return res.status(404).json({ error: 'User not found', redirect: '/login' });
          }
  
          const productIndex = user.cart.findIndex(item => item.product.toString() === productId);
  
          console.log('productIndex : ' + productIndex);
          console.log(user.cart);
  
          if (nums > 10 || nums <= 0) {
              return res.status(404).json({ error: 'Maximum cart items is 10' });
          }
  
          if (productIndex == -1) {
              return res.status(404).json({ error: 'Product not found in the cart' });
          }
  
          const product = await productModel.findById(productId);
          console.log(product);
  
          if (nums > product.quantity) {
              return res.status(400).json({ error: 'No more products available', productQuantity: product.quantity });
          }
  
          user.cart[productIndex].count = parseInt(nums);
  
          await user.save();
  
          console.log('User updated successfully:', user);
  
          return res.status(200).json({ success: true, message: 'Cart updated successfully' });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
  }
  
  
  exports.cartProductDelete = async (req, res) => {
      try {
          const productId = req.params.productId;
          const userId = req.session.user._id;
          console.log(productId, userId );
          const user = await userModel.findById(userId);
  
          const productIndex = user.cart.findIndex(item => item.product == productId);
  
          if (productIndex === -1) {
              return res.status(404).json({ message: 'Product not found in cart' });
          }
  
          user.cart.splice(productIndex, 1);
          await user.save();
          res.status(200).json({ success: true, message: 'Product successfully removed from cart' });
      } catch (error) {
          console.error('Error removing product from cart:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
  }
  
  exports.preferredAddressGet = ( req, res ) => {
      const addressId = req.params.addressId;
      console.log('addressId : ' + addressId );
      req.session.addressId = addressId;
      if(!addressId || addressId === '' ) {
          return res.json({ message: 'address update as nothinge'});
      }
      if(addressId) return res.json({ message: 'address changed'});
  }
  