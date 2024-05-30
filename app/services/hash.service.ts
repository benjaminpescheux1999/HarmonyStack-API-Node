import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Hash Password
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

// Generate xsrf token
export const generateXsrfToken = async (): Promise<string> => {
    return crypto.randomBytes(64).toString('hex');
};

// Generate refresh token in base64
export const generateBase64RefreshToken = async (): Promise<string> => {
    return crypto.randomBytes(128).toString('base64');
};
