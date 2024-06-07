const passport= require('passport');

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID, //credentials here
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL:  "http://localhost:3000/userVerification/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // console.log('Google authentication callback reached.');
    // console.log('Profile:', profile);
    return done(null,profile )
  }
)); 

passport.serializeUser((user, done)=> {
  done(null,user.id);
});


passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
      done(err, user); // Deserialize the user object
  });
});