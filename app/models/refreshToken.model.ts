import { Schema, model, Document } from 'mongoose';

// Definition of the Refresh Token schema
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

// Creation of the RefreshToken model from the schema
const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
     

export default RefreshToken;
