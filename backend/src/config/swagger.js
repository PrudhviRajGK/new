const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kraya-AI API Documentation',
      version: '1.0.0',
      description: 'WhatsApp-First AI Sales Automation & Lead Management Platform API',
      contact: {
        name: 'Kraya-AI Support',
        email: 'support@kraya.ai'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.controller.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kraya-AI API Docs'
  }));
};

module.exports = { setupSwagger, specs };
