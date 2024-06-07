const userModel = require('../models/user')





exports.wishlistGet =  async ( req, res ) => {
    const user = await userModel.findById(req.session.user._id).populate('wishlist.product_id');
    console.log(user);
    res.render('wishlist.ejs', { userIn: req.session.userIn, user });
}


exports.wishlistPost = async ( req, res ) => {
    const productId = req.params.productId;
    console.log(productId);
    try{
        if(!productId || productId === undefined ) return res.status(400).json({ error: 'product Id not found' });
        if(!req.session.user) return res.status(400).json({ redirect: '/login', error: 'User Not found, login again'});
        const user = await userModel.findById(req.session.user._id);
        const existingItem = user.wishlist.find(
            (item) => item.product_id.toString() === productId
        );
      
        if (existingItem) return res.status(400).json({ error: 'Product already exists in wishlist' });

        user.wishlist.push({ product_id: productId });
        user.save();
        console.log(user);
        if(user) return res.status(200).json({ success: true, message: 'product added to wishlist' })
        else return res.status(400).json({ error: `can't add product into wishlist`});
    }catch(err){
        console.log(err);
    }
}


exports.wishlistDelete = async ( req, res) => {
    const productId = req.params.productId;
    try{
        const user = await userModel.findById(req.session.user._id);
        user.wishlist.pull({ _id: productId});
        const result = await user.save();

       if(result) res.status(200).json({ success: true, message: 'product removed from the wishlist'})
       else res.status(400).json({ error: "something went wrong can't remove the product in wishlist"});
    }catch(err){
        console.log(err);
    }
}