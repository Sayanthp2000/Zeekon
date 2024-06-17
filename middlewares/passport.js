// const passport= require('passport');

// const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


// passport.use(new GoogleStrategy({
//     clientID:     process.env.CLIENT_ID, //credentials here
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL:  "http://localhost:3000/userVerification/google/callback",
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//     // console.log('Google authentication callback reached.');
//     // console.log('Profile:', profile);
//     return done(null,profile )
//   }
// )); 

// passport.serializeUser((user, done)=> {
//   done(null,user.id);
// });


// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//       done(err, user); // Deserialize the user object
//   });
// });

const passport= require('passport')
const User = require('../models/user');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const shortid = require('shortid')



passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/google/callback",
  passReqToCallback: true
},

async function(request, accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ email: profile.email });
    if (!user) {

      const referralCode = shortid.generate();

      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.email,
        password: 'default_password_here', // Set a default password or generate a secure random password
        isVerified: true, // Assuming this field exists
        referralCode: referralCode, // Set default value or adjust as needed
        created_at: new Date(), // Set creation date
        status: true // Assuming this means the user is active
      });

      await user.save();    
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));



passport.serializeUser(function(user,done){
  done(null,user);
})

passport.deserializeUser(function(user,done){
  done(null,user);
})


const googleauth = passport.authenticate('google', { scope: ["email", "profile"] });


const goog = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/signup'); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.session.user = user; 
      return res.redirect('/');
    });
  })(req, res, next);
};



module.exports={
  googleauth,
  goog
}