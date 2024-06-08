
const userModel = require('../models/user')
const orderModel = require('../models/order.js');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');

 
 
 
 
 exports.dashboardGet = async (req, res) => {
    const user = await userModel.findById(req.session.user._id);
    const orders = await orderModel
      .find({ userId: req.session.user._id })
      .populate('products.productId')
      .sort({ orderDate: -1 });
  
    for (let order of orders) {
      let isArriving = false;
      let isDelivered = true;
      let isCancelled = false;
      let isReturned = false;
  
      for (let product of order.products) {
        if (product.orderValid && !product.orderStatus && !product.returned) {
          isArriving = true;
          isDelivered = false;
        } else if (!product.orderValid && product.orderStatus && !product.returned) {
          // Do nothing, this product is delivered
        } else if (!product.orderValid && !product.orderStatus && !product.returned) {
          isCancelled = true;
          isDelivered = false;
        } else if (!product.orderValid && !product.orderStatus && product.returned) {
          isReturned = true;
          isDelivered = false;
        }
      }
  
      if (isArriving) {
        order.orderMessage = 'Arriving';
      } else if (isDelivered) {
        order.orderMessage = 'Delivered';
      } else if (isCancelled) {
        order.orderMessage = 'Cancelled';
      } else if (isReturned) {
        order.orderMessage = 'Returned';
      } else {
        order.orderMessage = '...';
      }
    }
  
    res.render('dashboard.ejs', { userIn: req.session.userIn, user, orders });
  };


  exports.DashboardUserDetailsPatch = async ( req, res ) => {
    const { username, email, oldpassword, password, passwordre, referal_code } = req.body;
    const userSessionEmail = req.session.user.email; 
    console.log(username, email )
    if(!username || !email){
        return res.status(400).json({ error: 'username and email is required'});
    }
    if(email !== userSessionEmail){
        console.log(userSessionEmail);
        return res.status(400).json({ error: `please signin through ${userSessionEmail}`})
    }
    if(( password && passwordre ) && (password !== passwordre) ){
        return res.status(400).json({ error: 'password is not matching'});
    }
    if( password && password < 6 ){
        return res.status(400).json({ error: 'password need atlease 6 charcters'});
    }
    try{
        if( referal_code ) {
            let result = await userModel.findOne({ referalCode: referal_code});
            if( result ) return res.json({ error: 'try another referal code'});
        }
        if(!oldpassword || oldpassword == ''){
            const result = await userModel.updateOne({ email: userSessionEmail}, { $set: { username: username, referalCode: referal_code }});
            console.log(result);
            return res.status(200).json({ success: true, message: 'userDetails updated successfully'});
        } else{
            const passwordMatch = await bcrypt.compare( oldpassword, req.session.user.password );
            if(!passwordMatch) return res.status(400).json({ error: 'password is wrong'});

            const hashedPassword = await bcrypt.hash( password , parseInt(process.env.SALTROUNDS ));
            const result = await userModel.findOneAndUpdate({ email: userSessionEmail }, { $set: { username, password: hashedPassword, referalCode: referal_code }}, { new: true } );
            console.log(result);
            req.session.user.username = username;
            return res.status(200).json({ success: true, message: 'userDetails updated successfully'});
        }
    }
    catch(err){
        console.error(err);
    }
}


