import { Schema, model, Document } from 'mongoose';

// Définition du schéma de l'utilisateur
export interface IUser extends Document {
    username: string;
    lastname: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

//mettre à jour la date de modification
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Création du modèle User à partir du schéma
const User = model<IUser>('User', userSchema);
     

export default User;
