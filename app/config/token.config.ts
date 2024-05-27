export const accessToken = {
    secret: process.env.ACCESS_TOKEN_SECRET,
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM,
    audience: process.env.ACCESS_TOKEN_AUDIENCE,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    issuer: process.env.ACCESS_TOKEN_ISSUER
};