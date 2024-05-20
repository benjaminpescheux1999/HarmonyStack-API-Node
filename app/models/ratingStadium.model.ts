import { Schema, model, Document, Types } from 'mongoose';

// Définition du schéma des notes des stades
export interface IRatingStadium extends Document {
    userId: Types.ObjectId;
    recordid: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ratingStadiumSchema = new Schema<IRatingStadium>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    recordid: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Création du modèle RatingStadium à partir du schéma
const RatingStadium = model<IRatingStadium>('RatingStadium', ratingStadiumSchema);
     

export default RatingStadium;
