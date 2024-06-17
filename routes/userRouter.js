const express = require('express');
const userController = require('../controllers/userController');
const profileController = require('../controllers/userProfile');
const cartController = require('../controllers/userCart');
const checkoutController = require('../controllers/userCheckout');
const wishlistController = require('../controllers/userWishlist');
const orderController = require('../controllers/userOrder');
const userAuth = require('../middlewares/authUser');
const google = require('../middlewares/passport')



const router = express.Router();

router.use(express.static('public'));


// Home 
router.get('/', userController.userHomeGet );

// Signup page
router.get('/signup', userController.userSignupGet );
router.post('/signup', userController.validateSignupBody );

router.get('/signup/otp', userController.sendOtp, userController.signupOtpGet );
router.post('/signup/otp/validate', userController.signupOtpPost );
router.get('/post-user', userController.userSignupPost );

// Login
router.get('/login', userAuth.userSessionYes ,userController.loginGet );
router.post('/login', userController.loginPost );

// Forgot Password Routes
router.get('/forgot-password', userController.getForgotPasswordForm);
router.post('/forgot-password', userController.forgotPassword);


// Reset Password Routes
router.get('/reset-password', userController.getResetPasswordForm);
router.post('/reset-password', userController.resetPassword);


router.get('/product-list/', userController.productListGet );
router.get('/product-list/:sortBy', userController.productListGetSortBy );
router.get('/filter', userController.sortFilterGet );
router.get('/product/:productId', userController.productGet );


// User profile

router.get('/dashboard', userAuth.userSessionNo, profileController.dashboardGet );
router.patch('/dashboard/user-details', userAuth.userSessionNo, profileController.DashboardUserDetailsPatch );
router.patch('/address/:userId', profileController.addAddressPatch );
router.delete('/address/:addressId', profileController.deleteAddress );
router.get('/address/edit/:addressId', profileController.addressEditGet );
router.patch('/address/update/:addressId/:userId', profileController.addressUpdatePatch );
router.post('/wallet/:userId/:amount', profileController.addWalletAmount);
router.get('/order/invoice/:orderId', profileController.genInvoice );
router.get('/logout', profileController.userLogout );

// Cart

router.get('/cart', userAuth.userSessionNo, cartController.cartGet );
router.patch('/cart/:productId', cartController.cartPatch );
router.patch('/cart/product/:userId/:productId/:nums', cartController.cartCountPatch );
router.patch('/cart/delete/:productId', cartController.cartProductDelete );
router.get('/address/preffered/:addressId', cartController.preferredAddressGet );


// User checkout

router.get('/checkout', userAuth.userSessionNo, checkoutController.checkoutGet );
router.post('/checkout/:userId', checkoutController.checkoutPost );
router.post('/checkout-error/:userId', checkoutController.checkoutErrorPost );
router.get('/checkout-validation', checkoutController.validateCheckoutAddress );
router.get('/coupon/check/:couponCode/:productTotal', checkoutController.couponCheck );
router.get('/remove-coupon/:couponCode', checkoutController.removeCoupon );
router.get('/failed-payment', checkoutController.failedPayment );


// User wishlist

router.get('/wishlist', userAuth.userSessionNo, wishlistController.wishlistGet );
router.post('/wishlist/:productId', wishlistController.wishlistPost );
router.delete('/wishlist/remove/:productId', wishlistController.wishlistDelete );

// User order

router.get('/order/:orderId', orderController.orderSingleGet );
router.patch('/order/cancel/:orderId/:productId', orderController.orderCancellationPath );
router.patch('/order/return/:orderId/:productId', orderController.orderReturnPatch );
router.post('/payment-pending', orderController.paymentPendingPost )




const passport = require('passport'); 


//google login

router.get('/google/Verify',google.googleauth)
router.get('/google/callback',google.goog);



const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEYID, key_secret: process.env.RAZORPAY_KEYSECRET })



router.post('/create/orderId', (req, res) => {
  console.log('Creating order using Razorpay');

  // Get the order details from the request body
  const { amount } = req.body;

  // Create the order options
  const options = {
    amount: amount, // Amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11" // Unique order receipt ID
  };

  // Create the order using the Razorpay instance
  instance.orders.create(options, (err, order) => {
    if (err) {
      console.error('Error creating Razorpay order:', err);
      console.log('Complete Error Object:', err);
      return res.status(500).json({ error: 'Error creating order' });
    }

    console.log('Razorpay order created:', order);
    return res.status(200).json({ orderId: order.id });
  });
});



module.exports = router;