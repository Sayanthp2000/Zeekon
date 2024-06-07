const orderModel = require('../models/order');



exports.orderGet = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ orderDate: -1 }).populate('products.productId');

    for (let order of orders) {
      for (let product of order.products) {
        if( order.pending ) {
          product.orderMessage = "Pending";
        } else if (product.orderValid && !product.orderStatus && !product.returned) {
          product.orderMessage = 'Arriving';
        } else if (!product.orderValid && product.orderStatus && !product.returned) {
          product.orderMessage = 'Delivered';
        } else if (!product.orderValid && !product.orderStatus && !product.returned) {
          product.orderMessage = 'Cancelled';
        } else if (!product.orderValid && !product.orderStatus && product.returned) {
          product.orderMessage = 'Return';
        } else {
          product.orderMessage = '...';
        }
      }
    }

    res.render('admin-order.ejs', { orders });
  } catch (err) {
    console.log(err);
  }
};

exports.orderStatusPatch = async (req, res) => {
  try {
    const { orderStatus, returned, orderValid, pending, orderId, productId } = req.body;
    console.log(orderStatus, returned, orderValid, pending, orderId, productId);
    if (!orderId || !productId) {
      return res.status(400).json({ error: 'orderId or productId, is not available, login again' });
    }

    const order = await orderModel.findById(orderId).populate('products.productId');
    console.log(order);
    const product = order.products.find((p) => { 
      console.log(p.productId._id.toString(), productId);
      return p.productId._id.toString() === productId;
    });
    console.log(product);
    order.deliveredAt = Date.now()
    if(product.orderStatus) product.deliveredAt = Date.now();

    if(pending) order.pending = pending;

    if (product) {
      product.orderStatus = orderStatus;
      product.returned = returned;
      product.orderValid = orderValid;

      await order.save();
      res.json({ message: 'Product status updated successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};