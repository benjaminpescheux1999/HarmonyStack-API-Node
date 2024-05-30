import { Schema, model, Document } from 'mongoose';

// Definition of the user schema
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

// Update the modification date
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Creation of the User model from the schema
const User = model<IUser>('User', userSchema);
     

export default User;
