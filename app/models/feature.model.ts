import { Schema, model, Document } from 'mongoose';

// Définition du schéma de l'utilisateur
export interface IFeature extends Document {
    title: string;
    description: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

const featureSchema = new Schema<IFeature>({
    title: { type: String, required: true },
    description: { type: String, required: false },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Création du modèle User à partir du schéma
const Feature = model<IFeature>('Feature', featureSchema);
     

export default Feature;
