import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

//Générer xsrf token xsrfToken
export const generateXsrfToken = async (): Promise<string> => {
    return crypto.randomBytes(64).toString('hex');
};

//Générer refresh token en base64
export const generateBase64RefreshToken = async (): Promise<string> => {
    return crypto.randomBytes(128).toString('base64');
};
