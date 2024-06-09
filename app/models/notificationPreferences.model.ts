import { Schema, model, Document } from 'mongoose';

// Definition of the NotificationPreferences schema
export interface INotificationPreferences extends Document {
    userId: Schema.Types.ObjectId;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pushEnabled: { type: Boolean, required: true },
    emailEnabled: { type: Boolean, required: true },
    smsEnabled: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the createdAt and updatedAt fields
notificationPreferencesSchema.pre('save', function(this: INotificationPreferences, next: any) {
    this.updatedAt = new Date();
    next();
});

// Creation of the NotificationPreferences model from the schema
const NotificationPreferences = model<INotificationPreferences>('NotificationPreferences', notificationPreferencesSchema);

export default NotificationPreferences;
