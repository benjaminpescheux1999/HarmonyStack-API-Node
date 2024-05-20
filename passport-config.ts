import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from './app/models/index.model';
import bcrypt from 'bcrypt';
import { Document, Types } from 'mongoose';

// Configuration de la stratégie locale (nom d'utilisateur et mot de passe)
passport.use(new LocalStrategy({
  usernameField: 'email', // Le champ utilisé comme nom d'utilisateur
}, async (email: string, password: string, done) => {
  try {
      // Recherche de l'utilisateur dans la base de données
      const user = await User.findOne({ email });

      // Si l'utilisateur n'est pas trouvé
      if (!user) {
          return done(null, false, { message: 'Aucun utilisateur trouvé avec cet email' });
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return done(null, false, { message: 'Mot de passe incorrect' });
      }

      // Si l'utilisateur est trouvé et le mot de passe correspond
      return done(null, user);
  } catch (error) {
      console.log("error", error);
      return done(error);
  }
}));

const cookie_Access_token_Extractor = (req: any) => {
  let token = null;  
  if (req && req.cookies) {    
    token = req.cookies['access_token'];
  }
  console.log("token", token);
  
  return token;
};

// Configuration de la stratégie JWT
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookie_Access_token_Extractor]),
  secretOrKey: String(process.env.JWT_SECRET)
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


// Fonction personnalisée pour extraire le token du cookie
const cookie_Refresh_token_Extractor = (req: any) => {
  let token = null;  
  if (req && req.cookies) {    
    token = req.cookies['refresh_token'];
  }
  return token;
};

// Configuration de la stratégie de rafraîchissement de token
passport.use('refresh-token', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookie_Refresh_token_Extractor]), // Utilisation de la fonction personnalisée pour extraire le token du cookie
  secretOrKey: String(process.env.REFRESH_TOKEN_SECRET), // Clé secrète pour vérifier le token de rafraîchissement
}, async (payload, done) => {
  try {
    console.log("payload", payload);

    // Récupérer l'utilisateur à partir du payload du token
    const user = await User.findById(payload.sub);

    // Si l'utilisateur est trouvé
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
}));


