import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  swaggerDefinition: {
    swagger: '2.0',
    // servers: [{ url: '/api' }],
    host: process.env.CLIENT_API_URL,
    basePath: '/api/v1',    
    info: {
      title: 'HarmonyStack API-NodeJS',
      version: '1.0.0',
      description: `Rest API HarmonyStack NodeJS.`,
    },
    securityDefinitions: {
      xsrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-XSRF-TOKEN'
      },
    },
    security: [
      {
        xsrfToken: []
      }
    ]
  },
  apis: ["./app/routes/*.ts"],
}

const specs = swaggerJsdoc(options)

export default specs;


