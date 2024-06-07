

const otpModel = require('../models/db-otp');
const userModel = require('../models/user')
const productModel = require('../models/products')
const categoryModel = require('../models/category');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');




exports.userHomeGet = ( req, res) => {
    try {
         res.render('home.ejs');
    } catch (error) {
        console.log(error.message)
    }
   
}



exports.userSignupGet = ( req, res ) => {
    res.render('signup.ejs', { userIn: req.session.userIn });
}



    exports.validateSignupBody = async (req, res, next ) => {

        console.log('enter in to validatesignupbody');

        const body = { username, email, password, passwordRe } = req.body;
        req.session.userEmail = email;
        req.session.signupBody = body;
        console.log(req.session);
        console.log(req.body);

        const isEmailValid = (email) => {
        const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g
        return emailRegex.test(email)
        }


        if(!username || !email || !password || !passwordRe ){
        console.log('error 1');
        return res.status(400).json({ error: 'All fields are required'});
        }

        if(!isEmailValid(email)){
        console.log('error 2');
        return res.status(400).json({ error: 'email structure is not right'});
        }
        
        if(password !== passwordRe){
        console.log('error 3');
        return res.status(400).json({ error: 'password is not matching'});
        }
        
        const isUnique = await userModel.findOne({ email });
        if(isUnique){
        console.log('not unique, error 4');
        return res.status(400).json({ error: 'email is already registered'});
        }

        console.log('validateSingupbody is finished');
        res.json({ message: 'validation is alright'});
    }




    exports.sendOtp = async ( req, res , next ) => {

        console.log('send otp');
        if(req.body.email){
            req.session.userEmail = req.body.email;
        }
        const email = req.session.userEmail
        console.log('email : ' + email );
        const otpGen = require('otp-generator');

        const otp = otpGen.generate( 6, { 
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false, 
            specialChars: false,
        })

        console.log('otp : ' + otp );

        const newDoc = { user: req.session.userEmail, otp };
        console.log('newDoc : ' + newDoc.user, newDoc.otp);
        const docRes = await new otpModel(newDoc)
                .save();

        console.log(docRes);

        const nodemailer = require('nodemailer');
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'sending email to you',
            text: `Your otp to verify your account is ${otp}, Thank you`
        }

        transport.sendMail( mailOptions, async ( err, info ) => {
            if(err) console.log('error : ' + err);
            else{
                
                console.log('success : ' + info.response );
            }
        })

    next();
    }




    exports.signupOtpGet = ( req, res) => {
        res.render('signupOtp.ejs');
    }




    exports.signupOtpPost = async (req, res) => {
        const { otp } = req.body;
        try {
            // Use await with exec() to execute the query and await the result
            const dbOtp = await otpModel.findOne({ otp }).exec();
    
            console.log(`otp : ${otp}, dbOtp :, ${dbOtp}, email : ${req.session.userEmail}`);
    
            if(!otp){
                return res.status(400).json({ success: false, error: 'OTP is required' });
            }
    
            if (!dbOtp || !dbOtp.otp ) {
                return res.status(400).json({ success: false, error: 'OTP is wrong' });
            }
    
            if (dbOtp.otp !== otp ) {
                return res.status(400).json({ success: false, error: 'OTP is not correct' });
            }
            console.log(`dbOtp.user: ${dbOtp.user}`);
            console.log(`req.session.userEmail: ${req.session.userEmail}`);
            if (dbOtp.user !== req.session.userEmail ) {
                return res.status(400).json({ success: false, error: 'email is not matching' });
            }
    
            // If OTP matches, return success response
            return res.status(200).json({ success: true, message: 'OTP verification successful' });
        } catch (error) {
            console.error('Error retrieving OTP:', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    };
    



    exports.userSignupPost = async (req, res, next) => {
      try {
          const { username, email, password } = req.session.signupBody;
  
          if (!username || !email || !password) {
              console.error('All fields are required');
              return res.status(400).json({ error: 'All fields are required' });
          }
  
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Create user data object
          const userData = { username, email, password: hashedPassword };
          
          // Save user to the database
          const result = await userModel.create(userData);
          console.log('User created:', result);
  
          // Redirect to login page after successful signup
          res.redirect('/login');
      } catch (error) {
          console.error('Signup error:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
      next();
  };




    exports.redirecToOtp = ( req, res) => {
        res.redirect('/signup/otp');
    }



    exports.loginGet = ( req, res ) => {
        console.log('login');
        res.render('login.ejs');
    }



    exports.loginPost = async (req, res) => {
      const { email, password } = req.body;
  
      const isEmailValid = (email) => {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g;
          return emailRegex.test(email);
      }
  
      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }
  
      if (!isEmailValid(email)) {
          return res.status(400).json({ error: 'Email format is wrong' });
      }
  
      try {
          const userDetails = await userModel.findOne({ email });
          console.log('User Details:', userDetails);
  
          if (!userDetails) {
              return res.status(400).json({ error: 'User not found' });
          }
  
          if (!userDetails.status) {
              return res.status(400).json({ error: 'User is blocked by admin' });
          }
  
          const match = await bcrypt.compare(password, userDetails.password);
          console.log('Password Match:', match);
  
          if (match) {
              req.session.userIn = true;
              req.session.user = userDetails;
              console.log('Session User:', req.session.user);
  
              return res.status(200).json({ success: true, message: 'Authentication successful' });
          } else {
              return res.status(400).json({ error: 'Incorrect password' });
          }
      } catch (error) {
          console.error('Login error:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }
  }



    exports.userLogout = ( req, res ) => {
        delete req.session.userIn;
        delete req.session.user;
        res.redirect(`/`);
    }





// Render the forgot password form
exports.getForgotPasswordForm = (req, res) => {
  res.render('forgot-password');
};




// Handle forgot password request
exports.forgotPassword = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await userModel.findOne({ email });
  
      if (!user) {
        // Handle user not found error
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the provided OTP is valid and not expired
    if (user.resetPasswordOTP === otp && user.resetPasswordExpiry > Date.now()) {
      // Redirect to the reset-password page with the email as a query parameter
      return res.status(200).json({ success: true });
    }
  
      // Generate OTP if not provided
      if (!otp) {
        const newOTP = crypto.randomInt(100000, 999999).toString();
  
        // Save OTP and expiry in the user document
        user.resetPasswordOTP = newOTP;
        user.resetPasswordExpiry = Date.now() + 120000; // 2 minutes from now
        await user.save();
  
        // Send OTP email
        const transporter = nodemailer.createTransport({
          // Configure your email transport options
          service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for resetting your password is: ${newOTP}\n\nThis OTP will expire in 2 minutes.`
        };
  
        await transporter.sendMail(mailOptions);
  
        return res.status(200).json({ message: 'OTP sent to your email' });
      }
  
      // Check if the provided OTP is valid and not expired
      if (user.resetPasswordOTP !== otp || user.resetPasswordExpiry < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
  
      // Redirect to the reset-password page with the email as a query parameter
      res.redirect(`/reset-password?email=${email}`);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
 
 

 // Render the reset password form
exports.getResetPasswordForm = (req, res) => {
    const email = req.query.email;
    const successMessage = req.query.success ? decodeURIComponent(req.query.success) : undefined;
    res.render('reset-password', { email, successMessage });
  };

// Handle reset password request
exports.resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      // Handle user not found error
      return res.status(404).json({ error: 'User not found' });
    }

    if (password !== confirmPassword) {
      // Handle password mismatch error
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Update user password and remove OTP and expiry
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};








    exports.productGet = async ( req, res ) => {
        try{
            const productId = req.params.productId;
            const product = await productModel.findById( productId );
            const category = await categoryModel.findOne({ _id: product.category });
            res.render('product.ejs', { product, category, userIn: req.session.userIn } );
           
        }
        catch(error){
            console.log(`error inside productGet : ${error}`);
        }
    }
    
    
    
    
    
    exports.productListGet = async ( req, res ) => {
        try{
            const products = await productModel.find({ status: { $ne: false } });
            const totalDocs = products.length;
            const categorys = await categoryModel.find({});
            res.render('product-list.ejs', { products, totalDocs, userIn: req.session.userIn, categorys });
       }
       catch(error){
        console.log('error in productListGet: ' + error );
        }
    }
    
    
    
    exports.productListGetSortBy = async (req, res) => {
        try {
          const { sortBy } = req.params;
          const { search = "", category = "", min = 0, max = Infinity } = req.query;
          const categories = category ? category.split(",") : [];
          const pipeline = [
            {
              $match: {
                status: { $ne: false },
                name: { $regex: search, $options: "i" },
                ...(categories.length && { category: { $in: categories } }),
                price: { $gte: parseInt(min), $lte: parseInt(max) }
              }
            }
          ];

    
      
          // Sort pipeline based on the selected option
          if (sortBy === "a-to-z") {
            pipeline.push({ $sort: { name: 1 } });
          } else if (sortBy === "z-to-a") {
            pipeline.push({ $sort: { name: -1 } });
          } else if (sortBy === "low-to-high") {
            pipeline.push({ $sort: { price: 1 } });
          } else if (sortBy === "high-to-low") {
            pipeline.push({ $sort: { price: -1 } });
          } else if (sortBy === "new-arrivals") {
            pipeline.push({ $sort: { createdAt: -1 } });
          }
      
          const products = await productModel.aggregate(pipeline);
          const categorys = await categoryModel.find({});
      
          res.render('product-list.ejs', {
            products,
            totalDocs: products.length,
            userIn: req.session.userIn,
            categorys,
            sortBy,
          
          });
        } catch (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        }
      };
    
    
    
    
    
    
    exports.sortFilterGet = async (req, res) => {
        try {
            // Extract query parameters
            const sortBy = req.query.sort;
            const search = req.query.search || "";
            let category = req.query.category || [];
            const min = parseInt(req.query.min) || 0;
            const max = parseInt(req.query.max) || Infinity;
    
            console.log(sortBy, search, category, min, max);
    
            // Define sort criteria based on sortBy parameter
            let sortCriteria;
            if (sortBy === "a-to-z") sortCriteria = { name: 1 };
            else if (sortBy === "z-to-a") sortCriteria = { name: -1 };
            else if (sortBy === "low-to-high") sortCriteria = { price: 1 };
            else if (sortBy === "high-to-low") sortCriteria = { price: -1 };
            else if (sortBy === "new-arrivals") sortCriteria = { created_at: -1 };
    
            // Build query for filtering products
            let query = productModel.find({ name: { $regex: search, $options: "i" } });
            // console.log(query)
    
            // Apply additional filters
            if (category.length>0) {
                let categories = category.split(',');
                console.log('categories : ');
                console.log(categories);
                query.where('category').in(categories);
            }
          
            query.where('price').gte(min).lte(max);
    
            // Apply sorting criteria
            if (sortCriteria) {
                query.sort(sortCriteria);
                // console.log(sortCriteria)
            }
    
            // Execute the query
            const products = await query.exec();
    
          
    
            // Return the filtered and sorted products
            return res.status(200).json({ success: true, data: products });
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };


 







