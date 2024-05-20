//Générate config for access token signature with structure  const accessToken = jwt.sign(
    //   { firstName: user.firstName, lastName: user.lastName, xsrfToken },
    //   config.accessToken.secret,
    //   {
    //     algorithm: config.accessToken.algorithm,
    //     audience: config.accessToken.audience,
    //     expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
    //     issuer: config.accessToken.issuer,
    //     subject: user.id.toString()
    //   }
    // );

    export const accessToken = {
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithm: process.env.ACCESS_TOKEN_ALGORITHM,
        audience: process.env.ACCESS_TOKEN_AUDIENCE,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        issuer: process.env.ACCESS_TOKEN_ISSUER
    };