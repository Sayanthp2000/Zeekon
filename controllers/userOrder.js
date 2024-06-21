

const userModel = require('../models/user')
const orderModel = require('../models/order.js');
const productModel = require('../models/products.js')





exports.orderSingleGet  = async ( req, res )  => {
    try{
        const orderId = req.params.orderId;
        const order = await orderModel.findById(orderId).populate('products.productId');
        // console.log('dbOrder : ' + order);
        let orderStatus = "...";
        if(order.pending) order.orderMessage = 'Pending';
        else if(order.orderValid && !order.orderStatus && !order.returned ) order.orderMessage = 'Arriving';
        else if(!order.orderValid && order.orderStatus && !order.returned ) order.orderMessage = 'Delivered';
        else if(!order.orderValid && !order.orderStatus && !order.returned ) order.orderMessage = 'Cancelled';
        else if(!order.orderValid && !order.orderStatus && order.returned ) order.orderMessage = 'Returned';
        else orderStatus = '.....';
        console.log(order)
        res.render('order-details.ejs', { order, userIn: req.session.user });
        // if(!orderId) return res.status(400).json({ error: 'orderId not found', redirectUrl: false});
        // if(!dbOrder) return res.status(400).json({ error: 'order not found', redirectUrl: false});
        // return res.status(200).json({ message: 'order showing', redirectUrl: `/order/${orderId}`});
    }catch(err) {
        console.log(err);
    }
}



// exports.orderCancellationPath = async ( req, res ) => {
//     const orderId = req.params.orderId;
//     const productId = req.params.productId;
//     console.log( orderId, productId);
//     let user;
//     try{
//         const dbOrder = await orderModel.findById(orderId).populate('products.productId');
//         const orderProduct = dbOrder.products.find( item => item.productId._id.toString() === productId )
//         // console.log(dbOrder);
//         if(dbOrder.paymentMethod !== 'COD'){
//             user = await userModel.findById(dbOrder.userId);
//             if(!user) return res.status(404).json({ error: 'user not found, login again'});
//             user.wallet.amount += parseInt(orderProduct.productTotalPrice);
//             await user.save();
            
//         }
//         const index = dbOrder.products.findIndex( product => product.productId._id.toString() === productId );
//         console.log(index);
//         dbOrder.products[index].orderStatus = false;
//         dbOrder.products[index].orderValid = false;
//         dbOrder.products[index].returned = false;
        
//         await dbOrder.save();
       
//         return res.status(200).json({ success: true, message: 'order cancelled'});
//     }catch(err){
//         console.error(err);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// }

exports.orderCancellationPath = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;
  console.log(orderId, productId);
  let user;
  try {
      const dbOrder = await orderModel.findById(orderId).populate('products.productId');
      const orderProduct = dbOrder.products.find(item => item.productId._id.toString() === productId);

      if (dbOrder.paymentMethod !== 'COD') {
          user = await userModel.findById(dbOrder.userId);
          if (!user) return res.status(404).json({ error: 'User not found, login again' });

          const refundAmount = parseInt(orderProduct.productTotalPrice);
          const newWalletAmount = user.wallet.amount + refundAmount;

          // Create a wallet history entry
          const walletHistoryEntry = {
              amount: refundAmount,
              balance: newWalletAmount,
              transactionType: 'credit',
              description: `Refund for canceled product ,productId: ${productId}`,
              createdAt: new Date()
          };

          // Update the user's wallet
          user.wallet.amount = newWalletAmount;
          user.wallet.walletHistory.push(walletHistoryEntry);
          await user.save();
      }

      const index = dbOrder.products.findIndex(product => product.productId._id.toString() === productId);
      console.log(index);
      dbOrder.products[index].orderStatus = false;
      dbOrder.products[index].orderValid = false;
      dbOrder.products[index].returned = false;

      await dbOrder.save();

      return res.status(200).json({ success: true, message: 'Order cancelled' });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};




// exports.orderReturnPatch = async (req, res) => {
//     const orderId = req.params.orderId;
//     const productId = req.params.productId;
  
//     try {
//       const dbOrder = await orderModel.findById(orderId).populate('products.productId');
  
//       if (!dbOrder) {
//         return res.status(404).json({ error: 'Order not found' });
//       }
  
//       const product = dbOrder.products.find((p) => p.productId._id.toString() === productId);
//       if (!product) {
//         return res.status(404).json({ error: 'Product not found' });
//       }
  
     
       
  
//       product.returned = true;
//       product.orderStatus = false;
//       product.orderValid = false;
  
//       await dbOrder.save();
  
//       return res.status(200).json({ message: 'Product returned successfully' });
//     } catch (err) {
//       console.log(err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//   };


exports.orderReturnPatch = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId;

  try {
      const dbOrder = await orderModel.findById(orderId).populate('products.productId');

      if (!dbOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      const product = dbOrder.products.find((p) => p.productId._id.toString() === productId);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      if (dbOrder.paymentMethod !== 'COD') {
          const user = await userModel.findById(dbOrder.userId);
          if (!user) return res.status(404).json({ error: 'User not found, login again' });

          const refundAmount = parseInt(product.productTotalPrice);
          const newWalletAmount = user.wallet.amount + refundAmount;

          // Create a wallet history entry
          const walletHistoryEntry = {
              amount: refundAmount,
              balance: newWalletAmount,
              transactionType: 'credit',
              description: `Refund for returned order product ,productId: ${productId}`,
              createdAt: new Date()
          };

          // Update the user's wallet
          user.wallet.amount = newWalletAmount;
          user.wallet.walletHistory.push(walletHistoryEntry);
          await user.save();
      }

      product.returned = true;
      product.orderStatus = false;
      product.orderValid = false;

        // Increment the stock count of the returned product
        const dbProduct = await productModel.findById(productId);
        if (dbProduct) {
            dbProduct.quantity += product.quantity; // Ensure this matches the product quantity in the order
            await dbProduct.save();
        }

      await dbOrder.save();

      return res.status(200).json({ message: 'Product returned successfully' });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};




  exports.paymentPendingPost = async ( req, res ) => {
    const { userId, rzr_orderId } = req.body;
    console.log(userId, rzr_orderId);
    try{
        const order = await orderModel.findOne({ rzr_orderId: rzr_orderId });
        console.log(order);
        if(!order) return res.status(404).json({ error: "Order not found" });
        order.pending = false;
        order.paymentMethod = "razorpay";
        const result = await order.save();
        console.log(result)
        if(!result) return res.status(404).json({ error: "Order failed" });
        res.status(200).json({ success: true, message: 'Order Payment was successful.' });
    }catch(err){
        console.error(`Error at paymentPendingPost ${err}`)
    }
}