exports.addAddressPatch = async (req, res) => {
  try {
      const userId = req.params.userId;
      const { name, email, phone, pincode, state, country, altphone, city, landmark } = req.body;

      // Validate the address data
      const validationResult = validateAddress(name, email, phone, pincode, state, country, altphone, city, landmark);
      if (!validationResult.success) {
          return res.status(400).json({ success: false, error: validationResult.message });
      }

      // Find the user by ID
      const user = await userModel.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Add the address to the user's addresses array
      user.address.push({ name, email, phone, pincode, state, country, alt_phone: altphone, city, landmark });

      // Save the user document
      await user.save();

      return res.status(200).json({ success: true, message: 'User address added successfully', user });
  } catch (err) {
      console.error(`Error in addAddressPatch: ${err}`);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


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



exports.deleteAddress = async ( req, res ) => {
const addressId = req.params.addressId;
const user = await userModel.findById(req.session.user._id);
if(!user){
    res.status(400).json({ error: 'user not found again, login again'});
}else{
    // const address = user.address.find( address => address._id == addressId );
    const addressIndex = user.address.findIndex( address => address._id == addressId );
    user.address.splice(addressIndex, 1);
    await user.save();
    res.status(200).json({ success: true, message: 'address successfully removed.' });
}
}

exports.addressEditGet =  async ( req, res ) => {
    try{
        console.log('hellow enter')
        const addressId = req.params.addressId;
        const user = await userModel.findById(req.session.user._id);
        if(!user) return res.status(400).json({ error: 'user session expired, login again'});
        const selectedAddress = user.address.find( address => address._id.toString() === addressId );
        console.log('selectedAddress : ' + selectedAddress );
        return res.status(200).json(selectedAddress);
    }catch(err){
        console.log(err);
    }
    }




exports.addressUpdatePatch = async (req, res) => {
  const addressId = req.params.addressId;
  const userId = req.params.userId;
  try {
      const user = await userModel.findById(userId);
      if (!user) return res.status(400).json({ error: 'User session expired, login again' });

      // Find the index of the address in the user's addresses array
      const addressIndex = user.address.findIndex(address => address._id == addressId);
      if (addressIndex === -1) return res.status(400).json({ error: 'User address not found' });

      // Update the fields of the found address
      const { name, email, phone, pincode, state, country, altphone, city, landmark } = req.body;
      const validationResult = validateAddress(name, email, phone, pincode, state, country, altphone, city, landmark); // Pass landmark as an argument
      if(!validationResult.success) {
          return res.status(400).json({ success: false, error: validationResult.message, hai: 'hai' });
      }

      // Update the specific address within the array
      user.address[addressIndex].name = name;
      user.address[addressIndex].email = email;
      user.address[addressIndex].phone = phone;
      user.address[addressIndex].pincode = pincode;
      user.address[addressIndex].state = state;
      user.address[addressIndex].country = country;
      user.address[addressIndex].alt_phone = altphone;
      user.address[addressIndex].city = city;
      user.address[addressIndex].landmark = landmark;

      // Save the updated user document
      await user.save();

      return res.status(200).json({ success: true, message: 'User address updated successfully', user: user });

  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
}



exports.addWalletAmount = async ( req, res ) => {
    const userId = req.params.userId;
    const amount = req.params.amount;
    try{
        if(!userId) return res.status(403).json({ error: 'user not found, login again' });
        if(!amount) return res.status(403).json({ error: 'Please enter an amount' });
        const user = await userModel.findById(userId);
        if(!user.wallet.amount) user.wallet.amount = 0;
        user.wallet.amount += parseInt(amount);
        await user.save();
        return res.status(200).json({ success: true, message: `${amount}Rs added to wallet` });
    }catch(error){
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  }






exports.genInvoice = async ( req, res ) => {
    const orderId = req.params.orderId;
  
    const doc = new PDFDocument({ font: 'Helvetica', margin: 50});
    doc.pipe(res);
  
    const order = await orderModel.findById(orderId).populate('products.productId');
    
    genInvoicePdf(doc, orderId, order );
  
    doc.end();
  }
  
  
  function genInvoicePdf(doc, orderId, order ) {
  
    doc.fontSize(18).font('Helvetica-Bold').text('Invoice', { align: 'center' })
        .moveDown();
  
    doc.font('Helvetica-Bold').fontSize(10).text(`Date : ${new Date(Date.now()).toLocaleDateString()}`, { align: 'right'});
  
    doc.font('Helvetica-Bold').fontSize(14).text('Zeekon');
    doc.moveDown(0.3)
        .font('Helvetica')
        .fontSize(8).text(`Abcd street`)
        .fontSize(8).text(`Calicut, Kerala, 673507`)
        .fontSize(8).text(`1800-208-9898`)
        .fontSize(8).font('Helvetica-Bold').text(`orderId : ${orderId}`, { align: 'right'});
  
    generateHr(doc, doc.y + 10);
    let y = doc.y + 20;
    doc.font('Helvetica-Bold').text('No', 60, y)
        .text('product', 100, y)
        .text('Quantity', 220, y)
        .text('Price', 275, y)
        .text('Discount Price',350,y)
        .text('Total', 500, y);
  
    generateHr(doc, doc.y + 10);
  
    y += 40;
  
    order.products.forEach(( item, index ) => {
        
        doc.font('Helvetica').text(`${index + 1}`, 60, y)
        .text(`${item.productId.name}`, 100, y)
        .text(`${item.quantity}`, 220, y)
        .text(`${item.productId.price}`, 275, y)
        .text(`${item.productId.discountPrice}`, 350, y)
        .text(`${item.productTotalPrice}`, 500, y);
  
        y += 20;
    });
  
    generateHr(doc, doc.y + 10);
    y+= 20;
     
    order.products.forEach(( item, index ) => {
    doc.font('Helvetica').text(`subTotal : ${ item.productTotalPrice }`, 450, y );
  });
    // doc.font('Helvetica').text(`Delivery : ${ 0 }`, 450, y + 20 );
    doc.moveDown();
  
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(450, doc.y).lineTo(550, doc.y).stroke();
    
    doc.moveDown();
    order.products.forEach(( item, index ) => {
      doc.font('Helvetica-Bold').text(`subTotal : ${ item.productTotalPrice }`);
    })
  
    return;
  };
  
   
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }


  exports.userLogout = ( req, res ) => {
    delete req.session.userIn;
    delete req.session.user;
    res.redirect(`/`);
}