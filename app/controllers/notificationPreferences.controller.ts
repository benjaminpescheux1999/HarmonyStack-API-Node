import { Request, Response } from 'express';
import { NotificationPreferences } from '../models/index.model';

export const getNotificationPreferences = async (req: Request & {user?:any, t?:any}, res: Response) => {
    const t = req.t;
    try {
        const userId = req.user._id;
        const notificationPreferences = await NotificationPreferences.findOne({ userId }).select('-_id -updatedAt -createdAt');
        if (!notificationPreferences) {
            return res.status(404).send({ message: 'Notification preferences not found' });
        }
        return res.status(200).send(notificationPreferences);
    } catch (error) {
        return res.status(500).send({ message: 'Internal server error' });
    }
}

export const updateNotificationPreferences = async (req: Request & {user?:any, t?:any}, res: Response) => {
    const t = req.t;
    try {
        // Vérifier si l'identifiant de l'utilisateur existe
        if (!req.user || !req.user._id) {
            res.status(404).send({ error: t('user_not_found'), label: 'user'});
            return;
        }
        const userId = req.user._id;

        const { pushEnabled, emailEnabled, smsEnabled } = req.body;

        const notificationPreferences = await NotificationPreferences.findOne({ userId });
        if (!notificationPreferences) {
            return res.status(404).send({ message: 'Notification preferences not found' });
        }

        // Mise à jour des préférences de notification
        notificationPreferences.pushEnabled = pushEnabled;
        notificationPreferences.emailEnabled = emailEnabled;
        notificationPreferences.smsEnabled = smsEnabled;
        const updatedNotificationPreferences = await notificationPreferences.save();

        // Vérifier si les mises à jour ont été correctement enregistrées
        if (updatedNotificationPreferences.pushEnabled === pushEnabled &&
            updatedNotificationPreferences.emailEnabled === emailEnabled &&
            updatedNotificationPreferences.smsEnabled === smsEnabled) {
                return res.status(200).send(updatedNotificationPreferences);
        } else {
            return res.status(500).send({ message: 'Failed to update notification preferences' });
        }
    } catch (error) {
        return res.status(500).send({ message: 'Internal server error' });
    }
};