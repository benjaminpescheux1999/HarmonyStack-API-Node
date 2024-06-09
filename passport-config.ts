import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from './app/models/index.model';
import bcrypt from 'bcrypt';
import { Request } from 'express';


// Configuration of the local strategy (username and password)
passport.use(new LocalStrategy({
  usernameField: 'email', // The field used as username
  passwordField: 'password', // The field used as password
  passReqToCallback: true // Passes req to the callback
}, async (req:Request & { t?:any } , email: string, password: string, done) => {
  const t = req.t;
  try {
      // Searching for the user in the database
      const user = await User.findOne({ email });

      // If the user is not found
      if (!user) {
          return done(null, false, { message: t('middleware_auth.login_failed') });
      }

      // Password verification
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return done(null, false, { message: t('incorrect_password') });
      }

      // If the user is found and the password matches
      return done(null, user);
  } catch (error) {
      console.log(t('internal_server_error'), error);
      return done(error);
  }
}));

const cookie_Access_token_Extractor = (req: any) => {
  let token = null;  
  if (req && req.cookies) {    
    token = req.cookies['access_token'];
  }  
  return token;
};

// Configuration of the JWT strategy
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookie_Access_token_Extractor]), // Using the custom function to extract the token from the cookie
  secretOrKey: String(process.env.JWT_SECRET), // Secret key to verify the access token
  passReqToCallback: true // Passes req to the callback

}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
}));


// Custom function to extract the token from the cookie
const cookie_Refresh_token_Extractor = (req: any) => {
  let token = null;  
  if (req && req.cookies) {    
    token = req.cookies['refresh_token'];
  }
  return token;
};

// Configuration of the refresh token strategy
passport.use('refresh-token', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookie_Refresh_token_Extractor]), // Using the custom function to extract the token from the cookie
  secretOrKey: String(process.env.REFRESH_TOKEN_SECRET), // Secret key to verify the refresh token
  passReqToCallback: true // Passes req to the callback
}, async (req: any, payload, done) => {
  const t = req.t;
  try {

    // Retrieve the user from the token payload
    const user = await User.findById(payload.sub);

    // If the user is found
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
}));


