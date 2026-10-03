const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OL MCQ Practice API',
      version: '1.0.0',
      description: 'API for OL Past Paper MCQ Practice Mobile App - Sri Lankan Students (Sinhala Medium)',
      contact: {
        name: 'SiyanaCode Org',
        url: 'https://github.com/siyana-code/ol-mcq-practice',
      },
    },
    servers: [
      {
        url: 'https://siyana-mcq.onrender.com',
        description: 'Production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
    ],
    components: {
      schemas: {
        Subject: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name_si: { type: 'string', example: 'ගණිතය' },
            name_en: { type: 'string', example: 'Mathematics' },
            icon: { type: 'string', example: 'calculator' },
            sort_order: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Topic: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            subject_id: { type: 'string', format: 'uuid' },
            name_si: { type: 'string', example: 'බිදුම්' },
            name_en: { type: 'string', example: 'Fractions' },
            sort_order: { type: 'integer' },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            topic_id: { type: 'string', format: 'uuid' },
            paper_id: { type: 'string', format: 'uuid' },
            question_text_si: { type: 'string' },
            question_text_en: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text_si: { type: 'string' },
                  text_en: { type: 'string' },
                },
              },
            },
            correct_answer: { type: 'integer' },
            explanation_si: { type: 'string' },
            explanation_en: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            image_url: { type: 'string' },
          },
        },
        PastPaper: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            subject_id: { type: 'string', format: 'uuid' },
            year: { type: 'integer', example: 2023 },
            paper_number: { type: 'integer', example: 1 },
            title_si: { type: 'string' },
            title_en: { type: 'string' },
            pdf_url: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar_url: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
