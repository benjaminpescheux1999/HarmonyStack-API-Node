import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  swaggerDefinition: {
    swagger: '2.0',
    // servers: [{ url: '/api' }],
    host: 'localhost:5000',
    basePath: '/api/v1',
    info: {
      title: 'HarmonyStack API-NodeJS',
      version: '1.0.0',
      description: 'Rest API HarmonyStack NodeJS',
    },
    securityDefinitions: {
      xsrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-XSRF-TOKEN'  // Assurez-vous que le nom correspond à celui attendu par votre serveur
      }
    },
    security: [
      {
        xsrfToken: []
      }
    ]
  },
  apis: ["./app/routes/*.ts"],
  // apis: ['**/*.ts'],
}

const specs = swaggerJsdoc(options)

export default specs;


