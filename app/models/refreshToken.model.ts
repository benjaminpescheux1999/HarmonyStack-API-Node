import { Schema, model, Document } from 'mongoose';

// Définition du schéma de l'utilisateur
export interface IRefreshToken extends Document {
    refreshToken?: string;
    userId?: Schema.Types.ObjectId;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    refreshToken: { type: String },
    userId: { type: Schema.Types.ObjectId },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Création du modèle User à partir du schéma
const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
     

export default RefreshToken;
